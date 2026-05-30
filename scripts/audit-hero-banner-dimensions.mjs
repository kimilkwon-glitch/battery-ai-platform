#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public/assets/banners");

function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] !== 0x89) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

const files = fs.readdirSync(dir).filter((f) => f.startsWith("main-hero") && f.endsWith(".png")).sort();
console.log("Hero banner PNG dimensions:\n");
for (const f of files) {
  const s = pngSize(path.join(dir, f));
  if (!s) continue;
  const ratio = (s.width / s.height).toFixed(4);
  console.log(`  ${f}: ${s.width}×${s.height} (ratio ${ratio})`);
}
