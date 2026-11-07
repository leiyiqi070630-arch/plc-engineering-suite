"""Strict observed native Event v3 and v4 positional file contracts."""
import json
from pathlib import Path
from collections import Counter
import eventlog_xls as core

CONTRACT = json.loads((Path(__file__).parent / 'native-event-v3-hw49-contract.json').read_text(encoding='utf-8'))
CMT_CONTRACT = json.loads((Path(__file__).parent / 'native-event-v4-hw72-contract.json').read_text(encoding='utf-8'))


def valid_hardware_id(value):
    return isinstance(value, str) and value.isascii() and value.isdecimal() and 0 < int(value) <= 65535


def contract_for(cells):
    for name, contract in (('native-event-v3-hw49', CONTRACT), ('native-event-v4-hw72', CMT_CONTRACT)):
        # Hardware identifies the native model, not the positional format.
        # The version and every header still have to match the complete schema.
        expected = [row[:] for row in contract['preamble_rows']] + [contract['columns']]
        if len(cells) >= 2 and len(cells[0]) == contract['column_count'] and valid_hardware_id(cells[0][3]):
            expected[0][3] = cells[0][3]
        if len(cells) >= 2 and cells[:2] == expected:
            return name, contract
    raise ValueError('Exact observed native metadata and positional headers required; event formats cannot be mixed')


def empty(output, hardware_id, format_name=None):
    if not valid_hardware_id(hardware_id):
        raise ValueError('Unsupported native event hardware model')
    if format_name is None:
        format_name = {'49': 'native-event-v3-hw49', '96': 'native-event-v3-hw49',
                       '72': 'native-event-v4-hw72', '74': 'native-event-v4-hw72'}.get(hardware_id)
    if format_name not in ('native-event-v3-hw49', 'native-event-v4-hw72'):
        raise ValueError('Actual native project event format required')
    target = Path(output).resolve()
    if target.exists() or target.suffix.lower() != '.xls':
        raise ValueError('Fresh native event XLS path required')
    if format_name == 'native-event-v4-hw72':
        cells = [row[:] for row in CMT_CONTRACT['preamble_rows']] + [CMT_CONTRACT['columns'][:]]
        types = [[1 if value else 0 for value in row] for row in cells]
    else:
        cells, types = read(Path(__file__).parent.parent / 'schema' / 'derived-empty.xls')
    cells[0][3] = hardware_id
    book = core.xlwt.Workbook()
    sheet = book.add_sheet('Event')
    from xlwt.Cell import StrCell
    for r, (values, kinds) in enumerate(zip(cells, types)):
        for c, (value, kind) in enumerate(zip(values, kinds)):
            if kind == 1:
                sheet.row(r).insert_cell(c, StrCell(r, c, 0, book.add_str(value)))
    book.save(str(target))
    if read(target) != (cells, types):
        raise ValueError('Derived empty event model/header mismatch')
    return {'path': str(target), 'hardware_id': hardware_id, 'data_rows': 0}

def read(path):
    path = Path(path).resolve(strict=True)
    if path.suffix.lower() != '.xls' or path.read_bytes()[:8] != core.MAGIC:
        raise ValueError('Actual OLE BIFF8 XLS required')
    book = core.xlrd.open_workbook(str(path), formatting_info=True)
    if book.biff_version != 80 or book.nsheets != 1:
        raise ValueError('Strict one-sheet BIFF8 required')
    sheet = book.sheet_by_index(0)
    cells = [sheet.row_values(r) for r in range(sheet.nrows)]
    types = [[sheet.cell_type(r,c) for c in range(sheet.ncols)] for r in range(sheet.nrows)]
    if sheet.name != 'Event' or sheet.ncols not in (170, 179) or len(cells) < 2:
        raise ValueError('Observed native one-sheet event layout required')
    _, contract = contract_for(cells)
    if sheet.ncols != contract['column_count']:
        raise ValueError('Observed native event column count differs')
    if any(t not in (0, 1) for row in types for t in row):
        raise ValueError('Observed native contract permits TEXT and absent EMPTY only')
    # A formula can expose a cached text result; reject its BIFF record explicitly.
    with core.olefile.OleFileIO(str(path)) as ole:
        stream = ole.openstream('Workbook').read()
    pos = 0
    while pos + 4 <= len(stream):
        kind, size = core.struct.unpack_from('<HH', stream, pos)
        if kind == 6:
            raise ValueError('Formula semantics cannot be rewritten')
        pos += 4 + size
    return cells, types

