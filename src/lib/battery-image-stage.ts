/**
 * 배터리 이미지 variant — height 기준 렌더링 단일 소스
 *
 * TODO(asset-normalize): 원본 asset마다 캔버스·여백·배경 비율이 달라 CSS만으로 완전 통일 불가.
 * AGM95L 등 배경이 섞인 이미지는 asset 정규화(트림/투명 배경) 대상.
 */

/** 상품 카드·히어로·비교 image stage */
export type BatteryImageStageVariant = "card" | "cardCompact" | "hero" | "search" | "compare";

export type BatteryImageCompactVariant = "chip" | "chipMd" | "mini" | "content";

export type BatteryImageVariant = BatteryImageStageVariant | BatteryImageCompactVariant;

export function isBatteryStageVariant(v: BatteryImageVariant): v is BatteryImageStageVariant {
  return v === "card" || v === "cardCompact" || v === "hero" || v === "search" || v === "compare";
}

/**
 * TODO(asset-normalize): 원본 PNG 캔버스 여백이 많으면 CSS만으로 상품 크기 한계.
 * product-card variant scale은 stage 170px 안에서만 적용 — 잘림 방지용 여유 확보.
 */

/** stage 외곽 — product-card 170px (overflow-hidden은 stage만) */
export const batteryImageStageHeight: Record<BatteryImageStageVariant, string> = {
  card: "h-[180px] min-h-[180px]",
  cardCompact: "h-[168px] min-h-[168px]",
  hero: "h-[200px] sm:h-[220px]",
  search: "h-[180px] min-h-[180px]",
  compare: "h-[176px] min-h-[176px]",
};

export const batteryImageStageInset =
  "flex h-full w-full items-center justify-center overflow-visible px-1 py-1";

/** img height 135~150px — width auto, height 기준 only */
export const batteryImageStageImgHeight: Record<BatteryImageStageVariant, string> = {
  card: "h-[152px] min-h-[152px]",
  cardCompact: "h-[142px] min-h-[142px]",
  hero: "h-[176px] sm:h-[196px]",
  search: "h-[152px] min-h-[152px]",
  compare: "h-[148px] min-h-[148px]",
};

export const batteryImageStageImgMaxWidth = "max-w-[94%]";

/** asset 여백 보정 — stage 높이 확보 후 center scale (잘림 시 scale 낮출 것) */
export const batteryImageStagePhotoScale: Record<BatteryImageStageVariant, string> = {
  card: "inline-flex origin-center scale-[1.22]",
  cardCompact: "inline-flex origin-center scale-[1.16]",
  hero: "inline-flex origin-center",
  search: "inline-flex origin-center scale-[1.2]",
  compare: "inline-flex origin-center scale-[1.14]",
};

/** height 기준 img class (fill 미사용) */
export const batteryImageHeightFit = "w-auto object-contain object-center";

export type BatteryCompactVariantConfig = {
  shell: string;
  imgHeight: string;
  imgMaxWidth: string;
  sizes: string;
};

/** Q&A 칩 — BatteryMiniSpecLink / QnaChipBatteryImage 전용 (28~34px 박스) */
export const QNA_CHIP_IMAGE_BOX =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-inset ring-slate-200/70";

export const QNA_CHIP_IMG_HEIGHT = "h-[26px]";
export const QNA_CHIP_IMG_MAX_W = "max-w-[32px]";

export const batteryImageCompactVariant: Record<BatteryImageCompactVariant, BatteryCompactVariantConfig> = {
  chip: {
    shell: QNA_CHIP_IMAGE_BOX,
    imgHeight: QNA_CHIP_IMG_HEIGHT,
    imgMaxWidth: QNA_CHIP_IMG_MAX_W,
    sizes: "36px",
  },
  chipMd: {
    shell: QNA_CHIP_IMAGE_BOX,
    imgHeight: QNA_CHIP_IMG_HEIGHT,
    imgMaxWidth: QNA_CHIP_IMG_MAX_W,
    sizes: "32px",
  },
  mini: {
    shell:
      "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--bm-image-bg)] ring-1 ring-slate-200/80",
    imgHeight: "h-10",
    imgMaxWidth: "max-w-[44px]",
    sizes: "48px",
  },
  content: {
    shell:
      "flex h-[160px] w-[120px] min-w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-slate-200/80",
    imgHeight: "h-[140px]",
    imgMaxWidth: "max-w-[92%]",
    sizes: "120px",
  },
};

/** @deprecated fill 기반 — height 렌더로 대체 */
export const batteryImageProductFit = "w-auto object-contain object-center";
