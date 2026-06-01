#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "public/assets/vehicles/cars-normalized");

const configPath = path.join(root, "src/data/vehicle-generation-v04.config.ts");
const src = fs.readFileSync(configPath, "utf8");
const files = [...src.matchAll(/imageFile:\s*"([^"]+)"/g)].map((m) => m[1]);
const brands = [...src.matchAll(/brand:\s*"(renault|ssangyong|kg|hyundai|kia)"/g)].map((m) => m[1]);

let fail = 0;
let i = 0;
for (const file of files) {
  const brand = brands[i] ?? "renault";
  i++;
  const full = path.join(base, brand, file);
  if (!fs.existsSync(full)) {
    console.log("MISSING", brand, file);
    fail++;
  }
}
console.log("Checked", files.length, "imageFile entries,", fail, "missing");
process.exit(fail > 0 ? 1 : 0);
