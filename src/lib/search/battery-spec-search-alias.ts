/**
 * 배터리 규격명 검색 alias v0.3 — 차량 단일 확정 금지, 규격 코드 해석용
 */
import { getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import { normalizeVehicleAlias } from "@/data/vehicle-alias-db";

/** 추천/비교 묶음 금지 */
export const BATTERY_SPEC_FORBIDDEN_COMPARE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["AGM95L", "100R"],
  ["AGM95L", "90R"],
];

const CANONICAL_SPECS = [
  "AGM105L",
  "AGM95L",
  "AGM95R",
  "AGM80R",
  "AGM80L",
  "AGM70L",
  "AGM60L",
  "DIN100L",
  "DIN90L",
  "DIN80L",
  "DIN74L",
  "DIN62L",
  "DIN50L",
  "DIN44L",
  "CMF80L",
  "CMF60L",
  "100R",
  "100L",
  "90R",
  "90L",
  "80R",
  "80L",
  "60R",
  "60L",
  "50L",
  "40AL",
] as const;

/** alias(normalized) → canonical code */
const BATTERY_SPEC_ALIAS_INDEX: Record<string, string> = (() => {
  const index: Record<string, string> = {};
  const add = (alias: string, code: string) => {
    const n = normalizeBatterySpecAlias(alias);
    if (n && !index[n]) index[n] = code;
  };

  for (const code of CANONICAL_SPECS) {
    add(code, code);
    add(code.toLowerCase(), code);
  }

  const pairs: Array<[string, string]> = [
    ["agm60", "AGM60L"],
    ["agm60l", "AGM60L"],
    ["agm 60 l", "AGM60L"],
    ["agm70", "AGM70L"],
    ["agm70l", "AGM70L"],
    ["agm 70 l", "AGM70L"],
    ["70암페어agm", "AGM70L"],
    ["agm80l", "AGM80L"],
    ["agm80", "AGM80L"],
    ["agm 80 l", "AGM80L"],
    ["agm80r", "AGM80R"],
    ["agm 80 r", "AGM80R"],
    ["agm95l", "AGM95L"],
    ["agm95", "AGM95L"],
    ["agm105l", "AGM105L"],
    ["agm105", "AGM105L"],
    ["din44l", "DIN44L"],
    ["din44", "DIN44L"],
    ["din50l", "DIN50L"],
    ["din50", "DIN50L"],
    ["din62l", "DIN62L"],
    ["din62", "DIN62L"],
    ["din74l", "DIN74L"],
    ["din74", "DIN74L"],
    ["din 74 l", "DIN74L"],
    ["din80l", "DIN80L"],
    ["din90l", "DIN90L"],
    ["din100l", "DIN100L"],
    ["40al", "40AL"],
    ["50l", "50L"],
    ["60l", "60L"],
    ["60r", "60R"],
    ["80l", "80L"],
    ["80r", "80R"],
    ["90l", "90L"],
    ["90r", "90R"],
    ["100l", "100L"],
    ["100r", "100R"],
    ["100알", "100R"],
    ["100알타입", "100R"],
    ["90알", "90R"],
  ];

  for (const [alias, code] of pairs) {
    add(alias, code);
  }

  return index;
})();

export function normalizeBatterySpecAlias(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[·ㆍ._\-]/g, "")
    .replace(/암페어|ah/gi, "")
    .trim();
}

const VEHICLE_SIGNAL_RE =
  /쏘렌토|소렌토|그랜저|그랜져|K3|케이3|케이쓰리|스타리아|포터|아반떼|싼타페|산타페|투싼|팰리|펠리|카니발|셀토스|모닝|레이|니로|코나|봉고|쏘나타|소나타|아이오닉|ioniq|모하비|스포티지|K5|K7|K8|EV6/i;

/** 상품/브랜드 canonical → v0.3 규격 검색용 플랫폼 코드 */
const PRODUCT_CANONICAL_TO_PLATFORM: Record<string, string> = {
  CMF100R: "100R",
  GB100R: "100R",
  CMF90R: "90R",
  GB90R: "90R",
  DIN60L: "DIN62L",
  GB56219: "DIN62L",
  CMF56219: "DIN62L",
};

