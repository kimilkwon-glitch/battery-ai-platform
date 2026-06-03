import crypto from "node:crypto";
import type { VehicleBatteryRecord } from "../../src/lib/vehicleBattery";

export const SOURCE_PATHS = {
  gongim: "src/data/source-tables/공임차종표_프로그램용.xlsx",
  recent: "src/data/source-tables/최근 배터리 차종표.xlsx",
  kasuri: "src/data/source-tables/카수리 차종표.xls",
} as const;

export const EXTRA_NORMALIZATION: Record<string, string> = {
  GB40AL: "40AL",
  GB50L: "50L",
  GB60L: "60L",
  GB60R: "60R",
  GB80L: "80L",
  GB80R: "80R",
  GB90L: "90L",
  GB90R: "90R",
  GB100L: "100L",
  GB100R: "100R",
  AGM60: "AGM60L",
  AGM70: "AGM70L",
  AGM80: "AGM80L",
  AGM95: "AGM95L",
  AGM105: "AGM105L",
};

/** 사용자 직접 확정 — primaryBattery 덮어쓰기 금지 패턴 */
export const USER_PRIMARY_BATTERY_GUARDS: {
  brand: RegExp;
  model?: RegExp;
  display?: RegExp;
  years?: RegExp;
  fuel?: RegExp;
  primaryBattery: string;
}[] = [
  { brand: /현대/, model: /EQ900/i, primaryBattery: "AGM105L" },
  { brand: /제네시스|현대/, model: /G80/i, display: /17|18|19|구형/i, primaryBattery: "AGM105L" },
  { brand: /제네시스/, model: /G90/i, display: /2019|2020|2021|1세대/i, primaryBattery: "AGM105L" },
  { brand: /제네시스/, model: /G90/i, display: /2022|RS4|2세대/i, primaryBattery: "AGM105R" },
  { brand: /제네시스/, model: /GV60/i, primaryBattery: "AGM60L" },
  { brand: /제네시스/, model: /GV70/i, primaryBattery: "AGM80R" },
  { brand: /제네시스/, model: /GV80/i, primaryBattery: "AGM95R" },
  { brand: /현대/, model: /스타리아/i, primaryBattery: "AGM80R" },
  { brand: /현대/, model: /포터/i, display: /2019|2020|2021|2022|2023|2024|2025|이후|현재/i, primaryBattery: "100R" },
  { brand: /현대/, model: /포터/i, display: /2018|이전|~18|17|16|15|14|13|12|11|10/i, primaryBattery: "90R" },
  { brand: /기아/, model: /쏘렌토/i, display: /MQ4/i, fuel: /하이브리드|HEV|hev/i, primaryBattery: "AGM60L" },
];

export function norm(s: string | null | undefined): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function normalizeBrand(raw: string): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/르노|renault|삼성자동/i.test(s)) return "르노";
  if (/쉐보레|chevrolet|gm대우|gm\/|gm\b|대우/i.test(s)) return "쉐보레";
  if (/쌍용|kgm|kg모빌|ssang/i.test(s)) return "쌍용";
  if (/현대|hyundai/i.test(s)) return "현대";
  if (/기아|kia/i.test(s)) return "기아";
  if (/제네시스|genesis/i.test(s)) return "제네시스";
  return s;
}

export function parseYearRange(text: string): {
  years: string | null;
  startYear: number | null;
  endYear: number | null;
} {
  const t = String(text ?? "").trim();
  if (!t) return { years: null, startYear: null, endYear: null };
  const now = new Date().getFullYear();
  const cur = /현재|~$/i.test(t);
  const m = t.match(/(\d{2,4})\s*[~\-–]\s*(\d{2,4}|현재)/);
  if (m) {
    let start = parseInt(m[1], 10);
    let end = m[2] === "현재" || cur ? now : parseInt(m[2], 10);
    if (start < 100) start += start >= 70 ? 1900 : 2000;
    if (end < 100) end += end >= 70 ? 1900 : 2000;
    return { years: t, startYear: start, endYear: end };
  }
  const single = t.match(/(\d{2,4})\s*년/);
  if (single) {
    let y = parseInt(single[1], 10);
    if (y < 100) y += y >= 70 ? 1900 : 2000;
    return { years: t, startYear: y, endYear: y };
  }
  return { years: t || null, startYear: null, endYear: null };
}

