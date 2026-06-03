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
import { vehicleAliasDbV01 } from "../src/data/vehicle-alias-db";
import { vehicleAliasDbV02Supplement } from "../src/data/vehicle-alias-v02-supplement";
import { vehicleAliasDbV03NewEntries } from "../src/data/vehicle-alias-v03-supplement";
import { vehicleAliasDbV04NewEntries } from "../src/data/vehicle-alias-v04-supplement";
import { VEHICLE_GENERATIONS_V04 } from "../src/data/vehicle-generation-v04.config";
import { VEHICLE_GENERATIONS_CHEVROLET } from "../src/data/vehicle-generation-chevrolet.config";
import { vehicleAssets, type VehicleAsset } from "../src/lib/car-assets";
import { vehicleAssetsGenesis } from "../src/lib/vehicle-asset-genesis";
import { vehicleAssetsV04 } from "../src/lib/vehicle-asset-v04";
import { vehicleAssetsChevrolet } from "../src/lib/vehicle-asset-chevrolet";
import {
  getVehicleCardBatteryInfo,
  getRecordsForSlug,
  getVehicleBatteryPageData,
  hasUsableBatteryData,
  getVehicleDbProfile,
} from "../src/lib/vehicleBattery";
import { vehicleAssetsToSearchRows } from "../src/lib/vehicle-search";
import { resolveSearchVehicleAlias } from "../src/lib/search/search-vehicle-aliases";
import {
  isBatterySpecPrimaryQuery,
  resolveBatterySpecSearch,
} from "../src/lib/search/battery-spec-search-alias";
import { batterySpecHref } from "../src/lib/canonical-battery-code";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "../src/lib/vehicle-fuel-primary-battery";
import { HOME_MAIN_SEARCH_EXAMPLES } from "../src/lib/home-main-catalog-data";
import {
  CUSTOMER_NON_SEARCH_KEYWORDS,
  CUSTOMER_BATTERY_SPEC_CODES,
  sanitizeCustomerBatterySummary,
  sanitizeSearchRowCustomerCopy,
  toCustomerVehicleSearchRow,
} from "../src/lib/search/customer-search-display";
import { searchCustomerSuggestions } from "../src/lib/search/customer-search-autocomplete";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPORT_JSON = path.join(ROOT, "reports", "vehicle-db-integrity-audit.json");
const REPORT_MD = path.join(ROOT, "reports", "vehicle-db-integrity-audit.md");

type VehicleBatteryDbFile = {
  meta?: { recordCount?: number };
  records: unknown[];
};

const DB_FILE = vehicleBatteryDb as VehicleBatteryDbFile;
const VEHICLE_BATTERY_DB_RECORD_COUNT =
  DB_FILE.meta?.recordCount ?? DB_FILE.records?.length ?? 0;

/** 고객 displayAliases/displayName에만 적용 — 통용 세대명·브랜드명 제외 */
const RISKY_DISPLAY_ALIAS_RE =
  /삼각떼|^코스$|케이쓰리|케이3|케삼|렉스턴\s*스포츠\s*아님|스타랙스|캡쳐|큐엠|에스엠|^펠리$|^팰리$|^소나타$|^산타페$|^그랜져$/i;

/** 대표명으로 부적절한 canonical (뉴스타일 대표명 등) */
const RISKY_CANONICAL_NAME_RE = /뉴\s*스타일\s*코란도/i;

