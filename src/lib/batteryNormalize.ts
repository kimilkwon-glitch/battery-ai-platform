/**
 * 배터리 규격 family key 정규화·alias 매칭
 * DB primaryBattery(100R) ↔ 상품코드(CMF100R/GB100R) 연결용
 */
export const BATTERY_ALIAS_MAP: Record<string, string[]> = {
  "100R": ["100R", "CMF100R", "GB100R", "DF100R", "쏠라이트 CMF100R", "로케트 GB100R"],
  "100L": ["100L", "CMF100L", "GB100L", "DF100L"],

  "90R": ["90R", "CMF90R", "GB90R", "DF90R"],
  "90L": ["90L", "CMF90L", "GB90L", "DF90L"],

  "80R": ["80R", "CMF80R", "GB80R", "DF80R"],
  "80L": ["80L", "CMF80L", "GB80L", "DF80L"],

  AGM60L: ["AGM60L", "AGM60", "AGM LN2", "LN2 AGM"],
  AGM70L: ["AGM70L", "AGM70", "AGM LN3", "LN3 AGM"],
  AGM80L: ["AGM80L", "AGM80", "AGM LN4", "LN4 AGM"],
  AGM80R: ["AGM80R", "AGM80 R", "AGM LN4 R", "GB80R", "CMF80R", "80R"],
  AGM95L: ["AGM95L", "AGM95", "AGM LN5", "LN5 AGM"],
  AGM95R: ["AGM95R", "AGM95 R", "AGM LN5 R"],
  AGM105L: ["AGM105L", "AGM105", "AGM LN6", "LN6 AGM"],
  AGM105R: ["AGM105R", "AGM105 R", "AGM LN6 R"],

  GB450LS: ["GB450LS", "로케트 GB450LS", "GB450", "EV450LS"],

  DIN50L: ["DIN50L", "55066", "DIN50", "50L"],
  DIN62L: ["DIN62L", "56219", "DIN60HL", "DIN60Ah", "DIN60L"],
  DIN74L: ["DIN74L", "57412", "57820", "DIN74"],
  DIN74R: ["DIN74R", "57219", "GB57219", "57412R", "57820R"],
  DIN80L: ["DIN80L", "DIN80"],
  DIN90L: ["DIN90L", "59042", "DIN90"],
};

/** vehicle-battery-db normalizationRules — family 매칭 전 1차 변환 */
const DB_NORM_RULES: Record<string, string> = {
  DIN60HL: "DIN62L",
  DIN60Ah: "DIN62L",
  DIN60AH: "DIN62L",
  "56219": "DIN62L",
  "57820": "DIN74L",
  "57412": "DIN74L",
  DIN74: "DIN74L",
  "55066": "DIN50L",
  "54459": "DIN50L",
  "57219": "DIN74R",
  DIN72L: "DIN74R",
  GB57219: "DIN74R",
  "59042": "DIN90L",
  "60044": "DIN100L",
  "60038": "DIN100L",
  AGM70: "AGM70L",
  AGM80: "AGM80L",
  AGM95: "AGM95L",
  AGM105: "AGM105L",
  DF80L: "80L",
  DF80R: "80R",
  DF90L: "90L",
  DF90R: "90R",
  DF100R: "100R",
  DF60L: "60L",
};

const KOREAN_BRAND_PREFIX = /^(로케트|쏠라이트|로케트배터리|쏠라이트배터리|델코|바르타|한국AT|표준)\s*/i;

function normalizeToken(input: string): string {
  let s = input.trim().toUpperCase();
  s = s.replace(KOREAN_BRAND_PREFIX, "");
  s = s.replace(/[\s-]/g, "");
  if (s === "EV12V" || s === "EV12VAGM") return s;
  return s;
}

const aliasToFamily = new Map<string, string>();

function registerFamilyAlias(raw: string, family: string) {
  const key = normalizeToken(raw);
  if (key) aliasToFamily.set(key, family);
}

for (const [family, aliases] of Object.entries(BATTERY_ALIAS_MAP)) {
  registerFamilyAlias(family, family);
  for (const a of aliases) registerFamilyAlias(a, family);
}

/** 사이트에서 제거된 규격 — 검색·상세 진입 차단용 */
export function isRetiredBatterySpec(code: string): boolean {
  return normalizeToken(code) === "DIN72L";
}

