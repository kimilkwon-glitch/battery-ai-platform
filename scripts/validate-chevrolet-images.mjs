#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "public/assets/cars-normalized/chevrolet-gmdaewoo");
const configPath = path.join(root, "src/data/vehicle-generation-chevrolet.config.ts");
const src = fs.readFileSync(configPath, "utf8");
const files = [...src.matchAll(/imageFile:\s*"([^"]+)"/g)].map((m) => m[1]);

let fail = 0;
for (const file of files) {
  const full = path.join(base, file);
  if (!fs.existsSync(full)) {
    console.log("MISSING", file);
    fail++;
  }
}
console.log("Checked", files.length, "chevrolet imageFile entries,", fail, "missing");
process.exit(fail > 0 ? 1 : 0);
