#!/usr/bin/env npx tsx
/**
 * Vehicle / battery / alias / asset DB integrity audit (read-only on sources).
 * Output: reports/vehicle-db-integrity-audit.json + .md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import vehicleBatteryDb from "../src/data/vehicle-battery-db.json";
import enrichmentJson from "../src/data/vehicle-battery-enrichment.json";
import { vehicleAliasDbV01 } from "../src/data/vehicle-alias-db.ts";
import { vehicleAliasDbV02Supplement } from "../src/data/vehicle-alias-v02-supplement.ts";
import { vehicleAliasDbV03NewEntries } from "../src/data/vehicle-alias-v03-supplement.ts";
import { vehicleAliasDbV04NewEntries } from "../src/data/vehicle-alias-v04-supplement.ts";
import { VEHICLE_GENERATIONS_V04 } from "../src/data/vehicle-generation-v04.config.ts";
import { VEHICLE_GENERATIONS_CHEVROLET } from "../src/data/vehicle-generation-chevrolet.config.ts";
import { vehicleAssets, type VehicleAsset } from "../src/lib/car-assets.ts";
import { vehicleAssetsGenesis } from "../src/lib/vehicle-asset-genesis.ts";
import { vehicleAssetsV04 } from "../src/lib/vehicle-asset-v04.ts";
import { vehicleAssetsChevrolet } from "../src/lib/vehicle-asset-chevrolet.ts";
import { getVehicleCardBatteryInfo } from "../src/lib/vehicleBattery.ts";
import { vehicleAssetsToSearchRows } from "../src/lib/vehicle-search.ts";
import { resolveSearchVehicleAlias } from "../src/lib/search/search-vehicle-aliases.ts";
import { isBatterySpecPrimaryQuery } from "../src/lib/search/battery-spec-search-alias.ts";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "../src/lib/vehicle-fuel-primary-battery.ts";
import { HOME_MAIN_SEARCH_EXAMPLES } from "../src/lib/home-main-catalog-data.ts";
import {
  CUSTOMER_NON_SEARCH_KEYWORDS,
  CUSTOMER_BATTERY_SPEC_CODES,
  sanitizeCustomerBatterySummary,
} from "../src/lib/search/customer-search-display.ts";
import { searchCustomerSuggestions } from "../src/lib/search/customer-search-autocomplete.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPORT_JSON = path.join(ROOT, "reports", "vehicle-db-integrity-audit.json");
const REPORT_MD = path.join(ROOT, "reports", "vehicle-db-integrity-audit.md");

const FORBIDDEN_PHRASES = [
  "vehicle-battery-db",
  "needsReview",
  "needs_review",
  "미등록",
  "차량표 미등록",
  "DB",
  "debug",
  "slug",
  "내부",
  "사진·문의로 확인",
  "사진 문의",
  "연료별 확인",
  "규격 재확인",
  "등록된 규격 없음",
  "battery:needsReview",
  "battery:linked",
  "연식, 연료, ISG 여부에 따라 배터리 규격 확인이 필요합니다",
  "문의·사진 확인",
];

const DISPLAY_RISKY_RE =
  /삼각떼|코스\b|케이쓰리|케이3|케삼|산타페|소나타|그랜져|펠리|팰리|렉스턴 스포츠 아님|스타렉스|스타랙스|캡쳐|큐엠|에스엠|뉴스타일|뉴 스타일 코란도/i;

const SEARCH_FORBIDDEN = [
  ...CUSTOMER_NON_SEARCH_KEYWORDS,
  "블랙박스 방전",
  "장기주차 방전",
  "배터리 경고등",
  "부산 배터리 출장",
  "덕천동 배터리",
  "학장동 배터리",
];

const REQUIRED_SEARCHES: {
  query: string;
  expectVehicle?: boolean;
  expectSpec?: string;
  minRows?: number;
  topModelIncludes?: string;
}[] = [
  { query: "GV80", expectVehicle: true, expectSpec: "AGM95R", topModelIncludes: "GV80" },
  { query: "gv80", expectVehicle: true, expectSpec: "AGM95R", topModelIncludes: "GV80" },
  { query: "지브이80", expectVehicle: true, topModelIncludes: "GV80" },
  { query: "제네시스 GV80", expectVehicle: true, topModelIncludes: "GV80" },
  { query: "GV70", expectVehicle: true, expectSpec: "AGM80R", topModelIncludes: "GV70" },
  { query: "GV60", expectVehicle: true, expectSpec: "AGM60L", topModelIncludes: "GV60" },
  { query: "스타리아", expectVehicle: true, expectSpec: "AGM80R", topModelIncludes: "스타리아" },
  { query: "스타리아 AGM80L", expectVehicle: true, topModelIncludes: "스타리아" },
  { query: "K3", expectVehicle: true, minRows: 2, topModelIncludes: "K3" },
  { query: "올뉴 K3", expectVehicle: true, topModelIncludes: "K3" },
  { query: "쏘나타", expectVehicle: true, minRows: 2, topModelIncludes: "쏘나타" },
  { query: "쏘나타 DN8", expectVehicle: true, topModelIncludes: "쏘나타" },
  { query: "코란도", expectVehicle: true, topModelIncludes: "코란도" },
  { query: "코란도 C", expectVehicle: true, topModelIncludes: "코란도" },
  { query: "티볼리", expectVehicle: true, topModelIncludes: "티볼리" },
  { query: "포터2", expectVehicle: true, topModelIncludes: "포터" },
  { query: "포터2 2020년식", expectVehicle: true, topModelIncludes: "포터" },
  { query: "쏘렌토 MQ4", expectVehicle: true, topModelIncludes: "쏘렌토" },
  { query: "쏘렌토 MQ4 하이브리드", expectVehicle: true, topModelIncludes: "쏘렌토" },
  { query: "21년식 싼타페", expectVehicle: true, topModelIncludes: "싼타페" },
  { query: "100R", expectSpec: "100R" },
];

const DIRECTION_PAIRS: [string, string][] = [
  ["AGM80L", "AGM80R"],
  ["AGM95L", "AGM95R"],
  ["AGM95L", "100R"],
  ["AGM95R", "100R"],
  ["AGM80L", "80R"],
  ["AGM80R", "80L"],
  ["AGM95L", "90R"],
  ["AGM95R", "90R"],
  ["CMF80L", "AGM80L"],
];

const VEHICLE_SPEC_EXPECT: Record<string, { must?: string; forbid?: string[] }> = {
  GV70: { must: "AGM80R", forbid: ["AGM80L"] },
  GV80: { must: "AGM95R", forbid: ["AGM95L"] },
  스타리아: { must: "AGM80R", forbid: ["AGM80L", "80L", "CMF80L"] },
};

type Finding = {
  category: string;
  file: string;
  field?: string;
  value?: string;
  suggestion?: string;
  priority?: "P0" | "P1" | "P2";
  meta?: Record<string, unknown>;
};

const findings: Finding[] = [];

function suggestReplacement(text: string): string {
  const spec = text.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i)?.[0];
  if (spec && !FORBIDDEN_PHRASES.some((p) => text.includes(p))) return `대표 규격 ${spec.toUpperCase()}`;
  if (/사진|문의|확인/i.test(text)) return "사진 확인 권장";
  if (/연식|연료|옵션|ISG/i.test(text)) return "연식·옵션별 확인 필요";
  return "상담 확인 필요";
}

function scanText(source: string, file: string, field: string, text: string) {
  if (!text?.trim()) return;
  for (const phrase of FORBIDDEN_PHRASES) {
    if (text.includes(phrase)) {
      findings.push({
        category: "forbidden_customer_copy",
        file: source,
        field: `${file}.${field}`,
        value: text.slice(0, 200),
        suggestion: suggestReplacement(text),
        priority: "P0",
      });
    }
  }
  const sanitized = sanitizeCustomerBatterySummary(text);
  if (sanitized === null && text.length > 3 && !/대표 규격/i.test(text)) {
    findings.push({
      category: "sanitize_null",
      file: source,
      field: `${file}.${field}`,
      value: text.slice(0, 200),
      suggestion: suggestReplacement(text),
      priority: "P1",
    });
  }
}

function scanAliasEntries(entries: { canonicalName: string; displayAliases: string[]; aliases: string[] }[], source: string) {
  for (const e of entries) {
    if (DISPLAY_RISKY_RE.test(e.canonicalName)) {
      findings.push({
        category: "risky_display_name",
        file: source,
        field: "canonicalName",
        value: e.canonicalName,
        suggestion: "고객 통용 정식명으로 변경",
        priority: "P0",
        meta: { vehicle: e.canonicalName },
      });
    }
    for (const da of e.displayAliases ?? []) {
      if (DISPLAY_RISKY_RE.test(da)) {
        findings.push({
          category: "risky_display_alias",
          file: source,
          field: "displayAliases",
          value: da,
          suggestion: "aliases로만 이동, displayAliases에서 제거",
          priority: "P1",
          meta: { canonical: e.canonicalName },
        });
      }
    }
  }
}

function collectAssets(): VehicleAsset[] {
  return [...vehicleAssets];
}

function auditUnmatchedAssets() {
  for (const a of collectAssets()) {
    const slug = a.catalogId ?? a.id;
    const db = getVehicleCardBatteryInfo(slug);
    const hasDefault = Boolean(a.defaultBatteryCode);
    const hasDb = db.hasConfirmedDb && Boolean(db.displayCode);
    if (!hasDefault && !hasDb) {
      findings.push({
        category: "unmatched_asset",
        file: "vehicleAssets",
        field: "asset",
        value: a.displayName,
        suggestion: "DB 연결 또는 상담 확인 필요만 노출",
        priority: "P1",
        meta: {
          assetId: a.id,
          catalogId: slug,
          brand: a.brand,
          yearRange: a.yearRange,
          dbModels: a.dbModels,
          batteryMatchStatus: a.batteryMatchStatus,
        },
      });
    }
  }
}

function extractSpecFromRow(row: { recommend?: string; origin?: string; batteryNotes?: string }): string | null {
  const hay = `${row.recommend ?? ""} ${row.origin ?? ""} ${row.batteryNotes ?? ""}`;
  const m = hay.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i);
  return m?.[1]?.toUpperCase() ?? null;
}

function auditSearchQueries() {
  const results: Record<string, unknown>[] = [];
  for (const t of REQUIRED_SEARCHES) {
    let rows: ReturnType<typeof vehicleAssetsToSearchRows> = [];
    let alias: ReturnType<typeof resolveSearchVehicleAlias> = null;
    try {
      alias = resolveSearchVehicleAlias(t.query);
      rows = vehicleAssetsToSearchRows(t.query, 8, alias);
    } catch (err) {
      results.push({
        query: t.query,
        pass: false,
        issues: [`runtime error: ${err instanceof Error ? err.message : String(err)}`],
        top: null,
        topSpec: null,
        rowCount: 0,
      });
      findings.push({
        category: "search_audit_fail",
        file: "vehicle-search.ts",
        value: t.query,
        suggestion: "검색 런타임 오류",
        priority: "P0",
      });
      continue;
    }
    const top = rows[0];
    const topSpec = top ? extractSpecFromRow(top) : null;
    const rowText = rows.map((r) => `${r.model}|${r.recommend}`).join("; ");
    let pass = true;
    const issues: string[] = [];

    if (t.expectVehicle && rows.length === 0) {
      pass = false;
      issues.push("차량 결과 없음");
    }
    if (t.minRows && rows.length < t.minRows) {
      pass = false;
      issues.push(`세대 카드 부족 (${rows.length}<${t.minRows})`);
    }
    if (t.topModelIncludes && top && !top.model.includes(t.topModelIncludes)) {
      pass = false;
      issues.push(`상단 모델 불일치: ${top.model}`);
    }
    if (t.expectSpec && topSpec !== t.expectSpec) {
      const slug = alias?.assetId ?? alias?.catalogId;
      const op = slug ? OPERATOR_SLUG_PRIMARY_BATTERY[slug] : undefined;
      if (op !== t.expectSpec && topSpec !== t.expectSpec) {
        pass = false;
        issues.push(`규격 기대 ${t.expectSpec} 실제 ${topSpec ?? "없음"}`);
      }
    }
    if (isBatterySpecPrimaryQuery(t.query) && rows.length > 0 && !/AGM|DIN|\d+R/i.test(top?.model ?? "")) {
      // battery-first query with only vehicles may be ok
    }

    for (const phrase of FORBIDDEN_PHRASES) {
      if (rowText.includes(phrase)) {
        pass = false;
        issues.push(`금지문구: ${phrase}`);
      }
    }

    results.push({ query: t.query, pass, issues, top: top?.model, topSpec, rowCount: rows.length });
    if (!pass) {
      findings.push({
        category: "search_audit_fail",
        file: "vehicle-search.ts",
        field: "vehicleAssetsToSearchRows",
        value: t.query,
        suggestion: issues.join(", "),
        priority: "P0",
        meta: { issues, rows: rows.slice(0, 3).map((r) => ({ model: r.model, recommend: r.recommend, note: r.note })) },
      });
    }
  }
  return results;
}

function auditDirectionMismatches() {
  for (const t of REQUIRED_SEARCHES) {
    if (!t.expectSpec) continue;
    let rows: ReturnType<typeof vehicleAssetsToSearchRows> = [];
    try {
      rows = vehicleAssetsToSearchRows(t.query, 5);
    } catch {
      continue;
    }
    const top = rows[0];
    if (!top) continue;
    const spec = extractSpecFromRow(top);
    const vehicleKey = Object.keys(VEHICLE_SPEC_EXPECT).find((k) => top.model.includes(k));
    if (!vehicleKey) continue;
    const rule = VEHICLE_SPEC_EXPECT[vehicleKey];
    if (rule.must && spec && spec !== rule.must) {
      findings.push({
        category: "direction_mismatch",
        file: "vehicle-search.ts",
        value: `${t.query} → ${spec}`,
        suggestion: `기대 ${rule.must}`,
        priority: "P0",
        meta: { vehicle: vehicleKey, model: top.model },
      });
    }
    if (rule.forbid && spec && rule.forbid.includes(spec)) {
      findings.push({
        category: "direction_mismatch",
        file: "vehicle-search.ts",
        value: `${t.query} → ${spec}`,
        suggestion: `금지 ${spec}`,
        priority: "P0",
      });
    }
  }
}

function auditSearchContamination() {
  for (const kw of SEARCH_FORBIDDEN) {
    const inExamples = HOME_MAIN_SEARCH_EXAMPLES.some((e) => e.label.includes(kw));
    const suggestions = searchCustomerSuggestions(kw, 5);
    if (inExamples || suggestions.length > 0) {
      findings.push({
        category: "search_contamination",
        file: "home-main-catalog-data / autocomplete",
        value: kw,
        suggestion: "검색 예시·자동완성에서 제거",
        priority: "P0",
      });
    }
  }
  for (const code of CUSTOMER_BATTERY_SPEC_CODES) {
    const ok = searchCustomerSuggestions(code, 3).some((s) => s.kind === "battery");
    if (!ok) {
      findings.push({
        category: "autocomplete_missing_spec",
        file: "customer-search-autocomplete.ts",
        value: code,
        priority: "P2",
      });
    }
  }
}

function scanSourceFiles() {
  const targets = [
    "src/lib/vehicle-search.ts",
    "src/lib/vehicle-asset-chevrolet.ts",
    "src/lib/vehicle-asset-v04.ts",
    "src/lib/search/customer-search-display.ts",
    "src/data/vehicle-generation-chevrolet.config.ts",
  ];
  for (const rel of targets) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf8");
    for (const phrase of FORBIDDEN_PHRASES) {
      if (content.includes(phrase)) {
        findings.push({
          category: "source_contains_forbidden",
          file: rel,
          value: phrase,
          suggestion: "고객 노출 경로에서 제거 또는 sanitize",
          priority: rel.includes("vehicle-search") || rel.includes("chevrolet") ? "P0" : "P1",
        });
      }
    }
  }
}

function scanChevroletConfigNotes() {
  for (const g of VEHICLE_GENERATIONS_CHEVROLET) {
    if (g.battery.status === "needsReview" && g.battery.note) {
      scanText("vehicle-generation-chevrolet.config.ts", g.id, "battery.note", g.battery.note);
    }
  }
}

function buildMarkdown(summary: Record<string, unknown>): string {
  const byCat = (cat: string) => findings.filter((f) => f.category === cat);
  const p0 = findings.filter((f) => f.priority === "P0");

  let md = `# Vehicle DB Integrity Audit\n\n`;
  md += `생성: ${new Date().toISOString()}\n\n`;
  md += `## 1. 요약\n\n`;
  md += `| 항목 | 값 |\n|------|-----|\n`;
  for (const [k, v] of Object.entries(summary)) {
    md += `| ${k} | ${v} |\n`;
  }
  md += `\n## 2. 즉시 수정 필요 (P0: ${p0.length})\n\n`;
  md += `| 파일 | 문제 | 현재값 | 수정 제안 |\n|------|------|--------|----------|\n`;
  for (const f of p0.slice(0, 40)) {
    md += `| ${f.file} | ${f.category} | ${(f.value ?? "").replace(/\|/g, "/").slice(0, 60)} | ${f.suggestion ?? ""} |\n`;
  }
  if (p0.length > 40) md += `\n*(P0 ${p0.length - 40}건 추가 — JSON 참고)*\n`;

  md += `\n## 3. 고객 노출 금지 문구\n\n`;
  for (const f of byCat("forbidden_customer_copy").slice(0, 30)) {
    md += `- **${f.file}** \`${f.field}\`: "${(f.value ?? "").slice(0, 80)}" → ${f.suggestion}\n`;
  }

  md += `\n## 4. 이상한 표시명/별칭\n\n`;
  for (const f of [...byCat("risky_display_alias"), ...byCat("risky_display_name")].slice(0, 30)) {
    md += `- ${f.meta?.canonical ?? f.value}: \`${f.value}\` (${f.file})\n`;
  }

  md += `\n## 5. 매칭 안 된 차량\n\n`;
  md += `총 ${byCat("unmatched_asset").length}건 — JSON \`unmatched_asset\` 참고\n\n`;

  md += `\n## 6. 검색 검수 결과\n\n`;
  const searchResults = summary.searchResults as { query: string; pass: boolean; issues: string[] }[];
  md += `| 검색어 | 통과 | 이슈 |\n|--------|------|------|\n`;
  for (const r of searchResults ?? []) {
    md += `| ${r.query} | ${r.pass ? "✅" : "❌"} | ${r.issues?.join(", ") ?? ""} |\n`;
  }

  md += `\n## 7. 방향 오매칭 위험\n\n`;
  for (const f of byCat("direction_mismatch")) {
    md += `- ${f.value}: ${f.suggestion}\n`;
  }

  md += `\n## 8. 완료 후 재검수 체크리스트\n\n`;
  md += `- [ ] \`npx tsx tools/audit-vehicle-db-integrity.ts\` P0 = 0\n`;
  md += `- [ ] GV80/GV70/스타리아/K3/쏘나타 production 검색\n`;
  md += `- [ ] 고객 화면 needsReview/vehicle-battery-db 미노출\n`;
  md += `- [ ] primaryBattery.json 미수정 확인\n\n`;

  return md;
}

function main() {
  const dbRecords = vehicleBatteryDb as unknown[];
  const enrichRecords = (enrichmentJson as { records?: unknown[] }).records ?? [];

  scanAliasEntries(vehicleAliasDbV01, "vehicle-alias-db.ts");
  scanAliasEntries(vehicleAliasDbV02Supplement as typeof vehicleAliasDbV01, "vehicle-alias-v02-supplement.ts");
  scanAliasEntries(vehicleAliasDbV03NewEntries as typeof vehicleAliasDbV01, "vehicle-alias-v03-supplement.ts");
  scanAliasEntries(vehicleAliasDbV04NewEntries, "vehicle-alias-v04-supplement.ts");

  auditUnmatchedAssets();
  scanSourceFiles();
  scanChevroletConfigNotes();

  for (const g of VEHICLE_GENERATIONS_V04) {
    if (g.battery.status === "linked" && g.battery.note) {
      scanText("vehicle-generation-v04.config.ts", g.id, "battery.note", g.battery.note);
    }
  }

  const searchResults = auditSearchQueries();
  auditDirectionMismatches();
  auditSearchContamination();

  const summary = {
    vehicleBatteryDbRecords: dbRecords.length,
    enrichmentRecords: enrichRecords.length,
    totalAssets: collectAssets().length,
    genesisAssets: vehicleAssetsGenesis.length,
    v04Assets: vehicleAssetsV04.length,
    chevroletAssets: vehicleAssetsChevrolet.length,
    aliasEntries:
      vehicleAliasDbV01.length +
      vehicleAliasDbV02Supplement.length +
      vehicleAliasDbV03NewEntries.length +
      vehicleAliasDbV04NewEntries.length,
    forbiddenCopyFindings: findings.filter((f) => f.category.includes("forbidden") || f.category === "sanitize_null").length,
    unmatchedAssets: findings.filter((f) => f.category === "unmatched_asset").length,
    riskyDisplayAliases: findings.filter((f) => f.category === "risky_display_alias").length,
    searchFailures: findings.filter((f) => f.category === "search_audit_fail").length,
    directionMismatches: findings.filter((f) => f.category === "direction_mismatch").length,
    searchContamination: findings.filter((f) => f.category === "search_contamination").length,
    totalFindings: findings.length,
    searchResults,
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), summary, findings }, null, 2));
  fs.writeFileSync(REPORT_MD, buildMarkdown(summary));

  console.log("Audit complete:", REPORT_MD);
  console.log("Total findings:", findings.length, "| P0:", findings.filter((f) => f.priority === "P0").length);
}

main();
