/**
 * 배터리 카드 이미지 stage — 높이·패딩·overflow 단일 소스
 * 크기감은 유지하고 카드 안에 안착시키기 위한 토큰
 */

export type BatteryImageStageVariant = "card" | "cardCompact" | "hero" | "search" | "compare";

/** 고정 stage 높이 — 시각 크기감 유지, overflow는 stage에서 clip */
export const batteryImageStageHeight: Record<BatteryImageStageVariant, string> = {
  card: "h-[132px] sm:h-[140px]",
  cardCompact: "h-[104px] sm:h-[112px]",
  hero: "h-[168px] sm:h-[188px]",
  search: "h-[148px] sm:h-[156px]",
  compare: "h-[156px] sm:h-[168px]",
};

/** stage 내부 이미지 nest 패딩 */
export const batteryImageStageInset = "px-3 pt-2.5 pb-3 sm:px-3.5 sm:pt-3 sm:pb-3.5";

/** contain 이미지 — 바닥 정렬로 제품 대표컷 느낌 */
export const batteryImageProductFit =
  "max-h-full max-w-full object-contain object-[center_92%]";
