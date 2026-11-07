"""Offline rewrite of literal recipe field references in an exported EBM source."""
import json
import re
import sys
from pathlib import Path

# SQLite's keyword list, plus TRUE/FALSE literals. Conservative quoting is
# safe for a column name and avoids turning it into SQL syntax or a constant.
_SQLITE_KEYWORDS=set("""
ABORT ACTION ADD AFTER ALL ALTER ALWAYS ANALYZE AND AS ASC ATTACH AUTOINCREMENT
BEFORE BEGIN BETWEEN BY CASCADE CASE CAST CHECK COLLATE COLUMN COMMIT CONFLICT
CONSTRAINT CREATE CROSS CURRENT CURRENT_DATE CURRENT_TIME CURRENT_TIMESTAMP
DATABASE DEFAULT DEFERRABLE DEFERRED DELETE DESC DETACH DISTINCT DO DROP EACH
ELSE END ESCAPE EXCEPT EXCLUDE EXCLUSIVE EXISTS EXPLAIN FAIL FILTER FIRST
FOLLOWING FOR FOREIGN FROM FULL GENERATED GLOB GROUP GROUPS HAVING IF IGNORE
IMMEDIATE IN INDEX INDEXED INITIALLY INNER INSERT INSTEAD INTERSECT INTO IS
ISNULL JOIN KEY LAST LEFT LIKE LIMIT MATCH MATERIALIZED NATURAL NO NOT NOTHING
NOTNULL NULL NULLS OF OFFSET ON OR ORDER OTHERS OUTER OVER PARTITION PLAN PRAGMA
PRECEDING PRIMARY QUERY RAISE RANGE RECURSIVE REFERENCES REGEXP REINDEX RELEASE
RENAME REPLACE RESTRICT RETURNING RIGHT ROLLBACK ROW ROWS SAVEPOINT SELECT SET
TABLE TEMP TEMPORARY THEN TIES TO TRANSACTION TRIGGER UNBOUNDED UNION UNIQUE
UPDATE USING VACUUM VALUES VIEW VIRTUAL WHEN WHERE WINDOW WITH WITHOUT TRUE FALSE
""".split())


def _sql_column_spelling(name):
    if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*',name) and name.upper() not in _SQLITE_KEYWORDS:
        return name
    return '"' + name.replace('"','""') + '"'


def _sql_tokens(sql):
    """Tokenize only the SQL syntax needed for a literal single-table SELECT."""
    tokens=[];i=0
    while i<len(sql):
        start=i;ch=sql[i]
        if ch.isspace():
            i+=1;continue
        if sql.startswith('--',i):
            end=sql.find('\n',i);i=len(sql) if end<0 else end;continue
        if sql.startswith('/*',i):
            end=sql.find('*/',i+2)
            if end<0:return None
            i=end+2;continue
        if sql.startswith('%(',i):
            end=sql.find(')',i+2)
            if end<0:return None
            tokens.append(('variable',i,end+1,sql[i:end+1]));i=end+1;continue
        if ch=="'":
            i+=1
            while i<len(sql):
                if sql[i]=="'":
                    i+=1
                    if i<len(sql) and sql[i]=="'":i+=1;continue
                    break
                i+=1
            else:return None
            tokens.append(('string',start,i,sql[start:i]));continue
        if ch in ('"', '`', '['):
            closing=']' if ch=='[' else ch
            i+=1;value=[]
            while i<len(sql):
                if sql[i]==closing:
                    i+=1
                    if i<len(sql) and sql[i]==closing:
                        value.append(closing);i+=1;continue
                    break
                value.append(sql[i]);i+=1
            else:return None
            tokens.append(('quoted',start,i,''.join(value)));continue
        match=re.match(r'[^\W\d]\w*',sql[i:])
        if match:
            i+=len(match.group());tokens.append(('bare',start,i,match.group()));continue
        tokens.append(('symbol',i,i+1,ch));i+=1
    return tokens


