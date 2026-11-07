import fs from 'node:fs';
import path from 'node:path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const preload = process.argv[2];
const main = process.argv[3];
const outMd = process.argv[4];

const code = fs.readFileSync(preload, 'utf8');
const ast = parser.parse(code, { sourceType: 'script' });

// 找到 Channels 对象字面量并求值成扁平 map
const channels = [];
function evalObject(node, prefix) {
  for (const p of node.properties) {
    if (p.type !== 'ObjectProperty') continue;
    const key = p.key.name || p.key.value;
    const full = prefix ? `${prefix}.${key}` : key;
    if (p.value.type === 'ObjectExpression') evalObject(p.value, full);
    else if (p.value.type === 'StringLiteral') channels.push({ const: full, channel: p.value.value });
  }
}

traverse(ast, {
  VariableDeclarator(p) {
    if (p.node.id.name === 'Channels' && p.node.init?.type === 'ObjectExpression') {
      evalObject(p.node.init, '');
    }
  },
});

// 主进程 handler 行号
const mainCode = fs.readFileSync(main, 'utf8');
const mainLines = mainCode.split('\n');
const handlers = new Map();
mainLines.forEach((line, i) => {
  const m = line.match(/ipcMain\.(handle|on|handleOnce)\(Channels\.([A-Za-z0-9_.]+)/);
  if (m) handlers.set(m[2], { kind: m[1], line: i + 1 });
  const m2 = line.match(/sendToRenderer\([^,]+,\s*Channels\.([A-Za-z0-9_.]+)/);
  if (m2) {
    const prev = handlers.get(m2[1]);
    handlers.set(m2[1], { kind: prev?.kind || 'main→renderer', line: i + 1 });
  }
});

// preload 里暴露的 api 方法名（用于标注）
const apiMethods = [];
const apiBlock = code.slice(code.indexOf('const api = {'));
for (const m of apiBlock.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)) apiMethods.push(m[1]);

const rows = channels
  .map(c => {
    const h = handlers.get(c.const);
    return {
      channel: c.channel,
      constant: c.const,
      dir: h ? (h.kind === 'main→renderer' ? '主→渲染' : h.kind === 'on' ? '渲染→主(单向)' : '渲染→主(invoke)') : '（未在主进程注册）',
      line: h?.line ?? '',
    };
  })
  .sort((a, b) => a.channel.localeCompare(b.channel));

const md = [];
md.push('# IPC 通道表（自动生成）\n');
md.push(`共 ${rows.length} 个通道常量，主进程注册 ${rows.filter(r => r.line).length} 个。\n`);
md.push('| 通道 | preload 常量 | 方向/注册方式 | main/index.js 行 |');
md.push('| --- | --- | --- | --- |');
for (const r of rows) md.push(`| \`${r.channel}\` | \`${r.constant}\` | ${r.dir} | ${r.line} |`);
md.push('\n> 生成脚本：`scripts/gen-ipc-doc.mjs`；数据源：`src/preload/index.js`（Channels 常量）+ `src/main/index.js`（ipcMain 注册点）。');
md.push(`\n## preload 暴露的 API 方法（window.plcBridge）\n`);
md.push('共 ' + apiMethods.length + ' 个：\n');
md.push(apiMethods.map(m => '`' + m + '`').join('、'));

fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log('channels:', rows.length, 'handlers:', handlers.size, 'api methods:', apiMethods.length);
