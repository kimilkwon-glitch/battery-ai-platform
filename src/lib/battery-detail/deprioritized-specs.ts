import { normalizeBatteryCode } from "@/lib/batteryNormalize";

/** 판매·허브 비주력 — 검색·비교·인기 카드에서 후순위 (페이지 자체는 유지) */
export const DEPRIORITIZED_BATTERY_CODES = new Set(["115D31L", "115D31R"]);

export function isDeprioritizedBatterySpec(code: string): boolean {
  if (!code?.trim()) return false;
  const family = normalizeBatteryCode(code);
  const token = code.trim().toUpperCase().replace(/\s+/g, "");
  return (
    DEPRIORITIZED_BATTERY_CODES.has(family) ||
    DEPRIORITIZED_BATTERY_CODES.has(token) ||
    /^115D31[LR]$/i.test(family) ||
    /^115D31[LR]$/i.test(token)
  );
}

/** 핵심 주력 규격을 앞에, 115D31 등은 뒤로 */
export function sortSpecsBySalesPriority(specs: string[]): string[] {
  const primary: string[] = [];
  const secondary: string[] = [];
  for (const spec of specs) {
    if (isDeprioritizedBatterySpec(spec)) secondary.push(spec);
    else primary.push(spec);
  }
  return [...primary, ...secondary];
}