export function parseFuel(text: string): string | null {
  const t = String(text ?? "").trim();
  if (!t) return null;
  if (/하이브리드|hev|phev/i.test(t)) return "하이브리드";
  if (/전기|ev\b/i.test(t)) return "전기";
  if (/lpg|엘피지/i.test(t)) return "LPG";
  if (/디젤|diesel|경유/i.test(t)) return "디젤";
  if (/가솔린|휘발|gasoline/i.test(t)) return "가솔린";
  if (/터보/i.test(t)) return "터보";
  return t.length <= 12 ? t : null;
}

export function buildNormalizationRules(base: Record<string, string>): Record<string, string> {
  return { ...base, ...EXTRA_NORMALIZATION };
}

export function normalizeProductCode(
  raw: string,
  rules: Record<string, string>,
): string {
  const cleaned = String(raw ?? "")
    .replace(/로켓|쏠라이트|rocket|solite/gi, " ")
    .replace(/[,·]/g, " ")
    .trim();
  if (!cleaned) return "";

  const tokens = cleaned.match(
    /\b(AGM\d+[LR]?|DIN\d+[LR]?|GB\d+[ALR]{1,2}|DF\d+[LR]?|\d{2,3}[LR]|56219|57820|57412|55066|54459|59042|60044|60038|57219)\b/gi,
  );
  if (tokens?.length) {
    const last = tokens[tokens.length - 1].toUpperCase().replace(/\s/g, "");
    const key = last.replace(/[^A-Z0-9]/g, "");
    if (rules[key]) return rules[key];
    if (rules[last]) return rules[last];
    if (/^\d{5}$/.test(key) && rules[key]) return rules[key];
    if (/^AGM\d+$/i.test(last)) return rules[last] ?? `${last}L`;
    if (/^DIN\d+$/i.test(last)) return rules[last] ?? last;
    if (/^GB(\d+)/i.test(last)) {
      const m = last.match(/^GB(\d+)([ALR]{1,2})?$/i);
      if (m) return rules[last] ?? `${m[1]}${m[2] ?? "L"}`;
    }
    if (/^DF(\d+)/i.test(last)) return rules[last] ?? last;
    if (/^\d{2,3}[LR]$/i.test(last)) return last.toUpperCase();
    return last;
  }

  const key = cleaned.toUpperCase().replace(/\s/g, "");
  if (rules[key]) return rules[key];
  const agm = cleaned.match(/AGM\s*(\d+)\s*([LR])?/i);
  if (agm) {
    const code = `AGM${agm[1]}${agm[2] ?? "L"}`.toUpperCase();
    return rules[code] ?? code;
  }
  const din = cleaned.match(/DIN\s*(\d+)\s*([LR])?/i);
  if (din) {
    const code = `DIN${din[1]}${din[2] ?? "L"}`.toUpperCase();
    return rules[code] ?? code;
  }
  return "";
}

export function recordDedupeKey(r: Pick<VehicleBatteryRecord, "brand" | "model" | "displayName" | "years" | "fuel" | "primaryBattery">): string {
  return [
    norm(normalizeBrand(r.brand)),
    norm(r.model),
    norm(r.displayName),
    norm(r.years ?? ""),
    norm(r.fuel ?? ""),
    norm(r.primaryBattery),
  ].join("|");
}

export function makeRecordId(key: string): string {
  return `raw_${crypto.createHash("sha1").update(key).digest("hex").slice(0, 10)}`;
}

