/** Battery Manager — 데이터 레이어 공통 상수 */

export const DATA_VERSION = "1.0.0";

export const IMAGE_FALLBACK = {
  vehicle: "/assets/fallback/vehicle.png",
  battery: "/assets/fallback/battery.png",
  brand: "/assets/fallback/brand.png",
  guide: "/assets/fallback/guide.png",
  /** PNG 미존재 시 SVG 대체 */
  legacyVehicle: "/fallback/car-placeholder.svg",
} as const;

export const BRAND_SLUGS = {
  hyundai: "hyundai",
  kia: "kia",
  rocket: "rocket",
  solite: "solite",
  delkor: "delkor",
} as const;
