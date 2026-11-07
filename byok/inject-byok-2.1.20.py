"""BYOK 注入：幂等 IPC gate + 网络层外部端点收口 + AccountStore 覆盖。"""
import io, os, sys, shutil

base = sys.argv[1]
src_asar = sys.argv[2]
p = os.path.join(base, "v2120", "full", "out", "main", "index.js")

# 从 asar 重新取出干净的 index.js
import json, struct
with open(src_asar, "rb") as f:
    head = f.read(16)
hdr = struct.unpack_from("<I", head, 12)[0]
with open(src_asar, "rb") as f:
    f.seek(16)
    tree = json.loads(f.read(hdr).decode("utf-8"))
data_start = 16 + hdr

node = tree
for part in ["out", "main", "index.js"]:
    node = node["files"][part]
off, size = int(node["offset"]), int(node["size"])
with open(src_asar, "rb") as f:
    f.seek(data_start + off)
    clean = f.read(size).decode("utf-8")
print("clean index.js:", len(clean), "bytes")

HEAD = (
    "'use strict';"
    "const __byok=require('./byok-main.cjs');"
    "(function(){"
    "var _e=require('electron');"
    # 1) IPC gate：account:*/support:* 一律固定失败，且幂等（先移除旧 handler）
    "try{"
    "var _ih=_e.ipcMain;"
    "if(!_ih.__byokGate){"
    "_ih.__byokGate=true;"
    "var _o=_ih.handle.bind(_ih);"
    "_ih.handle=function(_c,_f){"
    "var _s=(typeof _c==='string')?_c:'';"
    "if(_s.indexOf('account:')===0||_s.indexOf('support:')===0){"
    "try{_ih.removeHandler(_c);}catch(_x){}"
    "return _o(_c,function(){return {ok:false,error:'此副本使用自备模型，不提供账户、订阅、充值或工单服务。'};});"
    "}"
    "return _o(_c,_f);"
    "};"
    "}"
    "}catch(_e1){console.error('[byok] ipc gate failed',_e1);}"
    # 2) 网络层：阻断一切到厂商标识的请求
    "try{"
    "var _net=_e.net;"
    "if(_net&&!_net.__byokBlocked){"
    "_net.__byokBlocked=true;"
    "var _of=_net.fetch.bind(_net);"
    "_net.fetch=function(_u,_opt){"
    "var _s=(typeof _u==='string')?_u:String((_u&&_u.url)||'');"
    "if(new RegExp('plccode'+'ing[.]com|plccode[.]com','i').test(_s)){"
    "return Promise.reject(new Error('offline build: vendor endpoint blocked'));"
    "}"
    "return _of(_u,_opt);"
    "};"
    "}"
    "}catch(_e2){console.error('[byok] net gate failed',_e2);}"
    # 3) 全局 fetch：拦截公告 / 账号 / 更新等一切到厂商域名的请求
    "try{"
    "var _g=globalThis;"
    "if(!_g.__byokFetchGate){"
    "_g.__byokFetchGate=true;"
    "var _gf=_g.fetch;"
    "_g.fetch=function(_u,_opt){"
    "var _s=(typeof _u==='string')?_u:String((_u&&_u.url)||'');"
    "if(new RegExp('plccode'+'ing[.]com|plccode[.]com','i').test(_s)){"
    "return Promise.reject(new Error('offline build: vendor endpoint blocked'));"
    "}"
    "return _gf(_u,_opt);"
    "};"
    "}"
    "}catch(_e3){console.error('[byok] fetch gate failed',_e3);}"
    "})();"
)

TAIL = (
    ";"
    "(function(){"
    "try{"
    "if(typeof AccountStore!=='undefined'){"
    "Object.defineProperty(AccountStore.prototype,'current',{"
    "get:function(){return __byok.compatState();},"
    "configurable:true"
    "});"
    "console.log('[byok] account store overridden');"
    "}"
    "}catch(_e1){console.error('[byok] override failed',_e1);}"
    "try{Promise.resolve(__byok.initialize()).catch(function(_e2){console.error('[byok] init failed',_e2);});}"
    "catch(_e3){console.error('[byok] init threw',_e3);}"
    "try{"
    "__byok.register({busy:function(){return false;},changed:function(){}});"
    "console.log('[byok] channels registered');"
    "}catch(_e4){console.error('[byok] register failed',_e4);}"
    "})();"
)

assert clean.startswith("'use strict';")
out = HEAD + clean[len("'use strict';"):] + TAIL
io.open(p, "w", encoding="utf-8", newline="").write(out)
print("written:", len(out), "bytes")
