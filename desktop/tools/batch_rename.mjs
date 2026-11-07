import fs from 'node:fs';
import path from 'node:path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

const srcDir = process.argv[2];
const outDir = process.argv[3];
const OBF = /^_0x[0-9a-f]{3,10}$/i;

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
let done = 0;

for (const f of files) {
  const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
  let out = code;
  try {
    const ast = parser.parse(code, { sourceType: 'module' });
    const names = new Map();
    const taken = new Set();
    let n = 0;
    traverse(ast, {
      Identifier(p) {
        const nm = p.node.name;
        if (!OBF.test(nm)) taken.add(nm);
      },
    });
    const nextName = () => {
      let cand;
      do { n += 1; cand = `v${n}`; } while (taken.has(cand));
      taken.add(cand);
      return cand;
    };
    traverse(ast, {
      Identifier(p) {
        const name = p.node.name;
        if (!OBF.test(name)) return;
        if (p.parentPath.isMemberExpression() && p.parentPath.node.property === p.node && !p.parentPath.node.computed) return;
        if ((p.parentPath.isObjectProperty() || p.parentPath.isObjectMethod() || p.parentPath.isClassMethod()) &&
            p.parentPath.node.key === p.node && !p.parentPath.node.computed) return;
        if (!names.has(name)) { names.set(name, nextName()); }
        p.node.name = names.get(name);
      },
    });
    out = generate(ast, { comments: true, jsescOption: { minimal: true } }, code).code;
    console.log(`${f}\t${names.size} ids\t${code.length} -> ${out.length}`);
    done++;
  } catch (e) {
    console.log(`${f}\tPARSE FAIL (kept as-is): ${e.message}`);
    out = code;
  }
  fs.writeFileSync(path.join(outDir, f), out, 'utf8');
}
console.log(`renamed ${done}/${files.length}`);
