"""EBM file exchange, reused from the native-verified CN421 research codec.
No IDE operations. Execution settings and unknown metadata stay byte-for-byte.
"""
from pathlib import Path
import re,json,difflib,hashlib
BEGIN='macro_definition_begin';END='macro_definition_end'
FIELD=re.compile(r'^(\s*)("(?:[^"\\]|\\.)*")\s*:\s*(.*?)\s*$')
KNOWN={'id','name','startup','periodic','interlock'}
def validate_source(source):
    if '\x00' in source:raise ValueError('NUL source')
    if BEGIN in source or END in source:raise ValueError('definition marker in source rejected')
    if not source.strip().startswith('macro_command ') or not source.strip().endswith('end macro_command'):
        raise ValueError('expected complete macro_command source')

def parse(raw):
    if not raw.startswith(b'\xef\xbb\xbf'):raise ValueError('UTF8 BOM required')
    text=raw.decode('utf-8-sig',errors='strict')
    if '\r' in text.replace('\r\n','') or '\n' in text.replace('\r\n',''):raise ValueError('CRLF only')
    if not text.startswith(BEGIN+'\r\n'):raise ValueError('definition must be first')
    if text.count(BEGIN)!=1 or text.count(END)!=1:raise ValueError('exactly one definition block required')
    header,source=text[len(BEGIN)+2:].split(END+'\r\n',1)
    lines=header.splitlines(keepends=True);fields={};indices={}
    for i,line in enumerate(lines):
        match=FIELD.fullmatch(line.rstrip('\r\n'))
        if not match:raise ValueError('invalid field line')
        key=json.loads(match[2]); value=json.loads(match[3])
        if key in fields:raise ValueError('duplicate field')
        fields[key]=value;indices[key]=i
    if not KNOWN.issubset(fields):raise ValueError('required fields missing')
    validate_fields(fields);validate_source(source)
    return dict(fields=fields,lines=lines,indices=indices,source=source)

def validate_fields(fields):
    if not isinstance(fields['id'],str) or not re.fullmatch(r'0|[1-9][0-9]*',fields['id']) or int(fields['id'])>254:raise ValueError('id must be decimal string 0..254')
    if not isinstance(fields['name'],str) or not fields['name'] or len(fields['name'].encode('utf-16-le'))>128 or any(ord(c)<32 for c in fields['name']):raise ValueError('single-line name of 1..64 UTF16 units required')
    if fields['startup'] not in ['true','false']:raise ValueError('startup boolean string required')
    for key in ['periodic','interlock']:
        # Extra native execution parameters are opaque: preserve the original line,
        # never construct or interpret these fields during a source replacement.
        if not isinstance(fields[key],list) or not fields[key] or fields[key][0] not in ['false','true']:raise ValueError('native execution array required')

def encode(template,updates=None,source=None):
    doc=parse(template);updates=updates or {}
    if set(updates)-{'id','name','startup','periodic'}:raise ValueError('only reviewed identity/startup/periodic fields may be changed')
    fields={**doc['fields'],**updates};validate_fields(fields)
    lines=list(doc['lines'])
    for key,value in updates.items():
        i=doc['indices'][key];old=FIELD.fullmatch(lines[i].rstrip('\r\n'))
        rendered=json.dumps(value,ensure_ascii=False)
        if key=='periodic':rendered='[ '+', '.join(json.dumps(item,ensure_ascii=False) for item in value)+' ]'
        lines[i]=old[1]+json.dumps(key,ensure_ascii=False)+': '+rendered+'\r\n'
    source=doc['source'] if source is None else source.replace('\r\n','\n').replace('\r','\n').replace('\n','\r\n')
    validate_source(source)
    raw=(BEGIN+'\r\n'+''.join(lines)+END+'\r\n'+source).encode('utf-8-sig',errors='strict')
    parse(raw)
    return raw

def source_hash(source):
    return hashlib.sha256(source.replace('\r\n','\n').replace('\r','\n').encode('utf-8')).hexdigest().upper()

