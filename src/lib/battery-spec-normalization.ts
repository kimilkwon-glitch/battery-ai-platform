/**
 * 배터리 규격 동의어·순정명 → 판매 대표 규격 정규화 (고객-facing 2순위 SoT)
 * 일반 JIS(80R/50L 등) ↔ AGM/DIN 자동 변환 금지 — bare JIS는 canonical-battery-code에서 보호
 */
import { isBareJisBatterySpec } from "@/lib/batteryNormalize";

/** 동의어·순정명 → 판매 대표 규격 (L/R 단자 혼합 금지) */
export const BATTERY_SPEC_NORMALIZATION: Record<string, string> = {
  AGM90L: "AGM95L",
  "AGM 90L": "AGM95L",
  "AGM 90Ah": "AGM95L",
  AGM90: "AGM95L",
  AGM95: "AGM95L",
  "AGM 95Ah": "AGM95L",

  DIN72L: "DIN74L",
  DIN74L: "DIN74L",
  DIN78L: "DIN74L",
  "57412": "DIN74L",
  LN3: "DIN74L",

  DIN80L: "DIN80L",
  "58014": "DIN80L",
  "58015": "DIN80L",
  LN4: "DIN80L",

  DIN90L: "DIN90L",
  "59018": "DIN90L",

  DIN100L: "DIN100L",
  "60044": "DIN100L",

  DIN50L: "DIN50L",
  DIN44L: "DIN44L",

  "AGM 60Ah": "AGM60L",
  "AGM 70Ah": "AGM70L",
  "AGM 80Ah": "AGM80L",
  "AGM 105Ah": "AGM105L",
};

const PLACEHOLDER_RE =
  /^(—|-|없음|미등록|확인\s*필요|사진\s*확인|상담\s*확인|문의\s*필요|준비\s*중|판매\s*제외|판매제외|sales_excluded|internal_hold|internal\s*hold)$/i;

const INVALID_PATTERN_RE =
  /확인\s*필요|사진\s*확인|상담\s*필요|문의\s*필요|미등록|준비\s*중|판매\s*제외|판매제외|리튬|미판매|상담\s*필요|^EV\s*12V/i;

function normLookupKey(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

const NORM_LOOKUP = new Map<string, string>();
for (const [raw, target] of Object.entries(BATTERY_SPEC_NORMALIZATION)) {
  NORM_LOOKUP.set(normLookupKey(raw), target);
}

/** 정규화 사유 (audit용) */
export function batterySpecNormalizationReason(
  input: string | null | undefined,
): string | null {
  if (!input?.trim()) return null;
  const key = normLookupKey(input);
  if (NORM_LOOKUP.has(key) && NORM_LOOKUP.get(key) !== key) {
    return `BATTERY_SPEC_NORMALIZATION:${key}→${NORM_LOOKUP.get(key)}`;
  }
  return null;
}

/**
 * 운영·고객-facing 대표 규격 정규화
 * 무효 입력은 null
 */
export function normalizeBatterySpecCode(
  input: string | null | undefined,
): string | null {
  if (input == null) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (PLACEHOLDER_RE.test(trimmed)) return null;
  if (INVALID_PATTERN_RE.test(trimmed)) return null;

  const key = normLookupKey(trimmed);
  if (key === "EV_LOW_VOLTAGE_BATTERY" || key === "EV_AUX_12V") {
    return "ev_low_voltage_battery";
  }

  const mapped = NORM_LOOKUP.get(key) ?? key;

  if (PLACEHOLDER_RE.test(mapped)) return null;
  if (INVALID_PATTERN_RE.test(mapped)) return null;
  if (mapped === "ev_low_voltage_battery") return mapped;

  if (isBareJisBatterySpec(mapped)) return mapped;

  if (/^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)\d/i.test(mapped)) return mapped;
  if (/^\d+(AL|[LR])$/i.test(mapped)) return mapped.toUpperCase();

  if (/^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)/i.test(mapped)) return mapped;
  return mapped;
}

/** normalize 이후 유효 규격 여부 */
export function isValidBatterySpecCode(spec: string | null | undefined): boolean {
  return normalizeBatterySpecCode(spec) !== null;
}
