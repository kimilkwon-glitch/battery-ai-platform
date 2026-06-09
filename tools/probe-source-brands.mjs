#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const recent = path.join(ROOT, "src/data/source-tables/최근 배터리 차종표.xlsx");
const wb = XLSX.read(fs.readFileSync(recent), { type: "buffer" });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });
const brands = {};
for (let i = 1; i < rows.length; i++) {
  const b = String(rows[i][0] ?? "").trim();
  if (!b || b === "제조사") continue;
  brands[b] = (brands[b] || 0) + 1;
}
const sorted = Object.entries(brands).sort((a, b) => b[1] - a[1]);
fs.writeFileSync(
  path.join(ROOT, "tools/probe-source-brands-out.json"),
  JSON.stringify({ total: rows.length - 1, brands: sorted }, null, 2),
  "utf8",
);
console.log("written", sorted.slice(0, 30));
