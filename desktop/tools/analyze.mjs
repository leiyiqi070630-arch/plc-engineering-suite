import fs from 'node:fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const file = process.argv[2];
const code = fs.readFileSync(file, 'utf8');
const ast = parser.parse(code, {
  sourceType: 'script',
  errorRecovery: true,
  plugins: [],
});

const funcs = [];
const classes = [];
const ipc = [];
const requires = [];
const consts = [];

traverse(ast, {
  FunctionDeclaration(path) {
    funcs.push({ name: path.node.id?.name, line: path.node.loc?.start.line, end: path.node.loc?.end.line });
  },
  VariableDeclarator(path) {
    const init = path.node.init;
    if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
      funcs.push({ name: path.node.id?.name, line: init.loc?.start.line, end: init.loc?.end.line, expr: true });
    }
  },
  ClassDeclaration(path) {
    classes.push({ name: path.node.id?.name, line: path.node.loc?.start.line, end: path.node.loc?.end.line });
  },
  CallExpression(path) {
    const c = path.node.callee;
    const src = c.type === 'MemberExpression' ? `${c.object?.name}.${c.property?.name}` : c.name;
    if (src && /ipcMain\.(handle|on|handleOnce|removeHandler)|webContents\.send|\.send\(/.test(src)) {
      const arg = path.node.arguments[0];
      const val = arg && (arg.type === 'StringLiteral' ? arg.value : arg.type === 'TemplateLiteral' ? arg.quasis.map(q => q.value.cooked).join('${}') : null);
      ipc.push({ fn: src, channel: val, line: path.node.loc?.start.line });
    }
  },
});

// also catch require()
for (const m of code.matchAll(/require\(["']([^"']+)["']\)/g)) requires.push(m[1]);

funcs.sort((a, b) => (a.line || 0) - (b.line || 0));
const out = {
  file,
  lines: code.split('\n').length,
  functions: funcs,
  classes,
  ipc,
  requires: [...new Set(requires)],
};
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log('functions:', funcs.length, 'classes:', classes.length, 'ipc:', ipc.length, 'requires:', out.requires.length);
console.log('--- IPC channels ---');
const seen = new Set();
for (const i of ipc) {
  const k = `${i.fn}:${i.channel}`;
  if (seen.has(k)) continue;
  seen.add(k);
  console.log(String(i.line).padStart(6), i.fn.padEnd(22), i.channel);
}
