import {
  BENEFIT_FIRST_ORDER_3_PERCENT_MOBILE_SRC,
  BENEFIT_FIRST_ORDER_3_PERCENT_PC_SRC,
} from "@/lib/brand-assets";

/** CMS/DB에 남아 있는 레거시 혜택 이미지 경로 → 실제 public 자산 */
const BENEFIT_IMAGE_ALIASES: Record<string, string> = {
  "/assets/benefits/first-order-3-banner.png": BENEFIT_FIRST_ORDER_3_PERCENT_PC_SRC,
  "/assets/benefits/first-order-3-card.png": BENEFIT_FIRST_ORDER_3_PERCENT_MOBILE_SRC,
};

export function resolveBenefitImageUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const base = url.split("?")[0]!.trim();
  return BENEFIT_IMAGE_ALIASES[base] ?? url;
}
