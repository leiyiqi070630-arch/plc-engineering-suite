"""Read the observed CN421 cMT event.db using the existing CPython SQLite driver.

Only stable, ordinary local snapshots are accepted. Raw timestamps are retained;
this file reader does not infer a timezone, acknowledge an alarm, or own a runtime.
"""
import hashlib
import json
import math
import re
import sqlite3
import time
from pathlib import Path

PROFILE = 'weinview-cn421-cmt-event-db-sqlite-v1'
MAX_BYTES = 1048576
MAX_ROWS = 4096
CONTRACT = Path(__file__).with_name('native-cmt-history-sqlite-v1.json')


def local_path(value):
    if not isinstance(value, str) or not value or not Path(value).is_absolute() or value.startswith(('\\\\', '//')):
        raise ValueError('Absolute local snapshot required')
    path = Path(value)
    for component in (path, *path.parents):
        if component.is_symlink() or (component.exists() and getattr(component.lstat(), 'st_file_attributes', 0) & 0x400):
            raise ValueError('Reparse snapshot paths forbidden')
    path = path.resolve(strict=True)
    if not path.is_file() or path.suffix.lower() != '.db':
        raise ValueError('Ordinary local .db snapshot required')
    return path


def no_journal(path):
    if any(Path(str(path) + suffix).exists() for suffix in ('-wal', '-shm', '-journal')):
        raise ValueError('Live SQLite journal rejected; provide a stable native snapshot')


def inspect(request):
    if not isinstance(request, dict) or set(request) != {'operation', 'input', 'expected_sha256'} or request['operation'] != 'cmt-event-db-inspect':
        raise ValueError('Exact cMT history snapshot request required')
    expected = request['expected_sha256']
    if not isinstance(expected, str) or not re.fullmatch('[a-fA-F0-9]{64}', expected):
        raise ValueError('Expected native database SHA required')
    source = local_path(request['input'])
    no_journal(source)
    size = source.stat().st_size
    if not 100 <= size <= MAX_BYTES:
        raise ValueError('cMT native database product bound 100..1048576 bytes required')
    original = source.read_bytes()
    sha = hashlib.sha256(original).hexdigest().upper()
    if len(original) != size or sha != expected.upper() or original[:16] != b'SQLite format 3\x00':
        raise ValueError('Native SQLite snapshot bytes/SHA differ')
    contract = json.loads(CONTRACT.read_text(encoding='utf-8-sig'))
    if contract['profile'] != PROFILE or [t['name'] for t in contract['tables']] != ['.data_section', 'event', 'event_log']:
        raise ValueError('Observed native schema contract differs')
    deadline = time.monotonic() + 4
    # immutable is used only for the caller's stable copied snapshot, never a live
    # vendor database. ro, query_only and trusted_schema do not write this file.
    connection = sqlite3.connect(source.as_uri() + '?mode=ro&immutable=1', uri=True, timeout=0.1)
    connection.set_progress_handler(lambda: int(time.monotonic() > deadline), 1000)
    connection.enable_load_extension(False)
    tables = []
    try:
        connection.execute('PRAGMA query_only=ON')
        connection.execute('PRAGMA trusted_schema=OFF')
        if connection.execute('PRAGMA quick_check').fetchall() != [('ok',)]:
            raise ValueError('Native SQLite snapshot integrity check failed')
        schema = connection.execute('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY name').fetchall()
        native_schema = [('table', t['name'], t['name'], t['create_sql']) for t in contract['tables']]
        native_schema.append(('table', 'sqlite_sequence', 'sqlite_sequence', 'CREATE TABLE sqlite_sequence(name,seq)'))
        if schema != sorted(native_schema, key=lambda r: r[1]):
            raise ValueError('Unknown table/view/trigger/index or native DDL differs')
        for spec in contract['tables']:
            name = spec['name']  # Fixed observed contract, never a caller SQL identifier.
            columns = [{'ordinal':r[0], 'name':r[1], 'native_declared_type':r[2],
                        'notnull':r[3], 'default':r[4], 'pk':r[5]}
                       for r in connection.execute('PRAGMA table_info("' + name + '")')]
            if columns != spec['columns']:
                raise ValueError('Native column order/types/defaults/keys differ')
            primary = [c['name'] for c in columns if c['pk'] == 1]
            if len(primary) != 1:
                raise ValueError('Single observed primary key required')
            rows = connection.execute('SELECT * FROM "' + name + '" ORDER BY "' + primary[0] + '" LIMIT ?', (MAX_ROWS + 1,)).fetchall()
            if len(rows) > MAX_ROWS:
                raise ValueError('cMT native database product bound 4096 rows per table exceeded')
            for row in rows:
                for cell, column in zip(row, columns):
                    declared = column['native_declared_type']
                    if cell is None:
                        if column['pk'] or column['notnull']:
                            raise ValueError('Native primary/non-null value absent')
                    elif declared == 'INTEGER' and (type(cell) is not int or not -(2**63) <= cell < 2**63):
                        raise ValueError('Native INTEGER value differs')
                    elif declared == 'REAL' and (type(cell) is not float or not math.isfinite(cell)):
                        raise ValueError('Native REAL timestamp is not finite')
                    elif declared == 'TEXT' and (type(cell) is not str or len(cell.encode('utf-8')) > MAX_BYTES):
                        raise ValueError('Native TEXT value differs')
                    elif declared not in ('INTEGER', 'REAL', 'TEXT'):
                        raise ValueError('Unknown native cell type')
            tables.append({**spec, 'row_count':len(rows), 'rows':[list(row) for row in rows]})
    finally:
        connection.close()
    no_journal(source)
    if source.read_bytes() != original or source.stat().st_size != size:
        raise ValueError('Original native SQLite snapshot changed during read')
    def mapped(table):
        return [dict(zip([c['name'] for c in table['columns']], row)) for row in table['rows']]
    definitions = mapped(tables[2])
    by_id = {d['event_log_index']:d for d in definitions}
    for definition in definitions:
        if type(definition['event_log_index']) is not int or definition['event_log_index'] < 1 or not isinstance(definition['GUID'], str) or not re.fullmatch('[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}', definition['GUID']):
            raise ValueError('Native definition index/GUID differs')
    records = []
    for event in mapped(tables[1]):
        if type(event['event_index']) is not int or event['event_index'] < 1 or type(event['event_log_index']) is not int or event['event_log_index'] not in by_id:
            raise ValueError('Native event primary/definition reference absent')
        records.append({'event':event, 'definition':by_id[event['event_log_index']]})
    result = {'profile':PROFILE, 'source_path':str(source), 'source_sha256':sha,
              'source_byte_length':size, 'read_mode':'ro-immutable-snapshot',
              'sqlite_library_version':sqlite3.sqlite_version, 'schema_verified':True,
              'tables':tables, 'definitions':definitions, 'records':records,
              'record_count':len(records), 'source_unchanged':True, 'read_only':True,
              'runtime_ack_verified':False, 'timestamp_unit_verified':False,
              'timezone_verified':False, 'full_properties_verified':False,
              'plc_communication_tested':False, 'ui_actions':0, 'global_input':False}
    if len(json.dumps(result, ensure_ascii=False, allow_nan=False).encode('utf-8')) > 2097152:
        raise ValueError('cMT native report product bound 2MiB exceeded')
    return result
