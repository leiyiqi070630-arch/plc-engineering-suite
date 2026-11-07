"""Fixed JSON-file protocol for the bundled Python BIFF8 codec; no GUI actions."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / '_deps'))
import eventlog_xls as legacy
import native_event_xls as native
import ebm_codec
import native_event_db
import hashlib
import shutil
import tarfile
from pathlib import PurePosixPath

def unpack_cxob(request):
    if set(request) != {'operation', 'input', 'expected_sha256', 'output_root'}:
        raise ValueError('Exact CXOB unpack request fields required')
    expected = request['expected_sha256']
    if not isinstance(expected, str) or len(expected) != 64 or any(c not in '0123456789abcdefABCDEF' for c in expected):
        raise ValueError('Expected input SHA256 required')
    def checked_path(value):
        if not isinstance(value, str) or not value or not Path(value).is_absolute():
            raise ValueError('Absolute local file path required')
        path = Path(value)
        if str(path).startswith(('\\\\', '//')):
            raise ValueError('Local file path required')
        for component in (path, *path.parents):
            if component.exists() or component.is_symlink():
                if component.is_symlink() or getattr(component.lstat(), 'st_file_attributes', 0) & 0x400:
                    raise ValueError('Reparse paths forbidden')
        return path
    source = checked_path(request['input']).resolve(strict=True)
    root = checked_path(request['output_root'])
    if source.suffix.lower() != '.cxob' or not source.is_file():
        raise ValueError('Actual CXOB file required')
    parent = root.parent.resolve(strict=True)
    if not parent.is_dir() or root.exists() or root.parent != parent:
        raise ValueError('Fresh unpack root in canonical existing directory required')
    root = parent / root.name
    def digest(path):
        with path.open('rb') as stream:
            return hashlib.file_digest(stream, 'sha256').hexdigest().upper()
    before = digest(source)
    if before != expected.upper():
        raise ValueError('CXOB input SHA256 mismatch')
    input_bytes = source.stat().st_size
    root.mkdir()
    files, names, entry_count, total_bytes = [], set(), 0, 0
    with tarfile.open(source, mode='r:gz') as archive:
        for member in archive:
            entry_count += 1
            if entry_count > 4096 or member.size < 0 or total_bytes + member.size > 536870912:
                raise ValueError('CXOB extraction payload bound exceeded')
            name = PurePosixPath(member.name)
            if not member.name or name.is_absolute() or '..' in name.parts or '\\' in member.name or ':' in member.name or not (member.isdir() or member.isfile()):
                raise ValueError('Unsafe or non-regular CXOB archive entry')
            target = root.joinpath(*name.parts).resolve()
            key = str(target).casefold()
            if not target.is_relative_to(root) or key in names:
                raise ValueError('CXOB archive path escape or duplicate')
            names.add(key)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.extractfile(member) as incoming, target.open('xb') as outgoing:
                shutil.copyfileobj(incoming, outgoing)
            if target.stat().st_size != member.size:
                raise ValueError('CXOB extracted byte count differs')
            total_bytes += member.size
            files.append({'archive_name': member.name, 'path': str(target), 'bytes': member.size, 'sha256': digest(target)})
    projects = [path for path in (root / 'mt8000' / 'project', root / 'project')
                if path.is_file() and path.stat().st_size > 0]
    if len(projects) != 1:
        raise ValueError('Exactly one nonempty native mt8000/project or root project required')
    project = projects[0]
    if digest(source) != before or source.stat().st_size != input_bytes:
        raise ValueError('Original CXOB input changed')
    return {'input_path': str(source), 'input_sha256': before, 'input_bytes': input_bytes,
            'output_root': str(root), 'archive_entries': entry_count, 'file_count': len(files),
            'extracted_bytes': total_bytes, 'files': files, 'project_path': str(project),
            'project_bytes': project.stat().st_size, 'project_sha256': digest(project),
            'source_unchanged': True, 'executables_run': []}

def execute(request):
    operation=request['operation']
    if operation=='native-empty':
        return native.empty(request['output'], request['hardware_id'], request.get('format'))
    if operation=='cmt-event-db-inspect':
        return native_event_db.inspect(request)
    if operation in ('ebm-inspect','ebm-prepare'):
        return ebm_codec.execute(request)
    if operation=='inspect':
        return legacy.inspect(request['input'],request['output'])
    if operation=='compare':
        return legacy.compare(request['before'],request['after'],request['output'])
    if operation in ('native-append','native-update','native-delete'):
        row=request.get('row')
        return native.mutate(request['base'],operation[7:],request['output'],request['receipt'],request['expected_sha256'],row,request.get('index'))
    if operation=='cxob-unpack':
        return unpack_cxob(request)
    raise ValueError('Unsupported codec operation')

def main():
    if len(sys.argv)!=3:
        raise SystemExit('usage: python event_table_codec.py REQUEST.json RESPONSE.json')
    response=Path(sys.argv[2])
    if response.exists():
        raise SystemExit('Fresh response path required')
    try:
        request=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
        result={'ok':True,'result':execute(request),'native_import_verified':False}
        status=0
    except Exception as error:
        result={'ok':False,'error_type':type(error).__name__,'message':str(error),'native_import_verified':False}
        status=2
    legacy.fresh_json(response,result)
    print(json.dumps({'ok':result['ok'],'response':str(response.resolve())},ensure_ascii=True))
    raise SystemExit(status)

if __name__=='__main__': main()