def _rewrite_recipe_query_sql(sql,recipe,old,new):
    """Return exact old-column spans for a static single-recipe SELECT *."""
    tokens=_sql_tokens(sql)
    if tokens is None:return None,'query_literal_requires_review',None,[]
    ident=lambda t:t[0] in ('bare','quoted')
    keyword=lambda t,word:t[0]=='bare' and t[3].upper()==word
    old_name=lambda t:ident(t) and t[3].casefold()==old.casefold()
    sql_keywords=_SQLITE_KEYWORDS
    def old_outside_table(table_index=None,alias_index=None):
        return any(old_name(t) for j,t in enumerate(tokens) if j not in (table_index,alias_index))
    if len(tokens)<4 or not (keyword(tokens[0],'SELECT') and tokens[1][3]=='*' and keyword(tokens[2],'FROM')):
        return None,'query_literal_requires_review' if old_outside_table() else None,None,[]
    table=tokens[3]
    if not ident(table):
        return None,'query_literal_requires_review' if old_outside_table() else None,None,[]
    if table[3].casefold()!=recipe.casefold():
        return None,None,None,[]
    if sum(keyword(t,'SELECT') for t in tokens)!=1 or sum(keyword(t,'FROM') for t in tokens)!=1 or any(keyword(t,w) for t in tokens for w in ('JOIN','UNION','INTERSECT','EXCEPT','GROUP','HAVING','WINDOW')):
        return None,'query_literal_requires_review' if old_outside_table(3) else None,None,[]
    p=4;alias=None;alias_index=None
    if p<len(tokens) and keyword(tokens[p],'AS'):
        if p+1>=len(tokens) or not ident(tokens[p+1]) or (tokens[p+1][0]=='bare' and tokens[p+1][3].upper() in sql_keywords):
            return None,'query_literal_requires_review' if old_outside_table(3) else None,None,[]
        alias=tokens[p+1][3];alias_index=p+1;p+=2
    elif p<len(tokens) and ident(tokens[p]) and not any(keyword(tokens[p],w) for w in ('WHERE','ORDER','LIMIT','OFFSET','JOIN','ON','USING')):
        alias=tokens[p][3];alias_index=p;p+=1
    where_start=None;order_start=None
    if p<len(tokens) and keyword(tokens[p],'WHERE'):
        where_start=p+1;p+=1
        depth=0
        while p<len(tokens):
            if tokens[p][3]=='(':depth+=1
            elif tokens[p][3]==')':depth-=1
            if depth<0:return None,'query_literal_requires_review' if old_outside_table(3,alias_index) else None,None,[]
            if depth==0 and keyword(tokens[p],'ORDER'):break
            if depth==0 and tokens[p][3]==';':break
            p+=1
        if depth!=0:return None,'query_literal_requires_review' if old_outside_table(3,alias_index) else None,None,[]
    if p<len(tokens) and keyword(tokens[p],'ORDER'):
        if p+1>=len(tokens) or not keyword(tokens[p+1],'BY'):
            return None,'query_literal_requires_review' if old_outside_table(3,alias_index) else None,None,[]
        order_start=p+2;p+=2
        while p<len(tokens) and tokens[p][3]!=';':p+=1
    if p<len(tokens) and tokens[p][3]==';':p+=1
    if p!=len(tokens) or (where_start is None and order_start is None):
        return None,'query_literal_requires_review' if old_outside_table(3,alias_index) else None,None,[]
    allowed={recipe.casefold()}
    if alias is not None:allowed.add(alias.casefold())
    clause_start=where_start if where_start is not None else order_start
    replacements=[];unresolved=False
    for i,t in enumerate(tokens):
        if not old_name(t):continue
        if t[0]=='bare' and t[3].upper() in sql_keywords:continue
        if i<clause_start:
            if i not in (3,alias_index):unresolved=True
            continue
        prev=tokens[i-1] if i else None
        next_token=tokens[i+1] if i+1<len(tokens) else None
        if next_token and next_token[3] in ('.','('):continue
        if prev and prev[3] in (':','@','$','%'):continue
        if prev and (keyword(prev,'AS') or keyword(prev,'COLLATE')):continue
        if prev and prev[3]=='.':
            qualifier=tokens[i-2] if i>=2 else None
            if not qualifier or not ident(qualifier) or qualifier[3].casefold() not in allowed or (i>=3 and tokens[i-3][3]=='.'):
                continue
        a,b=(t[1]+1,t[2]-1) if t[0]=='quoted' else (t[1],t[2])
        replacements.append((a,b,new if t[0]=='quoted' else _sql_column_spelling(new)))
    if not replacements:
        return None,'query_literal_requires_review' if unresolved else None,None,[]
    updated=sql
    for a,b,value in reversed(replacements):updated=updated[:a]+value+updated[b:]
    kind='static_recipe_sql_where' if where_start is not None else 'static_recipe_sql_order_by'
    return updated,'query_literal_requires_review' if unresolved else None,kind,replacements