/** UI·href·카드용 — CMF80L, AGM80L, GB450LS 등 prefix 포함 전체 코드 보존 */
const PREFIXED_PRODUCT_CODE_RE =
  /^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)(\d+[A-Z]?|[A-Z]?\d+[LR])$/i;

export function productBatteryCode(code: string): string {
  if (!code?.trim()) return "";
  const raw = code.trim();
  if (/^EV\s*12V\s*AGM$/i.test(raw)) return "EV 12V AGM";
  if (/^EV\s*12V/i.test(raw)) return "EV 12V";
  let token = normalizeToken(code);
  token = token.replace(KOREAN_BRAND_PREFIX, "");
  if (DB_NORM_RULES[token]) token = normalizeToken(DB_NORM_RULES[token]);
  if (token === "EV12V") return "EV 12V";
  if (PREFIXED_PRODUCT_CODE_RE.test(token)) return token;
  const family = normalizeBatteryCode(code);
  return family || token;
}

/** 비교·매칭용 family key (100R, AGM80L 등). L/R 유지 */
export function normalizeBatteryCode(code: string): string {
  if (!code?.trim()) return "";
  let token = normalizeToken(code);
  if (DB_NORM_RULES[token]) token = normalizeToken(DB_NORM_RULES[token]);

  const hit = aliasToFamily.get(token);
  if (hit) return hit;

  // CMF/GB/DF 접두어 제거 후 재시도 (AGM/DIN은 유지)
  if (/^(CMF|GB|DF)(\d+[LR])$/.test(token)) {
    const stripped = token.replace(/^(CMF|GB|DF)/, "");
    const hit2 = aliasToFamily.get(stripped);
    if (hit2) return hit2;
  }

  return token;
}

export function getBatteryAliases(code: string): string[] {
  const family = normalizeBatteryCode(code);
  return BATTERY_ALIAS_MAP[family] ?? [code.trim(), family];
}

export function terminalFromCode(code: string): "L" | "R" | null {
  const family = normalizeBatteryCode(code);
  if (family.endsWith("R")) return "R";
  if (family.endsWith("L")) return "L";
  const token = normalizeToken(code);
  if (token.endsWith("R")) return "R";
  if (token.endsWith("L")) return "L";
  return null;
}

export function isBatteryMatched(vehicleBatteryCode: string, batteryProductCode: string): boolean {
  const a = normalizeBatteryCode(vehicleBatteryCode);
  const b = normalizeBatteryCode(batteryProductCode);
  if (!a || !b || a !== b) return false;
  const ta = terminalFromCode(vehicleBatteryCode);
  const tb = terminalFromCode(batteryProductCode);
  if (ta && tb && ta !== tb) return false;
  return true;
}

export type BatteryDisplayResolved = {
  /** 화면 표시용 (DB family — 100R, AGM80L) */
  displayCode: string;
  /** family key */
  familyKey: string;
  /** 상품/이미지 lookup 후보 코드 목록 */
  productCandidates: string[];
};

function displayCodeForCustomer(raw: string): string {
  let displayCode = productBatteryCode(raw) || raw.trim().replace(/\s+/g, "").toUpperCase();
  if (/^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)/i.test(displayCode)) return displayCode;
  if (/^AGM/i.test(displayCode)) return displayCode;
  const family = normalizeBatteryCode(raw);
  const agmKey = `AGM${family}`;
  if (family && BATTERY_ALIAS_MAP[agmKey]) {
    const agm = productBatteryCode(agmKey);
    if (agm && /^AGM/i.test(agm)) return agm;
  }
  return displayCode;
}

export function resolveBatteryDisplay(code: string): BatteryDisplayResolved {
  const displayCode = displayCodeForCustomer(code);
  const familyKey = normalizeBatteryCode(displayCode);
  const aliases = getBatteryAliases(familyKey);
  return {
    displayCode,
    familyKey,
    productCandidates: [...new Set([code.trim(), displayCode, ...aliases])],
  };
}

/** @deprecated normalizeBatteryFamilyKey 와 동일 */
export function resolveBatteryFamilyKey(code: string): string {
  return normalizeBatteryCode(code);
}
