"""Read and update records in a Recipe Database exported by EasyBuilder Pro.

The editor receives the *current project's* native SQLite .db export. It never
creates a schema: recipe definitions and all tables not named in the request
remain in the copied database for EasyBuilder Pro's native import.
"""

import hashlib
import json
import math
import pathlib
import sqlite3
import sys
from contextlib import closing


def quote(name):
    return '"' + name.replace('"', '""') + '"'


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(65536), b''):
            h.update(block)
    return h.hexdigest().upper()


def catalog(db):
    tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    result = {}
    for name in sorted(tables):
        if name.endswith('.info') or name.startswith('sqlite_'):
            continue
        if name + '.info' not in tables:
            continue
        columns = db.execute('PRAGMA table_info(' + quote(name) + ')').fetchall()
        definition = db.execute('SELECT * FROM ' + quote(name + '.info')).fetchall()
        names = [column[1] for column in columns]
        if not names or len(names) != len(set(names)) or [row[0] for row in definition] != names:
            raise ValueError('Native recipe columns and definition rows disagree: ' + name)
        result[name] = {
            'columns': [{'name': column[1], 'sqlite_type': column[2],
                         'native_item_type': row[1], 'native_size': row[2]}
                        for column, row in zip(columns, definition)],
            'definition_rows': definition,
            'count': db.execute('SELECT COUNT(*) FROM ' + quote(name)).fetchone()[0],
        }
    if not result:
        raise ValueError('No native Recipe Database table and matching .info definition')
    return result


def normalize(value, declared, native_size):
    if value is None or isinstance(value, bool):
        raise ValueError('Recipe cell must be a non-null native scalar')
    kind = declared.upper()
    if 'INT' in kind:
        if not isinstance(value, int) or type(native_size) is not int or native_size not in (1, 2, 4, 8):
            raise ValueError('Recipe integer native field size/type differs')
        bits = 8 * native_size
        minimum, maximum = (0, (1 << bits) - 1) if 'UNSIGNED' in kind else (-(1 << (bits - 1)), (1 << (bits - 1)) - 1)
        if not minimum <= value <= maximum:
            raise ValueError('Recipe integer cell type/range differs')
    elif 'REAL' in kind or 'FLOAT' in kind or 'DOUBLE' in kind:
        if not isinstance(value, (int, float)) or not math.isfinite(value):
            raise ValueError('Recipe real cell must be finite')
    elif 'TEXT' in kind or 'CHAR' in kind:
        if not isinstance(value, str) or '\x00' in value:
            raise ValueError('Recipe text cell type differs')
    else:
        raise ValueError('Unrecognized native Recipe Database column type: ' + declared)
    return value


def rows(db, name, offset=0, limit=1000):
    fields = [column[1] for column in db.execute('PRAGMA table_info(' + quote(name) + ')')]
    query = 'SELECT rowid,* FROM ' + quote(name) + ' ORDER BY rowid LIMIT ? OFFSET ?'
    return [{'index': offset + i, 'values': dict(zip(fields, row[1:]))}
            for i, row in enumerate(db.execute(query, (limit, offset)))]