export function resolveBatterySpecCodesFromQuery(query: string): string[] {
  const q = query.trim();
  if (!q) return [];

  const found: string[] = [];
  const nqFull = normalizeBatterySpecAlias(q);
  const indexed = BATTERY_SPEC_ALIAS_INDEX[nqFull];
  if (indexed) found.push(indexed);

  let compact = q.replace(/\s+/g, "").toUpperCase();
  if (!found.length && compact === q.replace(/\s+/g, "").toUpperCase()) {
    for (const code of [...CANONICAL_SPECS].sort((a, b) => b.length - a.length)) {
      if (compact === code) {
        found.push(code);
        compact = "";
        break;
      }
    }
  }

  for (const code of [...CANONICAL_SPECS].sort((a, b) => b.length - a.length)) {
    if (compact.includes(code)) {
      found.push(code);
      compact = compact.replaceAll(code, "");
    }
  }

  if (!found.length) {
    const fromCanonical = getCanonicalBatteryCode(q);
    if (fromCanonical) {
      found.push(PRODUCT_CANONICAL_TO_PLATFORM[fromCanonical] ?? fromCanonical);
    }
  }

  const loose =
    q.match(/\b(AGM\d{2,3}[LR]?|DIN\d{2,3}L?|CMF\d{2}L|\d{2,3}[LR])\b/gi) ?? [];
  for (const raw of loose) {
    const n = normalizeBatterySpecAlias(raw);
    const mapped = BATTERY_SPEC_ALIAS_INDEX[n];
    if (mapped && !found.includes(mapped)) found.push(mapped);
  }

  const nq = normalizeBatterySpecAlias(q);
  if (BATTERY_SPEC_ALIAS_INDEX[nq] && !found.includes(BATTERY_SPEC_ALIAS_INDEX[nq])) {
    found.push(BATTERY_SPEC_ALIAS_INDEX[nq]);
  }

  let aliasScan = nq;
  for (const [alias, code] of Object.entries(BATTERY_SPEC_ALIAS_INDEX).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    if (alias.length < 3 || !aliasScan.includes(alias)) continue;
    if (!found.includes(code)) found.push(code);
    aliasScan = aliasScan.replace(alias, "");
  }

  return [...new Set(found)];
}

/** 규격만 검색(차량 키워드 없음) — 차량 alias 단일 확정 방지 */
export function isBatterySpecPrimaryQuery(query: string): boolean {
  const specs = resolveBatterySpecCodesFromQuery(query);
  if (!specs.length) return false;

  const stripped = query
    .replace(/\b(AGM|DIN|CMF|EFB)\s*\d+[LR]?\b/gi, "")
    .replace(/\b\d{2,3}[LR]\b/gi, "")
    .replace(/\s*배터리\s*/gi, " ")
    .trim();

  if (!stripped) return true;
  if (VEHICLE_SIGNAL_RE.test(stripped)) return false;

  const norm = normalizeVehicleAlias(stripped);
  return norm.length < 6;
}

export function stripBatterySpecTokensForVehicleMatch(query: string): string {
  let q = query;
  for (const code of resolveBatterySpecCodesFromQuery(query)) {
    q = q.replace(new RegExp(code, "gi"), " ");
  }
  return q.replace(/\s+/g, " ").trim();
}

export function isForbiddenBatteryComparePair(a: string, b: string): boolean {
  const ca = (getCanonicalBatteryCode(a) ?? a).toUpperCase();
  const cb = (getCanonicalBatteryCode(b) ?? b).toUpperCase();
  return BATTERY_SPEC_FORBIDDEN_COMPARE_PAIRS.some(
    ([x, y]) => (ca === x && cb === y) || (ca === y && cb === x),
  );
}

export type BatterySpecSearchResult = {
  primaryCode: string;
  codes: string[];
  isSpecPrimary: boolean;
};

export function resolveBatterySpecSearch(query: string): BatterySpecSearchResult | null {
  const codes = resolveBatterySpecCodesFromQuery(query);
  if (!codes.length) return null;
  return {
    primaryCode: codes[0]!,
    codes,
    isSpecPrimary: isBatterySpecPrimaryQuery(query),
  };
}
