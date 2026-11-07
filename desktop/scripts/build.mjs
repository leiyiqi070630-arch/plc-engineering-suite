/**
 * build.mjs — 把重构后的源码树组装成 Electron 可直接运行的 out/ 结构。
 *
 * 原程序是 electron-vite 打包产物（out/main、out/preload、out/renderer）。
 * 因为渲染进程 bundle 是预构建的（含 React 19 + mermaid + codemirror 等），
 * 这里不再重新跑 Vite，而是按原结构就位复制，保证行为与原版一致。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'out');

const targets = [
  ['src/main', 'out/main'],
  ['src/preload', 'out/preload'],
  ['src/renderer', 'out/renderer'],
];

fs.rmSync(OUT, { recursive: true, force: true });

for (const [from, to] of targets) {
  const src = path.join(root, from);
  const dst = path.join(root, to);
  if (!fs.existsSync(src)) {
    console.error(`[build] missing ${from}`);
    process.exitCode = 1;
    continue;
  }
  fs.mkdirSync(dst, { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
  console.log(`[build] ${from} -> ${to}`);
}

// 校验：主进程入口与 mcpClient chunk 必须同时存在
const entry = path.join(OUT, 'main', 'index.js');
const chunk = path.join(OUT, 'main', 'chunks', 'mcpClient-DabeyNt0.js');
for (const p of [entry, chunk, path.join(OUT, 'preload', 'index.js'), path.join(OUT, 'renderer', 'index.html')]) {
  if (!fs.existsSync(p)) {
    console.error(`[build] MISSING: ${path.relative(root, p)}`);
    process.exitCode = 1;
  }
}
console.log('[build] done');
