"""Private BIFF8 event-definition file preparation; no native/GUI actions.

xlrd reads actual .xls; xlwt writes actual BIFF8/OLE .xls. Fresh outputs only.
No claim that prepared files have passed EasyBuilder import.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import struct
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent / '_deps'))
import xlrd
import xlwt
import olefile

HEADERS = ['Category', 'Priority level', 'Address type', 'PLC name', 'Device type',
           'System tag', 'User-defined tag', 'Address', 'Index', 'Data Format',
           'Enable', 'Set On', 'PLC name', 'Device type', 'System tag',
           'User-defined tag', 'Address', 'Index', 'Trigger condition', '',
           'Content', 'Label lib. enable', 'label lib. name', 'Font', 'Color',
           'Write Value', 'Sound lib. enable', 'Sound lib.', 'Item index']
MAGIC = bytes.fromhex('D0CF11E0A1B11AE1')

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest().upper()

def letter(index):
    result = ''
    index += 1
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result

def fresh_json(path, value):
    with Path(path).open('x', encoding='utf-8', newline='\n') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')

def read(path):
    path = Path(path).resolve(strict=True)
    if path.suffix.lower() != '.xls' or path.read_bytes()[:8] != MAGIC:
        raise ValueError('Actual OLE/BIFF .xls required; CSV/XLSX disguised as XLS rejected')
    book = xlrd.open_workbook(str(path), formatting_info=True)
    if book.nsheets != 1:
        raise ValueError('Unverified additional sheets; do not silently discard')
    sheet = book.sheet_by_index(0)
    if sheet.ncols != len(HEADERS) or sheet.row_values(0) != HEADERS:
        raise ValueError('Actual headers differ from installed CN421 template; inspect before changing contract')
    rows = [sheet.row_values(r) for r in range(1, sheet.nrows)]
    if any(sheet.cell_type(r, c) in (xlrd.XL_CELL_ERROR, xlrd.XL_CELL_DATE, xlrd.XL_CELL_BOOLEAN)
           for r in range(sheet.nrows) for c in range(sheet.ncols)):
        raise ValueError('Unverified error/date/native-boolean cell; no silent conversion')
    # xlrd exposes cached formula values. Rewriting those as constants would silently
    # lose formula semantics, so reject formulas instead of claiming preservation.
    with olefile.OleFileIO(str(path)) as ole:
        data = ole.openstream('Workbook').read()
    pos = 0
    while pos + 4 <= len(data):
        kind, length = struct.unpack_from('<HH', data, pos)
        if kind == 0x0006:
            raise ValueError('Formula cell in event definitions; constant rewrite rejected')
        pos += 4 + length
    return book, sheet, rows

def unicode_string(data, offset):
    count, = struct.unpack_from('<H', data, offset)
    flags = data[offset + 2]
    if flags & ~1:
        raise ValueError('Unsupported rich/extended DV string')
    start = offset + 3
    end = start + count * (2 if flags else 1)
    return data[start:end].decode('utf-16le' if flags else 'latin1'), end

def validation_records(path):
    """Decode bounded installed template DV records using MS-XLS 2.4.95.

    Preserve raw payload/formula hex too. Formula support intentionally limited
    to the actual literal-list and integer tokens observed in this template.
    """
    result = []
    with olefile.OleFileIO(str(path)) as ole:
        stream = ole.openstream('Workbook').read()
    offset = 0
    while offset + 4 <= len(stream):
        kind, size = struct.unpack_from('<HH', stream, offset)
        data = stream[offset + 4:offset + 4 + size]
        offset += 4 + size
        if kind != 0x01BE:
            continue
        flags, = struct.unpack_from('<I', data)
        pos = 4
        text = []
        for _ in range(4):
            value, pos = unicode_string(data, pos)
            text.append(value)
        formulas = []
        for _ in range(2):
            length, unused = struct.unpack_from('<HH', data, pos)
            pos += 4
            tokens = data[pos:pos + length]
            pos += length
            formula = {'tokens_hex': tokens.hex(), 'reserved': unused}
            if tokens and tokens[0] == 0x17:
                count, wide = tokens[1:3]
                value = tokens[3:].decode('utf-16le' if wide else 'latin1')
                if len(value) != count:
                    raise ValueError('DV literal character count mismatch')
                formula['literal'] = value
                formula['choices_exact'] = value.split('\0')
            elif tokens and tokens[0] == 0x1E and len(tokens) == 3:
                formula['integer'] = struct.unpack_from('<H', tokens, 1)[0]
            formulas.append(formula)
        count, = struct.unpack_from('<H', data, pos)
        pos += 2
        ranges = []
        for _ in range(count):
            first_row, last_row, first_col, last_col = struct.unpack_from('<HHHH', data, pos)
            pos += 8
            ranges.append({'excel_range': f'{letter(first_col)}{first_row+1}:{letter(last_col)}{last_row+1}',
                           'first_row_zero_based': first_row, 'last_row_zero_based': last_row,
                           'first_col_zero_based': first_col, 'last_col_zero_based': last_col})
        if pos != len(data):
            raise ValueError('Unexpected DV trailing bytes')
        result.append({'flags_hex': f'{flags:08X}', 'value_type': flags & 15,
                       'operator': (flags >> 20) & 15, 'texts': text,
                       'formulas': formulas, 'ranges': ranges, 'record_hex': data.hex()})
    return result

def inspect(path, output):
    probe = xlrd.open_workbook(str(path))
    if probe.sheet_by_index(0).ncols in (170, 179):
        import native_event_xls
        return native_event_xls.inspect(path, output)
    book, sheet, rows = read(path)
    notes = [{'row_one_based': r+1, 'column': letter(c), 'text': n.text}
             for (r, c), n in sheet.cell_note_map.items()]
    evidence = {'path': str(Path(path).resolve()), 'bytes': Path(path).stat().st_size,
                'sha256': sha(path), 'format': 'OLE BIFF8', 'biff_version': book.biff_version,
                'sheet': sheet.name, 'headers': HEADERS, 'rows': rows,
                'cell_types': [[sheet.cell_type(r,c) for c in range(sheet.ncols)]
                               for r in range(sheet.nrows)],
                'columns': [{'column': letter(i), 'position_one_based': i+1, 'header': h}
                            for i, h in enumerate(HEADERS)],
                'notes': notes, 'data_validations': validation_records(path),
                'native_import_verified': False}
    fresh_json(output, evidence)
    return {'ok': True, 'output': str(Path(output).resolve()), 'sha256': evidence['sha256'],
            'rows': len(rows), 'columns': len(HEADERS), 'data_validations': len(evidence['data_validations'])}

def append(base, specification, output, receipt, expected_sha):
    source = Path(base).resolve(strict=True)
    target = Path(output).resolve()
    if sha(source) != expected_sha.upper():
        raise ValueError('Base export hash mismatch')
    if target.exists() or Path(receipt).exists() or target.suffix.lower() != '.xls':
        raise ValueError('Fresh XLS and receipt required')
    _, sheet, rows = read(source)
    spec = json.loads(Path(specification).read_text(encoding='utf-8-sig'))
    if set(spec) != {'columns', 'values'} or spec['columns'] != HEADERS:
        raise ValueError('Exact positional columns and values required; duplicate header names are not keys')
    new = spec['values']
    if len(new) != 29 or any(type(v) not in (str, int, float) for v in new):
        raise ValueError('29 scalar string/number values required; no formulas or automatic coercion')
    if any(isinstance(v, str) and len(v) > 32767 for v in new):
        raise ValueError('BIFF text bound exceeded')
    if new in rows:
        raise ValueError('Exact duplicate row rejected')
    if len(rows) >= 10000:
        raise ValueError('Documented event count bound exceeded')
    # Contract-shaped content export. No source formatting/DV is represented as preserved.
    book = xlwt.Workbook(encoding='utf-8')
    out_sheet = book.add_sheet(sheet.name)
    for r, row in enumerate([HEADERS] + rows + [new]):
        for c, value in enumerate(row):
            out_sheet.write(r, c, value)
    book.save(str(target))
    _, _, back = read(target)
    if back != rows + [new] or sha(source) != expected_sha.upper():
        raise ValueError('File readback or source-preservation failed')
    result = {'ok': True, 'base': str(source), 'base_sha256': sha(source),
              'output': str(target), 'output_sha256': sha(target),
              'output_bytes': target.stat().st_size, 'old_rows': len(rows),
              'new_rows': len(back), 'all_old_values_preserved': True,
              'added_row': new, 'actual_biff8_readback_verified': True,
              'template_visual_formatting_or_DV_preserved': False,
              'native_import_verified': False, 'import_replace_or_append_verified': False}
    fresh_json(receipt, result)
    return result

def compare(before, after, output):
    widths = [xlrd.open_workbook(str(p)).sheet_by_index(0).ncols for p in (before, after)]
    if widths[0] != widths[1]:
        raise ValueError('Different event formats cannot be compared or mixed')
    if widths[0] in (170, 179):
        import native_event_xls
        return native_event_xls.compare(before, after, output)
    _, _, old = read(before)
    _, _, new = read(after)
    key = lambda row: json.dumps(row, ensure_ascii=False, separators=(',', ':'))
    a, b = Counter(map(key, old)), Counter(map(key, new))
    missing, added = a-b, b-a
    result = {'before': str(Path(before).resolve()), 'before_sha256': sha(before),
              'after': str(Path(after).resolve()), 'after_sha256': sha(after),
              'before_rows': len(old), 'after_rows': len(new),
              'all_old_rows_preserved': not missing,
              'missing_rows': [{'row': json.loads(k), 'count': v} for k,v in missing.items()],
              'added_rows': [{'row': json.loads(k), 'count': v} for k,v in added.items()],
              'single_row_added': not missing and sum(added.values()) == 1,
              'row_order_preserved': new[:len(old)] == old,
              'native_source_of_files_must_be_independently_proven': True}
    fresh_json(output, result)
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    p = commands.add_parser('inspect'); p.add_argument('xls'); p.add_argument('json')
    p = commands.add_parser('append'); p.add_argument('base'); p.add_argument('row_json'); p.add_argument('output'); p.add_argument('receipt'); p.add_argument('--expected-sha256', required=True)
    p = commands.add_parser('compare'); p.add_argument('before'); p.add_argument('after'); p.add_argument('json')
    for operation in ('append','update','delete'):
        p = commands.add_parser('native-' + operation)
        p.add_argument('base'); p.add_argument('output'); p.add_argument('receipt'); p.add_argument('--expected-sha256', required=True)
        if operation != 'delete': p.add_argument('--row-json', required=True)
        if operation != 'append': p.add_argument('--index', type=int, required=True)
    args = parser.parse_args()
    if args.command == 'inspect': result = inspect(args.xls, args.json)
    elif args.command == 'append': result = append(args.base, args.row_json, args.output, args.receipt, args.expected_sha256)
    elif args.command == 'compare': result = compare(args.before, args.after, args.json)
    else:
        import native_event_xls
        row = json.loads(Path(args.row_json).read_text(encoding='utf-8-sig')) if hasattr(args,'row_json') else None
        result = native_event_xls.mutate(args.base,args.command[7:],args.output,args.receipt,args.expected_sha256,row,getattr(args,'index',None))
    print(json.dumps(result, ensure_ascii=True))

if __name__ == '__main__':
    main()
