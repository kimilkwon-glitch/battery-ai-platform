/**
 * 배터리 카드 이미지 stage — 높이·패딩·overflow·스케일 단일 소스
 */

export type BatteryImageStageVariant = "card" | "cardCompact" | "hero" | "search" | "compare";

/** 고정 stage 높이 — 영역은 유지, 내부 제품 스케일로 상품성 확보 */
export const batteryImageStageHeight: Record<BatteryImageStageVariant, string> = {
  card: "h-[132px] sm:h-[140px]",
  cardCompact: "h-[104px] sm:h-[112px]",
  hero: "h-[168px] sm:h-[188px]",
  search: "h-[148px] sm:h-[156px]",
  compare: "h-[156px] sm:h-[168px]",
};

/** stage 내부 nest — 패딩 축소로 제품 면적 확보 */
export const batteryImageStageInset = "px-1.5 pt-1 pb-1.5 sm:px-2 sm:pt-1.5 sm:pb-2";

/** variant별 제품 스케일 (~1.5–1.6×, overflow는 stage에서 clip) */
export const batteryImageStageScale: Record<BatteryImageStageVariant, string> = {
  card: "origin-bottom scale-[1.55] sm:scale-[1.62]",
  cardCompact: "origin-bottom scale-[1.5] sm:scale-[1.58]",
  hero: "origin-bottom scale-[1.48] sm:scale-[1.55]",
  search: "origin-bottom scale-[1.55] sm:scale-[1.62]",
  compare: "origin-bottom scale-[1.52] sm:scale-[1.58]",
};

export const batteryImageStageProductBox = "relative h-full w-full";

/** contain 이미지 — 바닥 안착 */
export const batteryImageProductFit =
  "max-h-full max-w-full object-contain object-[center_88%]";