def edit_copy(source, output, edits, before):
    if output.exists() or output == source or not output.parent.is_dir():
        raise ValueError('Fresh output .db in an existing directory required')
    if not isinstance(edits, list) or not 1 <= len(edits) <= 1000:
        raise ValueError('One to 1000 Recipe Database record edits required')
    with closing(sqlite3.connect(source.as_uri() + '?mode=ro', uri=True)) as original:
        with closing(sqlite3.connect(output)) as destination:
            original.backup(destination)
            destination.execute('BEGIN IMMEDIATE')
            initial_rowids = {
                name: [row[0] for row in destination.execute(
                    'SELECT rowid FROM ' + quote(name) + ' ORDER BY rowid')]
                for name in before
            }
            seen = set()
            for edit in edits:
                if not isinstance(edit, dict) or edit.get('recipe') not in before:
                    raise ValueError('Existing native recipe name required')
                name = edit['recipe']
                fields = {column['name']: column for column in before[name]['columns']}
                values = edit.get('values')
                if not isinstance(values, dict) or not values or not set(values) <= set(fields):
                    raise ValueError('Nonempty existing native recipe fields required')
                typed = {field: normalize(value, fields[field]['sqlite_type'], fields[field]['native_size']) for field, value in values.items()}
                mode = edit.get('mode')
                if mode == 'append':
                    if set(typed) != set(fields):
                        raise ValueError('Appending a recipe record requires all defined fields')
                    if destination.execute('SELECT COUNT(*) FROM ' + quote(name)).fetchone()[0] >= 10000:
                        raise ValueError('Native recipe record limit reached')
                    columns = list(fields)
                    statement = ('INSERT INTO ' + quote(name) + ' (' + ','.join(map(quote, columns)) +
                                 ') VALUES (' + ','.join('?' for _ in columns) + ')')
                    destination.execute(statement, [typed[column] for column in columns])
                elif mode == 'update':
                    index = edit.get('index')
                    if type(index) is not int or not 0 <= index < len(initial_rowids[name]):
                        raise ValueError('Existing zero-based recipe record index required')
                    if (name, index) in seen:
                        raise ValueError('Duplicate update of one recipe record')
                    seen.add((name, index))
                    columns = list(typed)
                    statement = ('UPDATE ' + quote(name) + ' SET ' +
                                 ','.join(quote(column) + '=?' for column in columns) +
                                 ' WHERE rowid=?')
                    destination.execute(statement, [typed[column] for column in columns] +
                                        [initial_rowids[name][index]])
                else:
                    raise ValueError('Recipe edit mode must be append or update')
            destination.commit()
            if destination.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                raise ValueError('Edited native SQLite integrity check failed')
            after = catalog(destination)
            for name, definition in before.items():
                if after[name]['definition_rows'] != definition['definition_rows']:
                    raise ValueError('Native recipe definition changed unexpectedly')
            return after


def run(request):
    source = pathlib.Path(request['source_db']).resolve(strict=True)
    with source.open('rb') as stream:
        signature = stream.read(16)
    if source.suffix.lower() != '.db' or signature != b'SQLite format 3\x00':
        raise ValueError('Original SQLite Recipe Database .db export required')
    operation = request.get('operation')
    if operation not in ('read', 'apply'):
        raise ValueError('Recipe Database operation must be read or apply')
    source_hash = digest(source)
    with closing(sqlite3.connect(source.as_uri() + '?mode=ro', uri=True)) as db:
        if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise ValueError('Source native SQLite integrity check failed')
        before = catalog(db)
        requested = request.get('recipe')
        if operation == 'read':
            if requested is not None and requested not in before:
                raise ValueError('Requested recipe is not defined in native database')
            offset, limit = request.get('offset', 0), request.get('limit', 1000)
            if type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 1000:
                raise ValueError('Bounded recipe record page required')
            selected = [requested] if requested else list(before)
            return {'ok': True, 'operation': operation, 'source_db': str(source),
                    'source_sha256': source_hash,
                    'recipes': {name: {'columns': before[name]['columns'],
                                       'count': before[name]['count'],
                                       'records': rows(db, name, offset, limit)}
                                for name in selected}}
    output = pathlib.Path(request['output_db']).resolve()
    if output.suffix.lower() != '.db':
        raise ValueError('Fresh native Recipe Database .db output required')
    if output.exists() or output == source:
        raise ValueError('Fresh distinct output database required')
    try:
        after = edit_copy(source, output, request.get('edits'), before)
    except Exception:
        if output.exists():
            output.unlink()
        raise
    if digest(source) != source_hash:
        raise ValueError('Native source export changed during edit')
    return {'ok': True, 'operation': operation, 'source_db': str(source),
            'source_sha256': source_hash, 'output_db': str(output),
            'output_sha256': digest(output),
            'recipes': {name: {'columns': after[name]['columns'],
                               'count_before': before[name]['count'],
                               'count_after': after[name]['count']}
                        for name in before},
            'definitions_preserved': True}


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: RecipeDatabaseRecords.py request.json response.json')
    response_path = pathlib.Path(sys.argv[2])
    if response_path.exists() or not response_path.parent.is_dir():
        raise SystemExit('Fresh response path required')
    try:
        request = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
        result = run(request)
        code = 0
    except Exception as error:
        result = {'ok': False, 'error': str(error)}
        code = 1
    response_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    raise SystemExit(code)
