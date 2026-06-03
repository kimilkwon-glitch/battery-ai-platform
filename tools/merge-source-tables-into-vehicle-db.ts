#!/usr/bin/env npx tsx
/**
 * Merge 3 source 차종표 into src/data/vehicle-battery-db.json (non-destructive for user_final_confirmed).
 * Output: reports/source-table-merge-audit.json + .md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

import vehicleBatteryDb from "../src/data/vehicle-battery-db.json";
import type { VehicleBatteryRecord } from "../src/lib/vehicleBattery";
import {
  SOURCE_PATHS,
  buildNormalizationRules,
  mergeIncomingRecord,
  normalizeBrand,
  parseFuel,
  parseYearRange,
  rowToRecord,
  type ParsedRow,
  recordDedupeKey,
} from "./lib/source-table-merge-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "src/data/vehicle-battery-db.json");
const AUDIT_JSON = path.join(ROOT, "reports/source-table-merge-audit.json");
const AUDIT_MD = path.join(ROOT, "reports/source-table-merge-audit.md");

type DbRoot = {
  meta: Record<string, unknown>;
  normalizationRules: Record<string, string>;
  records: VehicleBatteryRecord[];
};

type FileProbe = {
  path: string;
  exists: boolean;
  sheetNames?: string[];
  sheets?: { name: string; rowCount: number; headers: string[] }[];
  brandCounts?: [string, number][];
  error?: string;
};

function readWorkbook(relPath: string): XLSX.WorkBook {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) throw new Error(`Missing source file: ${relPath}`);
  return XLSX.read(fs.readFileSync(abs), { type: "buffer", cellDates: true });
}

function probeFile(relPath: string, label: string, source: string): FileProbe {
  try {
    const wb = readWorkbook(relPath);
    const sheets = wb.SheetNames.map((name) => {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" }) as Record<string, unknown>[];
      const headers = rows[0] ? Object.keys(rows[0]) : [];
      return { name, rowCount: rows.length, headers };
    });
    return { path: relPath, exists: true, sheetNames: wb.SheetNames, sheets };
  } catch (e) {
    return { path: relPath, exists: false, error: String(e) };
  }
}

function parseGongim(wb: XLSX.WorkBook): ParsedRow[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
  const out: ParsedRow[] = [];
  for (const row of rows) {
    const brand = row["브랜드"] ?? row["브랜드 "] ?? "";
    const model = row["차종"] ?? "";
    if (!brand || !model || /브랜드|차종/i.test(brand)) continue;
    const detail = row["세부차종"] ?? model;
    const years = row["연식"] ?? null;
    const fuel = row["연종"] ?? row["연료"] ?? null;
    const originalProduct = row["제품명"] ?? "";
    const rawProduct = row["원본제품명"] ?? originalProduct;
    out.push({
      brand,
      model,
      displayName: detail,
      detail,
      years,
      ...parseYearRange(years ?? ""),
      fuel: parseFuel(String(fuel ?? "")),
      rawProduct,
      originalProduct,
      source: "공임",
    });
  }
  return out;
}

function parseRecent(wb: XLSX.WorkBook): ParsedRow[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];
  const out: ParsedRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const brand = String(row[0] ?? "").trim();
    const model = String(row[1] ?? "").trim();
    const detail = String(row[2] ?? "").trim();
    const battery = String(row[3] ?? "").trim();
    if (!brand || !model || brand === "제조사") continue;
    const yearsFromDetail = detail.match(/\(([^)]+)\)/)?.[1] ?? detail;
    out.push({
      brand,
      model,
      displayName: detail || model,
      detail: detail || model,
      years: yearsFromDetail,
      ...parseYearRange(yearsFromDetail),
      fuel: parseFuel(detail),
      rawProduct: battery,
      originalProduct: battery,
      source: "최근",
    });
  }
  return out;
}

function parseKasuriDomestic(wb: XLSX.WorkBook): ParsedRow[] {
  const sheetName =
    wb.SheetNames.find((n) => n === "국산" || n.includes("국산")) ?? wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" }) as unknown[][];
  const out: ParsedRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const brand = String(row[0] ?? "").trim();
    const model = String(row[1] ?? "").trim();
    const detail = String(row[2] ?? "").trim();
    const battery = String(row[3] ?? "").trim();
    if (!brand || (!model && !detail) || /차종|브랜드|BMW|벤츠/i.test(brand)) continue;
    const yearsFromDetail = detail.match(/\(([^)]+)\)/)?.[1] ?? detail;
    out.push({
      brand,
      model: model || (detail.split(/[(\s]/)[0] ?? detail),
      displayName: detail || model,
      detail: detail || model,
      years: yearsFromDetail,
      ...parseYearRange(yearsFromDetail),
      fuel: parseFuel(detail),
      rawProduct: battery,
      originalProduct: battery,
      source: "카수리",
    });
  }
  return out;
}

function countBrands(rows: ParsedRow[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const r of rows) {
    const b = normalizeBrand(r.brand);
    c[b] = (c[b] || 0) + 1;
  }
  return c;
}

function countDbBrands(records: VehicleBatteryRecord[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const r of records) c[r.brand] = (c[r.brand] || 0) + 1;
  return c;
}

function main() {
  const missing = Object.values(SOURCE_PATHS).filter((p) => !fs.existsSync(path.join(ROOT, p)));
  if (missing.length) {
    console.error("STOP: missing source files:", missing);
    process.exit(1);
  }

  const probes: FileProbe[] = [
    probeFile(SOURCE_PATHS.gongim, "공임", "공임"),
    probeFile(SOURCE_PATHS.recent, "최근", "최근"),
    probeFile(SOURCE_PATHS.kasuri, "카수리", "카수리"),
  ];

  const wbG = readWorkbook(SOURCE_PATHS.gongim);
  const wbR = readWorkbook(SOURCE_PATHS.recent);
  const wbK = readWorkbook(SOURCE_PATHS.kasuri);

  const parsedG = parseGongim(wbG);
  const parsedR = parseRecent(wbR);
  const parsedK = parseKasuriDomestic(wbK);
  const allParsed = [...parsedG, ...parsedR, ...parsedK];

  probes[0].brandCounts = Object.entries(countBrands(parsedG)).sort((a, b) => b[1] - a[1]);
  probes[1].brandCounts = Object.entries(countBrands(parsedR)).sort((a, b) => b[1] - a[1]);
  probes[2].brandCounts = Object.entries(countBrands(parsedK)).sort((a, b) => b[1] - a[1]);

  const db = vehicleBatteryDb as DbRoot;
  const beforeCount = db.records.length;
  const beforeBrands = countDbBrands(db.records);
  const rules = buildNormalizationRules(db.normalizationRules);

  const index = new Map<string, VehicleBatteryRecord>();
  for (const r of db.records) index.set(recordDedupeKey(r), r);

  const stats = {
    parsedTotal: allParsed.length,
    added: 0,
    merged: 0,
    skippedProtected: 0,
    duplicateSkipped: 0,
    noBatterySkipped: 0,
    bySource: { 공임: 0, 최근: 0, 카수리: 0 } as Record<string, number>,
    byBrandAdded: {} as Record<string, number>,
  };

  const protectedBefore = db.records.filter((r) => r.correctedBy === "user_final_confirmed").length;

  for (const row of allParsed) {
    const rec = rowToRecord(row, rules);
    if (!rec) {
      stats.noBatterySkipped++;
      continue;
    }
    const key = recordDedupeKey(rec);
    const existing = index.get(key);
    const { record, action } = mergeIncomingRecord(existing, rec);
    if (action === "added") {
      index.set(key, record);
      stats.added++;
      stats.bySource[row.source] = (stats.bySource[row.source] ?? 0) + 1;
      const nb = normalizeBrand(record.brand);
      stats.byBrandAdded[nb] = (stats.byBrandAdded[nb] ?? 0) + 1;
    } else if (action === "merged") {
      index.set(key, record);
      stats.merged++;
    } else if (action === "skipped_protected") {
      stats.skippedProtected++;
    } else {
      stats.duplicateSkipped++;
    }
  }

  const records = [...index.values()];
  const afterBrands = countDbBrands(records);
  const protectedAfter = records.filter((r) => r.correctedBy === "user_final_confirmed").length;

  const brandDelta = (brand: string) => (afterBrands[brand] ?? 0) - (beforeBrands[brand] ?? 0);

  const out: DbRoot = {
    meta: {
      ...db.meta,
      recordCount: records.length,
      scope: "3개 차종표 전체 통합 + 사용자 직접확정값 보호 (source-table merge 2026-06-03)",
      generatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      rule: "user_final_confirmed·confirmed/high correctedBy 레코드 primaryBattery 비덮어쓰기. 원본 공임·최근·카수리 보강.",
      sourceMergeAt: new Date().toISOString(),
    },
    normalizationRules: rules,
    records,
  };

  fs.writeFileSync(DB_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  const audit = {
    generatedAt: new Date().toISOString(),
    sourceFilesRead: true,
    files: probes,
    before: { recordCount: beforeCount, brands: beforeBrands },
    after: { recordCount: records.length, brands: afterBrands },
    delta: {
      recordCount: records.length - beforeCount,
      renault: brandDelta("르노"),
      chevrolet: brandDelta("쉐보레"),
      ssangyong: brandDelta("쌍용"),
    },
    mergeStats: stats,
    userConfirmedProtection: {
      before: protectedBefore,
      after: protectedAfter,
      intact: protectedBefore === protectedAfter,
    },
    parsedRowCounts: {
      gongim: parsedG.length,
      recent: parsedR.length,
      kasuriDomestic: parsedK.length,
    },
  };

  fs.mkdirSync(path.dirname(AUDIT_JSON), { recursive: true });
  fs.writeFileSync(AUDIT_JSON, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

  const md = [
    "# Source table merge audit",
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## 1. 원본 파일 읽기",
    ...probes.map(
      (p) =>
        `- **${p.path}**: ${p.exists ? "OK" : "MISSING"}${p.sheetNames ? ` — sheets: ${p.sheetNames.join(", ")}` : ""}${p.error ? ` — ${p.error}` : ""}`,
    ),
    "",
    "## 2. 파일별 행 수 / 브랜드",
    ...probes.map((p) => {
      const sheets = p.sheets?.map((s) => `  - ${s.name}: ${s.rowCount} rows`).join("\n") ?? "";
      const brands = p.brandCounts?.slice(0, 12).map(([b, n]) => `${b}(${n})`).join(", ") ?? "";
      return `### ${p.path}\n${sheets}\n- 브랜드: ${brands}`;
    }),
    "",
    "## 3. DB recordCount",
    `- 이전: ${beforeCount}`,
    `- 이후: ${records.length}`,
    `- 추가: ${audit.delta.recordCount}`,
    "",
    "## 4. 브랜드 보강",
    `- 르노: +${audit.delta.renault} (이후 ${afterBrands["르노"] ?? 0})`,
    `- 쉐보레: +${audit.delta.chevrolet} (이후 ${afterBrands["쉐보레"] ?? 0})`,
    `- 쌍용: +${audit.delta.ssangyong} (이후 ${afterBrands["쌍용"] ?? 0})`,
    "",
    "## 5. 병합 통계",
    "```json",
    JSON.stringify(stats, null, 2),
    "```",
    "",
    "## 6. 사용자 확정값 보호",
    `- user_final_confirmed: ${protectedBefore} → ${protectedAfter} (intact: ${audit.userConfirmedProtection.intact})`,
    "",
  ].join("\n");
  fs.writeFileSync(AUDIT_MD, md, "utf8");

  console.log(JSON.stringify(audit.delta, null, 2));
  console.log("mergeStats", stats);
  console.log("Wrote", DB_PATH, AUDIT_JSON);
}

main();
