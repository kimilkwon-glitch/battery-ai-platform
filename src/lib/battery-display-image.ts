import type { BatteryBrandKey } from "@/lib/battery-alias-map";

/**
 * 홈 라인업 카드 전용 tight-crop display asset (원본 PNG는 유지)
 * 키: `{brand}:{canonicalCode}`
 */
const HOME_LINEUP_DISPLAY_SRC: Record<string, string> = {
  "solite:CMF60L": "/assets/batteries/display/solite-CMF60L-main.png",
};

export function resolveHomeLineupDisplaySrc(
  code: string,
  preferBrand?: BatteryBrandKey,
): string | null {
  if (!preferBrand) return null;
  const key = `${preferBrand}:${code.trim().toUpperCase()}`;
  return HOME_LINEUP_DISPLAY_SRC[key] ?? null;
}

/** @internal 테스트·분석용 */
export function listHomeLineupDisplayKeys(): string[] {
  return Object.keys(HOME_LINEUP_DISPLAY_SRC);
}