const FORBIDDEN_CUSTOMER_PHRASES = [
  "vehicle-battery-db",
  "needsReview",
  "needs_review",
  "미등록",
  "차량표 미등록",
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
  batterySpecOnly?: boolean;
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
  {
    query: "쏘렌토 MQ4 하이브리드",
    expectVehicle: true,
    expectSpec: "AGM60L",
    topModelIncludes: "쏘렌토",
  },
  { query: "소렌토 MQ4 하브", expectVehicle: true, expectSpec: "AGM60L", topModelIncludes: "쏘렌토" },
  { query: "21년식 싼타페", expectVehicle: true, topModelIncludes: "싼타페" },
  { query: "100R", expectSpec: "100R", batterySpecOnly: true },
  { query: "90R", expectSpec: "90R", batterySpecOnly: true },
  { query: "AGM80R", expectSpec: "AGM80R", batterySpecOnly: true },
  { query: "AGM95R", expectSpec: "AGM95R", batterySpecOnly: true },
  { query: "DIN74L", expectSpec: "DIN74L", batterySpecOnly: true },
  { query: "QM6", expectVehicle: true, topModelIncludes: "QM6" },
  { query: "SM6", expectVehicle: true, topModelIncludes: "SM6" },
  { query: "XM3", expectVehicle: true, topModelIncludes: "XM3" },
  { query: "QM3", expectVehicle: true, topModelIncludes: "QM3" },
  { query: "QM5", expectVehicle: true, topModelIncludes: "QM5" },
  { query: "SM5", expectVehicle: true, topModelIncludes: "SM5" },
  { query: "SM3", expectVehicle: true, topModelIncludes: "SM3" },
  { query: "SM7", expectVehicle: true, topModelIncludes: "SM7" },
  { query: "마스터", expectVehicle: true, topModelIncludes: "마스터" },
  { query: "스파크", expectVehicle: true, topModelIncludes: "스파크" },
  { query: "말리부", expectVehicle: true, topModelIncludes: "말리부" },
  { query: "크루즈", expectVehicle: true, topModelIncludes: "크루즈" },
  { query: "트랙스", expectVehicle: true, topModelIncludes: "트랙스" },
  { query: "트레일블레이저", expectVehicle: true, topModelIncludes: "트레일" },
  { query: "캡티바", expectVehicle: true, topModelIncludes: "캡티바" },
  { query: "올란도", expectVehicle: true, topModelIncludes: "올란도" },
  { query: "라세티", expectVehicle: true, topModelIncludes: "라세티" },
  { query: "다마스", expectVehicle: true, topModelIncludes: "다마스" },
  { query: "라보", expectVehicle: true, topModelIncludes: "라보" },
  { query: "젠트라", expectVehicle: true, topModelIncludes: "젠트라" },
  { query: "젠트라 X", expectVehicle: true, topModelIncludes: "젠트라" },
  { query: "토스카", expectVehicle: true, topModelIncludes: "토스카" },
  { query: "알페온", expectVehicle: true, topModelIncludes: "알페온" },
  { query: "임팔라", expectVehicle: true, topModelIncludes: "임팔라" },
  { query: "이쿼녹스", expectVehicle: true, topModelIncludes: "이쿼녹스" },
  { query: "콜로라도", expectVehicle: true, topModelIncludes: "콜로라도" },
  { query: "트래버스", expectVehicle: true, topModelIncludes: "트래버스" },
  { query: "티볼리 아머", expectVehicle: true, topModelIncludes: "티볼리" },
  { query: "코란도 C", expectVehicle: true, topModelIncludes: "코란도" },
  { query: "렉스턴 스포츠", expectVehicle: true, topModelIncludes: "렉스턴" },
  { query: "렉스턴 스포츠 칸", expectVehicle: true, topModelIncludes: "렉스턴" },
  { query: "G4 렉스턴", expectVehicle: true, topModelIncludes: "렉스턴" },
  { query: "올 뉴 렉스턴", expectVehicle: true, topModelIncludes: "렉스턴" },
  { query: "코란도 스포츠", expectVehicle: true, topModelIncludes: "코란도" },
  { query: "코란도 투리스모", expectVehicle: true, topModelIncludes: "코란도" },
  { query: "뉴 체어맨", expectVehicle: true, topModelIncludes: "체어맨" },
  { query: "액티언", expectVehicle: true, topModelIncludes: "액티언" },
  { query: "액티언 스포츠", expectVehicle: true, topModelIncludes: "액티언" },
  { query: "카이런", expectVehicle: true, topModelIncludes: "카이런" },
  { query: "무쏘 스포츠", expectVehicle: true, topModelIncludes: "무쏘" },
  { query: "토레스", expectVehicle: true, topModelIncludes: "토레스" },
  { query: "봉고3", expectVehicle: true, topModelIncludes: "봉고" },
  { query: "쏘나타 NF", expectVehicle: true, topModelIncludes: "쏘나타" },
  { query: "투싼 JM", expectVehicle: true, topModelIncludes: "투싼" },
  { query: "케이쓰리", expectVehicle: true, topModelIncludes: "K3" },
  { query: "EQ900", expectVehicle: true, topModelIncludes: "EQ900" },
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
  "쏘렌토 MQ4 하이브리드": { must: "AGM60L", forbid: ["AGM80L"] },
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

type UnmatchedClassification = {
  assetId: string;
  displayName: string;
  class: "A" | "B" | "C";
  reason: string;
};

type SearchAuditRow = {
  query: string;
  pass: boolean;
  issues: string[];
  top: string | null;
  topSpec: string | null;
  rowCount: number;
  batteryHref?: string | null;
};

const findings: Finding[] = [];
let unmatchedClassifications: UnmatchedClassification[] = [];

function suggestReplacement(text: string): string {
  const spec = text.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i)?.[0];
  if (spec && !FORBIDDEN_CUSTOMER_PHRASES.some((p) => text.includes(p))) {
    return `대표 규격 ${spec.toUpperCase()}`;
  }
  if (/사진|문의|확인/i.test(text)) return "사진 확인 권장";
  if (/연식|연료|옵션|ISG/i.test(text)) return "연식·옵션별 확인 필요";
  return "상담 확인 필요";
}

