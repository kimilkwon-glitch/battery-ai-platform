/** 메인 히어로 CSS(.home-hero-carousel__viewport--unified)와 동일한 권장 비율 */

export const BANNER_DESKTOP_ASPECT = 1916 / 821;
export const BANNER_MOBILE_ASPECT = 16 / 10;

export const BANNER_IMAGE_SPECS = {
  desktop: {
    width: 1920,
    height: 820,
    aspect: BANNER_DESKTOP_ASPECT,
    ratioLabel: "약 2.33:1",
    hint: "PC 권장: 1920×820px (약 2.33:1)",
  },
  mobile: {
    width: 900,
    height: 562,
    aspect: BANNER_MOBILE_ASPECT,
    ratioLabel: "약 1.60:1",
    hint: "모바일 권장: 900×562px (약 1.60:1)",
  },
  maxBytes: 5 * 1024 * 1024,
  maxSizeLabel: "5MB",
  allowedFormats: "JPG, PNG, WEBP",
} as const;

export function bannerAspectWarning(
  naturalWidth: number,
  naturalHeight: number,
  target: "desktop" | "mobile",
): string | null {
  if (!naturalWidth || !naturalHeight) return null;
  const actual = naturalWidth / naturalHeight;
  const expected =
    target === "desktop" ? BANNER_IMAGE_SPECS.desktop.aspect : BANNER_IMAGE_SPECS.mobile.aspect;
  const delta = Math.abs(actual - expected) / expected;
  if (delta <= 0.12) return null;
  const spec = BANNER_IMAGE_SPECS[target];
  return `업로드 이미지 비율(${actual.toFixed(2)}:1)이 권장(${spec.ratioLabel})과 다릅니다. 메인 배너에서 잘릴 수 있습니다.`;
}
