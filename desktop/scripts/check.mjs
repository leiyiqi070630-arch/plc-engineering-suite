/**
 * check.mjs — 源码完整性自检：语法 + 关键符号 + IPC 通道覆盖率。
 * 不启动 Electron，纯静态检查，用于确认重构产物没有结构性损坏。
 *
 * 主进程/preload 是 CommonJS（node --check 直接可用）；
 * 渲染进程 bundle 是 ESM，node --check 会按 CJS 解析，所以复制成 .mjs 再检查。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const rendererDir = path.join(root, 'src', 'renderer');

const jsFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(c?js)$/.test(e.name)) jsFiles.push(p);
  }
})(path.join(root, 'src'));

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plccode-check-'));
let failed = 0;
let checked = 0;

for (const f of jsFiles) {
  const isEsm = f.startsWith(rendererDir + path.sep);
  let target = f;
  let cleanup = null;
  if (isEsm) {
    target = path.join(tmpDir, path.basename(f).replace(/\.js$/, '') + '.mjs');
    fs.copyFileSync(f, target);
    cleanup = target;
  }
  try {
    execFileSync(node, ['--check', target], { stdio: 'pipe' });
    checked++;
  } catch (e) {
    failed++;
    console.error('SYNTAX FAIL', path.relative(root, f), '\n', e.stderr?.toString().slice(0, 300));
  } finally {
    if (cleanup) fs.rmSync(cleanup, { force: true });
  }
}
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`syntax: ${checked}/${jsFiles.length} ok`);

// 关键能力断言
const main = fs.readFileSync(path.join(root, 'src/main/index.js'), 'utf8');
const preload = fs.readFileSync(path.join(root, 'src/preload/index.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'src/renderer/assets/index-CXb3UsfP.js'), 'utf8');

const assertions = [
  ['main: ipcMain.handle 注册数', (main.match(/ipcMain\.handle\(/g) || []).length, 80],
  ['main: EngineBridge 类', /class EngineBridge/.test(main), true],
  ['main: BYOK 入口', /byok-main\.cjs/.test(main), true],
  ['preload: contextBridge', /contextBridge\.exposeInMainWorld/.test(preload), true],
  ['renderer: React 标记', /react\.transitional\.element/.test(renderer), true],
  ['main: 残留混淆调用', (main.match(/_0x[0-9a-f]{4,6}\(/g) || []).length, 0],
];

for (const [label, actual, expected] of assertions) {
  const ok = typeof expected === 'number' ? actual >= expected : actual === expected;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}: ${actual}${typeof expected === 'number' ? ` (expect >= ${expected})` : ''}`);
  if (!ok) failed++;
}

process.exitCode = failed ? 1 : 0;