def _decode_macro_literal(raw):
    """Decode supported macro escapes and map each SQL character to its raw span."""
    chars=[];spans=[];i=0
    while i<len(raw):
        if raw[i]=='\\':
            if i+1>=len(raw) or raw[i+1] not in ('"','\\'):return None,None
            chars.append(raw[i+1]);spans.append((i,i+2));i+=2
        else:
            chars.append(raw[i]);spans.append((i,i+1));i+=1
    return ''.join(chars),spans

def rewrite_recipe_references(request):
    """Rewrite only literal Recipe.Field arguments in known macro calls."""
    import re
    if set(request)!={'operation','source','recipe_name','old_field','new_field'}:
        raise ValueError('Exact recipe reference rewrite fields required')
    source, recipe, old, new=(request[k] for k in ('source','recipe_name','old_field','new_field'))
    if not isinstance(source,str) or not source or len(source.encode('utf-8'))>65536 or not isinstance(recipe,str) or not re.fullmatch(r'[A-Za-z0-9]{1,64}',recipe) or any(not isinstance(x,str) or not re.fullmatch(r'[A-Za-z0-9_]{1,64}',x) for x in (old,new)) or old==new:
        raise ValueError('Exact bounded recipe reference source and names required')
    # Mask comments and literals for call/argument parsing; keep byte-for-byte
    # source positions so a replacement cannot touch unrelated text.
    masked=list(source);literals=[];i=0
    while i<len(source):
        start=i
        if source.startswith('//',i):
            end=source.find('\n',i);i=len(source) if end<0 else end
            kind='comment'
        elif source.startswith('/*',i):
            end=source.find('*/',i+2)
            if end<0:raise ValueError('Unclosed macro comment')
            i=end+2;kind='comment'
        elif source[i] in ('"',"'"):
            quote=source[i];i+=1
            while i<len(source):
                if source[i]=='\\':i+=2;continue
                if source[i]==quote:i+=1;break
                i+=1
            else:raise ValueError('Unclosed macro literal')
            kind='literal'
            literals.append((start,i,quote))
        else:i+=1;continue
        for j in range(start,i):
            if masked[j]!='\n':masked[j]=' '
    code=''.join(masked);changes={};edits=[];unresolved=[];handled=set()
    def line_at(pos):return source.count('\n',0,pos)+1
    def literal_arg(a,b,allow_sql_escapes=False):
        hits=[x for x in literals if x[0]>=a and x[1]<=b]
        if len(hits)!=1 or source[a:hits[0][0]].strip() or source[hits[0][1]:b].strip() or hits[0][2]!='"':return None
        start,end,_=hits[0]
        raw=source[start+1:end-1]
        if allow_sql_escapes:
            value,spans=_decode_macro_literal(raw)
            if value is None:return None
        else:
            if '\\' in raw:return None
            value=raw;spans=[(i,i+1) for i in range(len(raw))]
        return start,end,value,spans
    call_pattern=re.compile(r'\b(RecipeQuery|RecipeGetData|RecipeSetData|RecipeQueryGetData|GetData|SetData)\s*\(')
    calls=[]
    for match in call_pattern.finditer(code):
        name=match.group(1);start=match.end();depth=1;commas=[];end=start
        while end<len(code) and depth:
            ch=code[end]
            if ch=='(':depth+=1
            elif ch==')':depth-=1
            elif ch==',' and depth==1:commas.append(end)
            end+=1
        if depth:raise ValueError('Unclosed recipe macro call')
        bounds=[start]+[x+1 for x in commas]
        args=[(a,b) for a,b in zip(bounds,commas+[end-1])]
        target=0 if name=='RecipeQuery' else 1 if name.startswith('Recipe') else 3
        if not name.startswith('Recipe') and (len(args)<4 or code[args[2][0]:args[2][1]].strip()!='RECIPE'):continue
        calls.append((match,name,args,target))
    array_consumers={}
    for match,name,args,target in calls:
        if name!='RecipeQuery' or len(args)<=target:continue
        a,b=args[target];candidate=re.fullmatch(r'([A-Za-z_]\w*)\s*\[\s*0\s*\]',source[a:b].strip())
        if candidate:array_consumers.setdefault(candidate.group(1),[]).append((match.start(),a,b))
    declarations={}
    declaration_pattern=re.compile(r'\bchar\s+([A-Za-z_]\w*)\s*\[\s*([1-9][0-9]*)\s*\]\s*=')
    for declaration in declaration_pattern.finditer(code):
        variable=declaration.group(1)
        if variable not in array_consumers:continue
        initializer=next((item for item in literals if item[0]>=declaration.end() and not code[declaration.end():item[0]].strip()),None)
        if initializer is None or initializer[2]!='"':continue
        line_end=code.find('\n',initializer[1]);line_end=len(code) if line_end<0 else line_end
        if code[initializer[1]:line_end].strip() not in ('',';'):continue
        ls,le,_=initializer;value,spans=_decode_macro_literal(source[ls+1:le-1])
        if value is None:continue
        declarations.setdefault(variable,[]).append((declaration,ls,le,value,spans))
    static_arrays={}
    for variable,consumers in array_consumers.items():
        matches=declarations.get(variable,[])
        if len(matches)!=1:continue
        declaration,ls,le,value,spans=matches[0]
        if any(position<declaration.start() for position,_,_ in consumers):continue
        allowed={(declaration.start(1),declaration.end(1))}
        for _,a,b in consumers:
            token=re.search(re.escape(variable),source[a:b]);allowed.add((a+token.start(),a+token.end()))
        if any((hit.start(),hit.end()) not in allowed for hit in re.finditer(r'\b'+re.escape(variable)+r'\b',code)):continue
        static_arrays[variable]=(declaration,ls,le,value,spans)
    processed_arrays=set()
    for match,name,args,target in calls:
        if len(args)<=target:
            unresolved.append({'line':line_at(match.start()),'function':name,'reason':'target_argument_absent'});continue
        a,b=args[target];literal=literal_arg(a,b,name=='RecipeQuery')
        if literal is None and name=='RecipeQuery':
            candidate=re.fullmatch(r'([A-Za-z_]\w*)\s*\[\s*0\s*\]',source[a:b].strip())
            variable=candidate.group(1) if candidate else None
            if variable in static_arrays:
                if variable in processed_arrays:continue
                processed_arrays.add(variable)
                declaration,ls,le,value,spans=static_arrays[variable];handled.add((ls,le))
                replacement,reason,kind,sql_edits=_rewrite_recipe_query_sql(value,recipe,old,new)
                if replacement is not None:
                    raw=source[ls+1:le-1]
                    for start,end,field in reversed(sql_edits):
                        raw_start=spans[start][0];raw_end=spans[end-1][1]
                        escaped=field.replace('\\','\\\\').replace('"','\\"')
                        raw=raw[:raw_start]+escaped+raw[raw_end:]
                    changes[(ls,le)]='"'+raw+'"'
                    old_capacity=int(declaration.group(2));new_capacity=max(old_capacity,len(replacement.encode('utf-8'))+1)
                    if new_capacity>old_capacity:changes[declaration.span(2)]=str(new_capacity)
                    edits.append({'line':line_at(ls),'function':name,'before':value,'after':replacement,'kind':kind,
                                  'variable':variable,'old_capacity':old_capacity,'new_capacity':new_capacity})
                if reason:unresolved.append({'line':line_at(ls),'function':name,'reason':reason})
                continue
        if literal is None:
            argument=source[a:b].lstrip()
            reason='quoted_identifier_requires_review' if name=='RecipeQuery' and argument.startswith('"SELECT ') and '\\"' in argument else 'dynamic_sql_argument' if name=='RecipeQuery' else 'dynamic_target_argument'
            unresolved.append({'line':line_at(a),'function':name,'reason':reason});continue
        ls,le,value,spans=literal;handled.add((ls,le))
        if name=='RecipeQuery':
            replacement,reason,kind,sql_edits=_rewrite_recipe_query_sql(value,recipe,old,new)
            if replacement is not None:
                raw=source[ls+1:le-1]
                for start,end,field in reversed(sql_edits):
                    raw_start=spans[start][0];raw_end=spans[end-1][1]
                    escaped=field.replace('\\','\\\\').replace('"','\\"')
                    raw=raw[:raw_start]+escaped+raw[raw_end:]
                changes[(ls,le)]='"'+raw+'"'
                edits.append({'line':line_at(ls),'function':name,'before':value,'after':replacement,'kind':kind})
            if reason:
                unresolved.append({'line':line_at(ls),'function':name,'reason':reason})
            continue
        wanted=recipe+'.'+old
        if value==wanted:
            replacement=recipe+'.'+new
            changes[(ls,le)]='"'+replacement+'"'
            edits.append({'line':line_at(ls),'function':name,'before':value,'after':replacement,'kind':'qualified_literal'})
        elif re.fullmatch(r'[A-Za-z0-9]{1,64}\.'+re.escape(old),value) and value.split('.',1)[0]!=recipe:
            pass
        elif old in value:
            unresolved.append({'line':line_at(ls),'function':name,'reason':'nonmatching_static_target','text':value[:256]})
    for ls,le,_ in literals:
        if (ls,le) not in handled and old in source[ls:le] and (ls,le) not in changes:
            unresolved.append({'line':line_at(ls),'function':None,'reason':'unclassified_literal'})
    for match in re.finditer(r'(?<![A-Za-z0-9_])'+re.escape(old)+r'(?![A-Za-z0-9_])',code):
        unresolved.append({'line':line_at(match.start()),'function':None,'reason':'code_identifier_or_dynamic_reference'})
    rewritten=source
    for (a,b),value in sorted(changes.items(),reverse=True):rewritten=rewritten[:a]+value+rewritten[b:]
    if len(rewritten.encode('utf-8'))>65536:raise ValueError('Rewritten recipe reference source exceeds 64KiB')
    return {'source':rewritten,'source_changed':bool(changes),'edits':edits,'unresolved':unresolved,
            'static_edit_count':len(edits),'dynamic_or_unclassified_count':len(unresolved),
            'whole_project_references_verified':False}

def main():
    if len(sys.argv) != 3:
        raise SystemExit('usage: RecipeReferenceRewrite.py REQUEST.json RESPONSE.json')
    request = Path(sys.argv[1])
    response = Path(sys.argv[2])
    if response.exists():
        raise SystemExit('Fresh response required')
    try:
        result = rewrite_recipe_references(json.loads(request.read_text(encoding='utf-8-sig')))
        payload = {'ok': True, 'result': result}
        code = 0
    except Exception as error:
        payload = {'ok': False, 'error_type': type(error).__name__, 'message': str(error)}
        code = 2
    response.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
    raise SystemExit(code)


if __name__ == '__main__':
    main()
