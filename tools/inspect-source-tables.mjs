#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  { key: "gongim", label: "공임", path: "src/data/source-tables/공임차종표_프로그램용.xlsx", source: "공임" },
  { key: "recent", label: "최근", path: "src/data/source-tables/최근 배터리 차종표.xlsx", source: "최근" },
  { key: "kasuri", label: "카수리", path: "src/data/source-tables/카수리 차종표.xls", source: "카수리" },
];

function sheetPreview(wb, sheetName, maxRows = 3) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return { rowCount: rows.length, headers, sample: rows.slice(0, maxRows) };
}

const report = { files: [] };
for (const f of FILES) {
  const abs = path.join(ROOT, f.path);
  if (!fs.existsSync(abs)) {
    report.files.push({ ...f, error: "missing" });
    continue;
  }
  const buf = fs.readFileSync(abs);
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  const sheets = wb.SheetNames.map((name) => ({
    name,
    ...sheetPreview(wb, name),
  }));
  report.files.push({
    path: f.path,
    label: f.label,
    source: f.source,
    sheetNames: wb.SheetNames,
    sheets,
  });
}
console.log(JSON.stringify(report, null, 2));