function containsForbiddenCustomerText(text: string): string | null {
  for (const phrase of FORBIDDEN_CUSTOMER_PHRASES) {
    if (text.includes(phrase)) return phrase;
  }
  if (/\bDB\b/.test(text) && /vehicle-battery|미등록|needsReview/i.test(text)) return "DB";
  return null;
}

function scanCustomerText(source: string, field: string, text: string) {
  if (!text?.trim()) return;
  const hit = containsForbiddenCustomerText(text);
  if (hit) {
    findings.push({
      category: "forbidden_customer_copy",
      file: source,
      field,
      value: text.slice(0, 200),
      suggestion: suggestReplacement(text),
      priority: "P0",
    });
  }
  const sanitized = sanitizeCustomerBatterySummary(text);
  if (sanitized === null && text.length > 3 && !/대표 규격/i.test(text)) {
    findings.push({
      category: "sanitize_null",
      file: source,
      field,
      value: text.slice(0, 200),
      suggestion: suggestReplacement(text),
      priority: "P1",
    });
  }
}

function scanAliasEntries(
  entries: { canonicalName: string; displayAliases: string[]; aliases: string[] }[],
  source: string,
) {
  for (const e of entries) {
    if (RISKY_CANONICAL_NAME_RE.test(e.canonicalName)) {
      findings.push({
        category: "risky_display_name",
        file: source,
        field: "canonicalName",
        value: e.canonicalName,
        suggestion: "고객 통용 정식명(예: 코란도 C)으로 변경",
        priority: "P0",
        meta: { vehicle: e.canonicalName },
      });
    }
    for (const da of e.displayAliases ?? []) {
      if (RISKY_DISPLAY_ALIAS_RE.test(da)) {
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

function classifyUnmatchedAssets() {
  unmatchedClassifications = [];
  for (const a of collectAssets()) {
    const slug = a.catalogId ?? a.id;
    const db = getVehicleCardBatteryInfo(slug);
    const page = getVehicleBatteryPageData(slug);
    const profile = getVehicleDbProfile(slug);
    const hasDefault = Boolean(a.defaultBatteryCode);
    const hasLinkedDb =
      hasDefault ||
      (db.hasConfirmedDb && Boolean(db.displayCode)) ||
      (db.hasUsableDb && page.hasData);
    if (hasLinkedDb) continue;

    const recs = getRecordsForSlug(slug);
    const dbHasUsable = recs.some((r) => hasUsableBatteryData(r, profile));
    const dbHasConfirmed = recs.some(
      (r) => r.status === "confirmed" && Boolean(r.primaryBattery?.trim()),
    );

    let cls: "A" | "B" | "C";
    let reason: string;
    if (a.recommendExcluded || (a.yearStart != null && a.yearStart < 2005)) {
      cls = "C";
      reason = "레거시·노출 제외 후보";
    } else if (dbHasUsable || dbHasConfirmed) {
      cls = "A";
      reason = dbHasConfirmed
        ? "DB confirmed 있음 — slug/dbModels 연결 필요"
        : "DB usable 후보 있음 — slug/연식/세대 연결 필요";
    } else {
      cls = "B";
      reason = "DB 매칭 없음 — 상담 확인만";
    }

    unmatchedClassifications.push({
      assetId: a.id,
      displayName: a.displayName,
      class: cls,
      reason,
    });

    findings.push({
      category: "unmatched_asset",
      file: "vehicleAssets",
      field: "asset",
      value: a.displayName,
      suggestion: cls === "A" ? "DB 연결 보강" : cls === "B" ? "상담 확인 필요만 노출" : "검색 후순위/제외",
      priority: cls === "A" ? "P0" : "P1",
      meta: {
        assetId: a.id,
        catalogId: slug,
        brand: a.brand,
        yearRange: a.yearRange,
        dbModels: a.dbModels,
        batteryMatchStatus: a.batteryMatchStatus,
        classification: cls,
      },
    });
  }
}

function extractSpecFromRow(row: {
  recommend?: string;
  origin?: string;
  batteryNotes?: string;
}): string | null {
  const hay = `${row.recommend ?? ""} ${row.origin ?? ""} ${row.batteryNotes ?? ""}`;
  const m = hay.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i);
  return m?.[1]?.toUpperCase() ?? null;
}

function auditSearchQueries(): SearchAuditRow[] {
  const results: SearchAuditRow[] = [];
  for (const t of REQUIRED_SEARCHES) {
    if (t.batterySpecOnly) {
      const specHit = resolveBatterySpecSearch(t.query);
      const pass = specHit?.primaryCode === t.expectSpec;
      const issues: string[] = [];
      if (!pass) issues.push(`규격 기대 ${t.expectSpec} 실제 ${specHit?.primaryCode ?? "없음"}`);
      const href = t.expectSpec ? batterySpecHref(t.expectSpec) : null;
      results.push({
        query: t.query,
        pass,
        issues,
        top: specHit?.primaryCode ?? null,
        topSpec: specHit?.primaryCode ?? null,
        rowCount: specHit ? 1 : 0,
        batteryHref: href,
      });
      if (!pass) {
        findings.push({
          category: "search_audit_fail",
          file: "battery-spec-search-alias.ts",
          value: t.query,
          suggestion: issues.join(", "),
          priority: "P0",
        });
      }
      continue;
    }

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

    const customerRows = rows.map(toCustomerVehicleSearchRow);
    const top = customerRows[0];
    const topSpec = top ? extractSpecFromRow(top) : null;
    const rowText = customerRows
      .map((r) => `${r.model}|${r.recommend}|${r.batteryNotes ?? ""}`)
      .join("; ");
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

    for (const phrase of FORBIDDEN_CUSTOMER_PHRASES) {
      if (rowText.includes(phrase)) {
        pass = false;
        issues.push(`금지문구: ${phrase}`);
      }
    }
    const forbiddenDb = containsForbiddenCustomerText(rowText);
    if (forbiddenDb) {
      pass = false;
      issues.push(`금지문구: ${forbiddenDb}`);
    }

    results.push({
      query: t.query,
      pass,
      issues,
      top: top?.model ?? null,
      topSpec,
      rowCount: rows.length,
    });
    if (!pass) {
      findings.push({
        category: "search_audit_fail",
        file: "vehicle-search.ts",
        field: "vehicleAssetsToSearchRows",
        value: t.query,
        suggestion: issues.join(", "),
        priority: "P0",
        meta: {
          issues,
          rows: customerRows.slice(0, 3).map((r) => ({
            model: r.model,
            recommend: r.recommend,
            note: r.note,
          })),
        },
      });
    }
  }
  return results;
}

function auditDirectionMismatches() {
  for (const t of REQUIRED_SEARCHES) {
    if (!t.expectSpec || t.batterySpecOnly) continue;
    let rows: ReturnType<typeof vehicleAssetsToSearchRows> = [];
    try {
      rows = vehicleAssetsToSearchRows(t.query, 5);
    } catch {
      continue;
    }
    const top = rows[0];
    if (!top) continue;
    const spec = extractSpecFromRow(top);
    const vehicleKey =
      Object.keys(VEHICLE_SPEC_EXPECT).find((k) => t.query.includes(k)) ??
      Object.keys(VEHICLE_SPEC_EXPECT).find((k) => top.model.includes(k));
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

function scanChevroletCustomerNotes() {
  for (const g of VEHICLE_GENERATIONS_CHEVROLET) {
    const note =
      g.battery.status === "needsReview"
        ? g.battery.customerNote
        : g.battery.status === "linked"
          ? g.battery.customerNote
          : undefined;
    if (note) scanCustomerText("vehicle-generation-chevrolet.config.ts", `${g.id}.customerNote`, note);
  }
}

function scanV04CustomerNotes() {
  for (const g of VEHICLE_GENERATIONS_V04) {
    if (g.battery.status === "linked" && g.battery.note) {
      scanCustomerText("vehicle-generation-v04.config.ts", `${g.id}.battery.note`, g.battery.note);
    }
  }
}

function buildMarkdown(
  summary: Record<string, string | number>,
  searchResults: SearchAuditRow[],
): string {
  const byCat = (cat: string) => findings.filter((f) => f.category === cat);
  const p0 = findings.filter((f) => f.priority === "P0");
  const unmatchedA = unmatchedClassifications.filter((u) => u.class === "A");
  const unmatchedB = unmatchedClassifications.filter((u) => u.class === "B");
  const unmatchedC = unmatchedClassifications.filter((u) => u.class === "C");

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

  md += `\n## 5. 매칭 안 된 차량 (A/B/C)\n\n`;
  md += `| 분류 | 건수 | 조치 |\n|------|------|------|\n`;
  md += `| A DB연결가능 | ${unmatchedA.length} | slug/dbModels 보강 |\n`;
  md += `| B 미확정 | ${unmatchedB.length} | 상담 확인만 |\n`;
  md += `| C 노출제외 | ${unmatchedC.length} | recommendExcluded |\n\n`;
  md += `| assetId | displayName | 분류 | 사유 |\n|---------|-------------|------|------|\n`;
  for (const u of unmatchedClassifications.slice(0, 40)) {
    md += `| ${u.assetId} | ${u.displayName} | ${u.class} | ${u.reason} |\n`;
  }
  if (unmatchedClassifications.length > 40) {
    md += `\n*(${unmatchedClassifications.length - 40}건 추가 — JSON \`unmatchedClassifications\`)*\n`;
  }

  md += `\n## 6. 검색 검수 결과\n\n`;
  md += `| 검색어 | 통과 | top | topSpec | 이슈 |\n|--------|------|-----|---------|------|\n`;
  for (const r of searchResults) {
    md += `| ${r.query} | ${r.pass ? "✅" : "❌"} | ${r.top ?? "—"} | ${r.topSpec ?? "—"} | ${r.issues?.join(", ") ?? ""} |\n`;
  }

  md += `\n## 7. 방향 오매칭 위험\n\n`;
  for (const f of byCat("direction_mismatch")) {
    md += `- ${f.value}: ${f.suggestion}\n`;
  }

  md += `\n## 8. 완료 후 재검수 체크리스트\n\n`;
  md += `- [ ] \`npm run audit:vehicle-db\` P0 실질 0\n`;
  md += `- [ ] vehicleBatteryDbRecords = ${VEHICLE_BATTERY_DB_RECORD_COUNT}\n`;
  md += `- [ ] 100R·쏘렌토 MQ4 HEV production 검색\n`;
  md += `- [ ] 고객 HTML에 needsReview/vehicle-battery-db 미포함\n`;
  md += `- [ ] primaryBattery.json 미수정 확인\n\n`;

  return md;
}

function main() {
  const enrichRecords = (enrichmentJson as { records?: unknown[] }).records ?? [];

  scanAliasEntries(vehicleAliasDbV01, "vehicle-alias-db.ts");
  scanAliasEntries(vehicleAliasDbV02Supplement as typeof vehicleAliasDbV01, "vehicle-alias-v02-supplement.ts");
  scanAliasEntries(vehicleAliasDbV03NewEntries as typeof vehicleAliasDbV01, "vehicle-alias-v03-supplement.ts");
  scanAliasEntries(vehicleAliasDbV04NewEntries, "vehicle-alias-v04-supplement.ts");

  classifyUnmatchedAssets();
  scanChevroletCustomerNotes();
  scanV04CustomerNotes();

  const searchResults = auditSearchQueries();
  auditDirectionMismatches();
  auditSearchContamination();

  const unmatchedA = unmatchedClassifications.filter((u) => u.class === "A").length;
  const unmatchedB = unmatchedClassifications.filter((u) => u.class === "B").length;
  const unmatchedC = unmatchedClassifications.filter((u) => u.class === "C").length;

  const summary: Record<string, string | number> = {
    vehicleBatteryDbRecords: VEHICLE_BATTERY_DB_RECORD_COUNT,
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
    forbiddenCopyFindings: findings.filter((f) => f.category === "forbidden_customer_copy").length,
    unmatchedAssets: unmatchedClassifications.length,
    unmatchedA,
    unmatchedB,
    unmatchedC,
    riskyDisplayAliases: findings.filter((f) => f.category === "risky_display_alias").length,
    searchFailures: findings.filter((f) => f.category === "search_audit_fail").length,
    directionMismatches: findings.filter((f) => f.category === "direction_mismatch").length,
    searchContamination: findings.filter((f) => f.category === "search_contamination").length,
    totalFindings: findings.length,
    p0Count: findings.filter((f) => f.priority === "P0").length,
    searchPassCount: searchResults.filter((r) => r.pass).length,
    searchTotal: searchResults.length,
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(
    REPORT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary,
        searchResults,
        unmatchedClassifications,
        findings,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(REPORT_MD, buildMarkdown(summary, searchResults));

  console.log("Audit complete:", REPORT_MD);
  console.log(
    "vehicleBatteryDbRecords:",
    VEHICLE_BATTERY_DB_RECORD_COUNT,
    "| findings:",
    findings.length,
    "| P0:",
    findings.filter((f) => f.priority === "P0").length,
  );
}

main();