def inspect(path, output):
    cells, types = read(path)
    name, contract = contract_for(cells)
    result = {'path': str(Path(path).resolve()), 'sha256': core.sha(path), 'format': name, 'sheet': 'Event', 'column_count':contract['column_count'], 'data_rows':len(cells)-2, 'all_cells':cells, 'all_cell_types':types, 'native_import_verified':False}
    core.fresh_json(output,result)
    return result

def mutate(base, operation, output, receipt, expected_sha, row=None, index=None):
    source, target = Path(base).resolve(strict=True), Path(output).resolve()
    if core.sha(source) != expected_sha.upper():
        raise ValueError('Base hash mismatch')
    if target.exists() or Path(receipt).exists() or target.suffix.lower() != '.xls':
        raise ValueError('Fresh XLS and receipt required')
    cells, types = read(source)
    name, contract = contract_for(cells)
    width = contract['column_count']
    old_cells, old_types = [r[:] for r in cells], [r[:] for r in types]
    if operation in ('append','update'):
        if not isinstance(row, dict) or set(row) != {'values','types'} or len(row['values']) !=width or len(row['types']) !=width:
            raise ValueError(f'{width} exact positional values and types required for {name}')
        if any(type(v) != str or t not in (0,1) or (t==0 and v!='') or len(v)>32767 for v,t in zip(row['values'],row['types'])):
            raise ValueError('TEXT/EMPTY contract violated; no coercion')
    if operation in ('update','delete') and (type(index)!=int or not 1<=index<=len(cells)-2):
        raise ValueError('Valid 1-based data row index required')
    if operation=='append':
        if len(cells)-2 >=10000 or row['values'] in cells[2:]:
            raise ValueError('Event count limit or duplicate')
        cells.append(row['values']); types.append(row['types'])
    elif operation=='update':
        cells[index+1]=row['values']; types[index+1]=row['types']
    elif operation=='delete':
        del cells[index+1]; del types[index+1]
    else:
        raise ValueError('Unknown operation')
    book=core.xlwt.Workbook(); sheet=book.add_sheet('Event')
    for r,(values,kinds) in enumerate(zip(cells,types)):
        for c,(v,t) in enumerate(zip(values,kinds)):
            if t==1:
                # xlwt encodes empty strings as BLANK; explicit StrCell retains TEXT.
                from xlwt.Cell import StrCell
                sheet.row(r).insert_cell(c, StrCell(r,c,0,book.add_str(v)))
    book.save(str(target))
    if read(target)!=(cells,types) or core.sha(source)!=expected_sha.upper():
        raise ValueError('Exact value/type readback or source preservation failed')
    untouched=[i for i in range(len(old_cells)) if operation!='update' or i!=index+1]
    if operation=='delete': untouched=[i for i in untouched if i!=index+1]
    result={'operation':operation,'base':str(source),'base_sha256':core.sha(source),'output':str(target),'output_sha256':core.sha(target),'old_data_rows':len(old_cells)-2,'new_data_rows':len(cells)-2,'all_unaffected_cells_and_types_preserved':True,'metadata_preserved':True,'actual_biff8_readback_verified':True,'visual_formatting_or_other_workbook_features_preserved':False,'native_import_verified':False,'vendor_acceptance_requires_native_import_export_save_reopen':True}
    core.fresh_json(receipt,result)
    return result

def compare(before,after,output):
    a,at=read(before); b,bt=read(after)
    key=lambda v,t:json.dumps([v,t],ensure_ascii=False,separators=(',',':'))
    x=Counter(key(v,t) for v,t in zip(a[2:],at[2:])); y=Counter(key(v,t) for v,t in zip(b[2:],bt[2:]))
    missing,added=x-y,y-x
    name, _ = contract_for(a)
    other, _ = contract_for(b)
    if name != other:
        raise ValueError('Different native event contracts cannot be compared or mixed')
    result={'format':name,'before_sha256':core.sha(before),'after_sha256':core.sha(after),'before_rows':len(a)-2,'after_rows':len(b)-2,'metadata_and_headers_equal':a[:2]==b[:2] and at[:2]==bt[:2],'all_old_rows_preserved':not missing,'single_row_added':not missing and sum(added.values())==1,'row_order_preserved':a==b[:len(a)] and at==bt[:len(at)],'missing_rows':[{'cells_and_types':json.loads(k),'count':v} for k,v in missing.items()],'added_rows':[{'cells_and_types':json.loads(k),'count':v} for k,v in added.items()],'native_source_of_files_must_be_independently_proven':True}
    core.fresh_json(output,result)
    return result
