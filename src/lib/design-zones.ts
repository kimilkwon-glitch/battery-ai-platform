/**
 * 기능별 포인트 컬러 존 — 배경은 차분, 배지·라인·hover에만 적용
 */

export type DesignZone =
  | "default"
  | "benefit"
  | "review"
  | "guide"
  | "support"
  | "store"
  | "store-deokcheon"
  | "store-hakjang"
  | "brand"
  | "auth"
  | "checkout"
  | "cart"
  | "lookup"
  | "product"
  | "vehicle"
  | "legal";

export function zoneClass(zone: DesignZone = "default"): string {
  if (zone === "default") return "";
  return `bm-zone bm-zone--${zone}`;
}

export function zoneHeaderClass(zone: DesignZone = "default"): string {
  if (zone === "default") return "bm-page-header";
  return `bm-page-header bm-page-header--${zone}`;
}
