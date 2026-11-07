import fs from 'node:fs';
import path from 'node:path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

const src = process.argv[2];
const dst = process.argv[3];
const mapOut = process.argv[4];

let code = fs.readFileSync(src, 'utf8');
const srcType = process.argv[5] || 'unambiguous';
const ast = parser.parse(code, { sourceType: srcType, errorRecovery: false });

// 收集所有混淆标识符名
const names = new Map(); // old -> new
let n = 0;
const OBF = /^_0x[0-9a-f]{3,10}$/i;

// 先登记文件中本来就存在的（非混淆）标识符，避免新名字撞车
const taken = new Set();
traverse(ast, {
  Identifier(p) {
    const nm = p.node.name;
    if (!OBF.test(nm)) taken.add(nm);
  },
});

function nextName() {
  let cand;
  do {
    n += 1;
    cand = `v${n}`;
  } while (taken.has(cand));
  taken.add(cand);
  return cand;
}

traverse(ast, {
  // 变量/参数/函数声明
  Identifier(path) {
    const name = path.node.name;
    if (!OBF.test(name)) return;
    // 跳过对象属性 key（非计算）：{_0xabc: 1} 的 key 改名会破坏结构
    if (path.parentPath.isMemberExpression() && path.parentPath.node.property === path.node && !path.parentPath.node.computed) {
      // 属性名保留原样（大多数情况是混淆后的属性名，改成 v1 也可，但为安全保留）
      return;
    }
    if (path.parentPath.isObjectProperty() || path.parentPath.isObjectMethod() || path.parentPath.isClassMethod()) {
      if (path.parentPath.node.key === path.node && !path.parentPath.node.computed) return;
    }
    // label 定义与 break/continue 引用必须同步改名，否则语法错误；这里统一放行
    if (!names.has(name)) {
      names.set(name, nextName());
    }
    path.node.name = names.get(name);
  },
});

const out = generate(ast, { comments: true, jsescOption: { minimal: true } }, code).code;
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, out, 'utf8');
if (mapOut) fs.writeFileSync(mapOut, JSON.stringify(Object.fromEntries(names), null, 1), 'utf8');
console.log(`renamed ${names.size} identifiers, ${code.length} -> ${out.length} chars`);
