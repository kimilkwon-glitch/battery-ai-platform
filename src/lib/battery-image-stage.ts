/**
 * 배터리 이미지 variant — stage(카드) · chip(Q&A) · mini · content 단일 소스
 * GLOBAL-TUNE1: object-contain · 잘림 방지 · 용도별 크기
 */

/** 상품 카드·히어로·비교 stage */
export type BatteryImageStageVariant = "card" | "cardCompact" | "hero" | "search" | "compare";

/** 칩·썸네일·가이드 커버 */
export type BatteryImageCompactVariant = "chip" | "chipMd" | "mini" | "content";

export type BatteryImageVariant = BatteryImageStageVariant | BatteryImageCompactVariant;

export function isBatteryStageVariant(v: BatteryImageVariant): v is BatteryImageStageVariant {
  return v === "card" || v === "cardCompact" || v === "hero" || v === "search" || v === "compare";
}

/** stage 높이 */
export const batteryImageStageHeight: Record<BatteryImageStageVariant, string> = {
  card: "h-[144px] sm:h-[152px]",
  cardCompact: "h-[112px] sm:h-[118px]",
  hero: "h-[172px] sm:h-[192px]",
  search: "h-[152px] sm:h-[160px]",
  compare: "h-[160px] sm:h-[168px]",
};

export const batteryImageStageInset = "px-1.5 py-1 sm:px-2 sm:py-1.5";

/** stage 내부 제품 박스 — 잘림 없이 크게 */
export const batteryImageStageProductSize: Record<BatteryImageStageVariant, string> = {
  card: "relative h-[96%] w-[98%] max-h-full max-w-full shrink-0",
  cardCompact: "relative h-[95%] w-[97%] max-h-full max-w-full shrink-0",
  hero: "relative h-[94%] w-[96%] max-h-full max-w-full shrink-0",
  search: "relative h-[96%] w-[98%] max-h-full max-w-full shrink-0",
  compare: "relative h-[95%] w-[97%] max-h-full max-w-full shrink-0",
};

/** chip · mini · content */
export type BatteryCompactVariantConfig = {
  shell: string;
  inset: string;
  product: string;
  sizes: string;
};

export const batteryImageCompactVariant: Record<BatteryImageCompactVariant, BatteryCompactVariantConfig> = {
  chip: {
    shell:
      "relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--bm-border)]/80",
    inset: "p-[2px]",
    product: "relative h-[94%] w-[94%] max-h-full max-w-full",
    sizes: "36px",
  },
  chipMd: {
    shell:
      "relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--bm-border)]/80",
    inset: "p-[3px]",
    product: "relative h-[94%] w-[94%] max-h-full max-w-full",
    sizes: "40px",
  },
  mini: {
    shell:
      "relative shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200/80",
    inset: "p-1",
    product: "relative h-[93%] w-[93%] max-h-full max-w-full",
    sizes: "48px",
  },
  content: {
    shell:
      "relative h-[160px] w-[120px] min-w-[120px] shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200/80",
    inset: "p-2",
    product: "relative h-[94%] w-[96%] max-h-full max-w-full",
    sizes: "120px",
  },
};

/** 모든 배터리 실사 — contain + 중앙 */
export const batteryImageProductFit =
  "max-h-full max-w-full object-contain object-center";
