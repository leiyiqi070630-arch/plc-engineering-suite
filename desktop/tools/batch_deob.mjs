import fs from 'node:fs';
import path from 'node:path';
import { webcrack } from 'webcrack';

const dir = process.argv[2];
const outDir = process.argv[3];
const skip = new Set((process.argv[4] || '').split(',').filter(Boolean));

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !skip.has(f)).sort();
console.log('files:', files.length);

for (const f of files) {
  const src = path.join(dir, f);
  const dst = path.join(outDir, f);
  const code = fs.readFileSync(src, 'utf8');
  const t0 = Date.now();
  try {
    const result = await webcrack(code, { mangle: false, unminify: true, deobfuscate: true, unpack: false, jsx: false });
    fs.writeFileSync(dst, result.code, 'utf8');
    console.log(`${f}\t${code.length} -> ${result.code.length}\t${Date.now() - t0}ms`);
  } catch (e) {
    console.log(`${f}\tFAILED: ${e.message}`);
    fs.writeFileSync(dst, code, 'utf8');
  }
}
console.log('DONE');
