import fs from 'node:fs';
import path from 'node:path';
import { webcrack } from 'webcrack';

const src = process.argv[2];
const dst = process.argv[3];

const code = fs.readFileSync(src, 'utf8');
console.log('input chars:', code.length);
const t0 = Date.now();
const result = await webcrack(code, {
  mangle: false,
  unminify: true,
  deobfuscate: true,
  unpack: false,
  jsx: false,
});
console.log('elapsed ms:', Date.now() - t0);
console.log('saved chars:', result.code.length);
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, result.code, 'utf8');
if (result.bundle) {
  console.log('bundle detected, modules:', result.bundle.modules?.length);
}
