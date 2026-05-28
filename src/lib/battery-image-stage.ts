/**
 * 배터리 카드 이미지 stage — 높이·패딩·overflow 단일 소스
 * COMPACT-FIX1: scale 클립 제거 → stage 소폭 확대 + contain 중앙 정렬
 */

export type BatteryImageStageVariant = "card" | "cardCompact" | "hero" | "search" | "compare";

/** stage 높이 — 이미지 잘림 방지용 소폭 확대 (하단은 컴팩트로 상쇄) */
export const batteryImageStageHeight: Record<BatteryImageStageVariant, string> = {
  card: "h-[144px] sm:h-[152px]",
  cardCompact: "h-[112px] sm:h-[118px]",
  hero: "h-[168px] sm:h-[188px]",
  search: "h-[152px] sm:h-[160px]",
  compare: "h-[160px] sm:h-[168px]",
};

export const batteryImageStageInset = "px-2 py-1.5 sm:px-2.5 sm:py-2";

/** transform scale 대신 박스 비율로 크기 확보 — 잘림 없음 */
export const batteryImageStageProductSize: Record<BatteryImageStageVariant, string> = {
  card: "relative h-[94%] w-[97%] max-h-full max-w-full shrink-0",
  cardCompact: "relative h-[93%] w-[96%] max-h-full max-w-full shrink-0",
  hero: "relative h-[90%] w-[94%] max-h-full max-w-full shrink-0",
  search: "relative h-[94%] w-[97%] max-h-full max-w-full shrink-0",
  compare: "relative h-[93%] w-[96%] max-h-full max-w-full shrink-0",
};

/** contain — 중앙 정렬 (상하 잘림 방지) */
export const batteryImageProductFit =
  "max-h-full max-w-full object-contain object-center";
