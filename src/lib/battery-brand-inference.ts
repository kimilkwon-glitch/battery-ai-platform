import type { BatteryBrandKey } from "@/lib/battery-alias-map";

/** 상품 코드 접두어로 브랜드 추론 — CMF=쏠라이트, GB=로케트, AGM/DIN=로케트 기본 */
export function inferBatteryBrandKeyFromCode(code: string): BatteryBrandKey {
  const c = code.trim().toUpperCase();
  if (c.startsWith("CMF")) return "solite";
  if (c.startsWith("GB")) return "rocket";
  return "rocket";
}

export function inferBrandIdFromCode(code: string): string {
  return inferBatteryBrandKeyFromCode(code);
}
