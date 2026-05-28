/** 상품형 상세·규격 허브 — 9개 핵심 규격 */
export const CORE_BATTERY_DETAIL_CODES = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "DIN74L",
  "100R",
  "CMF80L",
  "115D31L",
  "AGM95L",
  "EV 12V",
] as const;

export type CoreBatteryDetailCode = (typeof CORE_BATTERY_DETAIL_CODES)[number];

export function isCoreBatteryDetailCode(code: string): boolean {
  const normalized = normalizeCoreBatteryCode(code);
  return (CORE_BATTERY_DETAIL_CODES as readonly string[]).includes(normalized as CoreBatteryDetailCode);
}

export function normalizeCoreBatteryCode(code: string): string {
  const t = code.trim();
  if (/^ev\s*12v/i.test(t)) return "EV 12V";
  return t.toUpperCase().replace(/\s+/g, " ").replace(/^EV12V$/i, "EV 12V");
}