def describe(raw):
    doc=parse(raw)
    return {'macro_id':int(doc['fields']['id']),'macro_name':doc['fields']['name'],
            'source':doc['source'],'normalized_source':doc['source'].replace('\r\n','\n'),
            'macro_source_sha256':source_hash(doc['source']),'source_hash_encoding':'UTF8-LF',
            'metadata':doc['fields'],'metadata_lines_sha256':hashlib.sha256(''.join(doc['lines']).encode('utf-8')).hexdigest().upper(),
            'ebm_sha256':hashlib.sha256(raw).hexdigest().upper(),'ebm_bytes':len(raw)}

def execution_updates(metadata, execution):
    if not isinstance(execution,dict) or not execution or set(execution)-{'startup','periodic_interval_ms'}:
        raise ValueError('execution must contain reviewed startup/periodic fields')
    updates={}
    if 'startup' in execution:
        if type(execution['startup']) is not bool:raise ValueError('startup must be boolean')
        updates['startup']='true' if execution['startup'] else 'false'
    if 'periodic_interval_ms' in execution:
        periodic=metadata['periodic']
        if periodic!=['false'] and not (len(periodic)==2 and periodic[0]=='true' and isinstance(periodic[1],str) and re.fullmatch(r'0|[1-9][0-9]*',periodic[1]) and int(periodic[1])<=864000):
            raise ValueError('unreviewed periodic metadata must be preserved')
        value=execution['periodic_interval_ms']
        if value is None:updates['periodic']=['false']
        elif type(value) is int and 100<=value<=86400000 and value%100==0:updates['periodic']=['true',str(value//100)]
        else:raise ValueError('periodic interval must be null or 100..86400000ms in 100ms units')
    return {key:value for key,value in updates.items() if metadata[key]!=value}

def execute(request):
    operation=request['operation']
    allowed={'operation','input','expected_sha256'} if operation=='ebm-inspect' else {'operation','output','macro_id','macro_name','source','base','expected_sha256','expected_source_sha256','execution'}
    if set(request)-allowed:raise ValueError('Unreviewed EBM request field')
    if operation=='ebm-inspect':
        raw=Path(request['input']).read_bytes()
        result=describe(raw)
        if result['ebm_sha256']!=str(request['expected_sha256']).upper():raise ValueError('EBM input SHA differs')
        return result
    if operation!='ebm-prepare':raise ValueError('Unsupported EBM operation')
    number=request['macro_id'];name=request['macro_name'];source=request['source']
    if type(number) is not int or not 0<=number<=254 or not isinstance(source,str) or not source or len(source.encode('utf-8'))>65536:raise ValueError('Macro id/source bound exceeded')
    if request.get('base'):
        raw=Path(request['base']).read_bytes();before=describe(raw)
        if before['ebm_sha256']!=str(request['expected_sha256']).upper() or before['macro_source_sha256']!=str(request['expected_source_sha256']).upper():raise ValueError('Existing EBM/source SHA differs')
        if before['macro_id']!=number or before['macro_name']!=name:raise ValueError('Existing macro identity must be preserved')
        updates={}
    else:
        raw=Path(__file__).with_name('macro-default-cn421.ebm').read_bytes()
        updates={'id':str(number),'name':name}
    original=describe(raw)
    changed_execution=execution_updates(original['metadata'],request['execution']) if 'execution' in request else {}
    updates.update(changed_execution)
    if request.get('base') and original['macro_source_sha256']==source_hash(source) and not changed_execution:
        raise ValueError('Replacement source and execution settings unchanged')
    prepared=encode(raw,updates,source)
    with Path(request['output']).open('xb') as output:output.write(prepared)
    result=describe(prepared)
    result.update({'output_path':str(Path(request['output']).resolve()),'execution_metadata_preserved':not changed_execution,
                   'unrequested_execution_metadata_preserved':True,'original_metadata':original['metadata'],
                   'original_metadata_lines_sha256':original['metadata_lines_sha256'],'execution_changed':bool(changed_execution),
                   'file_operations_only':True})
    return result