export function isUserProtectedRecord(r: VehicleBatteryRecord): boolean {
  if (r.correctedBy === "user_final_confirmed") return true;
  if (r.status === "confirmed" && r.confidence === "high" && r.correctedBy) return true;
  return USER_PRIMARY_BATTERY_GUARDS.some((g) => {
    if (!g.brand.test(r.brand)) return false;
    if (g.model && !g.model.test(`${r.model} ${r.displayName}`)) return false;
    if (g.display && !g.display.test(r.displayName)) return false;
    if (g.years && r.years && !g.years.test(r.years)) return false;
    if (g.fuel && r.fuel && !g.fuel.test(r.fuel)) return false;
    return r.primaryBattery === g.primaryBattery;
  });
}

export function mergeIncomingRecord(
  existing: VehicleBatteryRecord | undefined,
  incoming: VehicleBatteryRecord,
): { record: VehicleBatteryRecord; action: "added" | "skipped_protected" | "merged" | "duplicate" } {
  if (!existing) return { record: incoming, action: "added" };
  if (isUserProtectedRecord(existing)) return { record: existing, action: "skipped_protected" };
  const merged: VehicleBatteryRecord = {
    ...existing,
    batteryOptions: [...new Set([...(existing.batteryOptions ?? []), ...(incoming.batteryOptions ?? [])])],
    aliases: [...new Set([...(existing.aliases ?? []), ...(incoming.aliases ?? [])])],
  };
  if (!existing.caution?.trim() && incoming.caution) merged.caution = incoming.caution;
  if (!existing.rawProduct && incoming.rawProduct) merged.rawProduct = incoming.rawProduct;
  if (!existing.originalProduct && incoming.originalProduct) merged.originalProduct = incoming.originalProduct;
  if (existing.status !== "confirmed" && incoming.status === "confirmed") {
    merged.primaryBattery = incoming.primaryBattery;
    merged.status = incoming.status;
    merged.confidence = incoming.confidence;
  }
  return { record: merged, action: "merged" };
}

export type ParsedRow = {
  brand: string;
  model: string;
  displayName: string;
  detail: string;
  years: string | null;
  startYear: number | null;
  endYear: number | null;
  fuel: string | null;
  rawProduct: string;
  originalProduct: string;
  source: string;
};

export function rowToRecord(row: ParsedRow, rules: Record<string, string>): VehicleBatteryRecord | null {
  const brand = normalizeBrand(row.brand);
  if (!brand || !row.model?.trim()) return null;
  const primaryBattery = normalizeProductCode(row.originalProduct || row.rawProduct, rules);
  if (!primaryBattery) return null;

  const yearInfo = parseYearRange(row.years ?? row.displayName);
  const fuel = parseFuel(row.fuel ?? row.displayName) ?? row.fuel;
  const displayName = row.displayName?.trim() || row.detail?.trim() || row.model;
  const detail = row.detail?.trim() || displayName;

  const rec: VehicleBatteryRecord = {
    id: makeRecordId(recordDedupeKey({
      brand,
      model: row.model.trim(),
      displayName,
      years: yearInfo.years,
      fuel,
      primaryBattery,
    })),
    brand,
    model: row.model.trim(),
    displayName,
    detail,
    years: yearInfo.years,
    startYear: yearInfo.startYear,
    endYear: yearInfo.endYear,
    fuel,
    batteryOptions: [primaryBattery],
    primaryBattery,
    status: "raw",
    confidence: "medium",
    source: row.source,
    originalProduct: row.originalProduct || primaryBattery,
    rawProduct: row.rawProduct || row.originalProduct || primaryBattery,
    caution: "",
    aliases: [row.model.trim(), displayName].filter(Boolean),
  };

  if (brand === "르노" && /르노삼성|삼성/i.test(row.brand)) {
    rec.aliases.push("르노삼성");
  }
  if (brand === "쉐보레" && /gm|대우/i.test(row.brand)) {
    rec.aliases.push("GM대우", "대우");
  }
  if (brand === "쌍용" && /kgm|kg/i.test(row.brand)) {
    rec.aliases.push("KGM", "KG모빌리티");
  }

  rec.aliases = [...new Set(rec.aliases.map((a) => a.trim()).filter(Boolean))];
  return rec;
}
