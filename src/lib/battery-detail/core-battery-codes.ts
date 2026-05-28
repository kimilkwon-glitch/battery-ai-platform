import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";

/** 상품형 상세·규격 허브 — 8개 핵심 규격 (115D31L 제외) */
export const CORE_BATTERY_DETAIL_CODES = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "DIN74L",
  "100R",
  "CMF80L",
  "AGM95L",
  "EV 12V",
] as const;

export type CoreBatteryDetailCode = (typeof CORE_BATTERY_DETAIL_CODES)[number];

/** 배포·검수용 — 허브 HTML 버전 */
export const BATTERY_DETAIL_HUB_VERSION = "20260528-all";

/** family/별칭 → 허브 canonical (CMF80L·AGM60·100R 등) */
const FAMILY_TO_HUB_CODE: Record<string, CoreBatteryDetailCode> = {
  AGM60L: "AGM60L",
  AGM60: "AGM60L",
  AGM70L: "AGM70L",
  AGM70: "AGM70L",
  AGM80L: "AGM80L",
  AGM80: "AGM80L",
  DIN74L: "DIN74L",
  DIN74: "DIN74L",
  "100R": "100R",
  GB100R: "100R",
  CMF100R: "100R",
  CMF80L: "CMF80L",
  AGM95L: "AGM95L",
  AGM95: "AGM95L",
  EV12V: "EV 12V",
  "EV 12V": "EV 12V",
  "EV 12V AGM": "EV 12V",
};

export function normalizeCoreBatteryCode(code: string): string {
  const t = code.trim();
  if (/^ev\s*12v/i.test(t)) return "EV 12V";
  return t.toUpperCase().replace(/\s+/g, " ").replace(/^EV12V$/i, "EV 12V");
}

export function isCoreBatteryDetailCode(code: string): boolean {
  return resolveCoreBatteryHubCode(code) != null;
}

/** URL·canonical·family 기준 허브 규격 코드 (8개 중 하나) */
export function resolveCoreBatteryHubCode(code: string): CoreBatteryDetailCode | null {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const canonical = canonicalBatteryCode(trimmed) || normalizeCoreBatteryCode(trimmed);
  const normalized = normalizeCoreBatteryCode(canonical);
  if ((CORE_BATTERY_DETAIL_CODES as readonly string[]).includes(normalized as CoreBatteryDetailCode)) {
    return normalized as CoreBatteryDetailCode;
  }

  const family = normalizeBatteryCode(canonical || trimmed);
  const fromFamily = FAMILY_TO_HUB_CODE[family];
  if (fromFamily) return fromFamily;

  const fromCanonical = FAMILY_TO_HUB_CODE[canonical];
  if (fromCanonical) return fromCanonical;

  const token = trimmed.toUpperCase().replace(/\s+/g, "");
  return FAMILY_TO_HUB_CODE[token] ?? null;
}
