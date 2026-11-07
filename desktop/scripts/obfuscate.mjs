/**
 * obfuscate.mjs — 重构原发布版的保护方式（可选步骤）。
 *
 * 原 asar 里 out/**\/*.js 全部被 javascript-obfuscator 处理过：
 *   - 字符串数组 + Base64 + RC4（'ChL0Ag9U' 这类密文）
 *   - 字符串数组轮转（while(true) + parseInt 校验）
 *   - 全局标识符重命名（_0x...）
 * 如需产出与原版同等级别的混淆产物，构建后执行：npm run obfuscate
 *
 * 注意：本脚本会原地覆盖 out/ 下的产物。工程梳理/调试阶段不要运行。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  path.join(root, 'out', 'main', 'index.js'),
  path.join(root, 'out', 'main', 'chunks'),
  path.join(root, 'out', 'preload', 'index.js'),
];

const options = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  stringArray: true,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: ['base64', 'rc4'],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersType: 'function',
  stringArrayWrappersCount: 2,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: true,
  selfDefending: false,
  disableConsoleOutput: false,
  unicodeEscapeSequence: false,
};

function walk(p, out = []) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const f of fs.readdirSync(p)) walk(path.join(p, f), out);
  } else if (p.endsWith('.js')) {
    out.push(p);
  }
  return out;
}

for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  for (const file of walk(t)) {
    const code = fs.readFileSync(file, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(code, options).getObfuscatedCode();
    fs.writeFileSync(file, result, 'utf8');
    console.log('[obfuscate]', path.relative(root, file), code.length, '->', result.length);
  }
}
console.log('[obfuscate] done');
