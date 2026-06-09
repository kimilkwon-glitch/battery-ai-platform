#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fp = path.join(ROOT, "src/data/source-tables/카수리 차종표.xls");
const wb = XLSX.read(fs.readFileSync(fp), { type: "buffer" });
const domestic = wb.SheetNames.find((n) => n.includes("국산") || n === wb.SheetNames[wb.SheetNames.length - 1]);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[domestic ?? wb.SheetNames[0]], { header: 1, defval: "" });
const brands = {};
for (const row of rows.slice(1)) {
  const b = String(row[0] ?? "").trim();
  if (!b || /차종|브랜드/i.test(b)) continue;
  brands[b] = (brands[b] || 0) + 1;
}
console.log("sheet", domestic, Object.entries(brands).sort((a, b) => b[1] - a[1]));
