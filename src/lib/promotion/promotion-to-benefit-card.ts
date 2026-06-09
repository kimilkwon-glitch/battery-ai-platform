import type { BenefitCardConfig } from "@/lib/benefits-data";
import { HUB_BENEFIT_FIRST_ORDER_3, HUB_BENEFITS } from "@/lib/benefits-data";
import { resolveBenefitImageUrl } from "@/lib/benefits-image-resolve";
import type { PublicPromotionCard } from "@/types/promotion";

import { DEFAULT_PROMOTION_IDS } from "@/lib/promotion/default-promotions";

const FIRST_ORDER_PROMO_ID = DEFAULT_PROMOTION_IDS.firstOrder3Pct;

export function publicPromotionToBenefitCard(promo: PublicPromotionCard): BenefitCardConfig {
  const href =
    promo.id === FIRST_ORDER_PROMO_ID
      ? HUB_BENEFIT_FIRST_ORDER_3
      : promo.type === "coupon_code" && promo.code
        ? HUB_BENEFITS
        : HUB_BENEFITS;

  return {
    id: promo.id,
    title: promo.title,
    label: promo.type === "automatic" ? "자동 적용" : promo.code ? `쿠폰 ${promo.code}` : "쿠폰",
    description: promo.description,
    note: promo.badgeText ?? undefined,
    image: resolveBenefitImageUrl(promo.bannerImageUrl ?? promo.imageUrl),
    imageMobile: resolveBenefitImageUrl(promo.imageUrl ?? promo.bannerImageUrl),
    imageAlt: promo.title,
    fallbackIcon: "percent",
    status: promo.displayStatus === "active" ? "active" : "coming_soon",
    href,
  };
}
