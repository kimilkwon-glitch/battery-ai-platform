import type { BenefitCardConfig } from "@/lib/benefits-data";
import { HUB_BENEFIT_FIRST_ORDER_3, HUB_BENEFITS } from "@/lib/benefits-data";
import type { PublicPromotionCard } from "@/types/promotion";

const FIRST_ORDER_PROMO_ID = "promo_first_order_3pct";

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
    image: promo.bannerImageUrl ?? promo.imageUrl ?? undefined,
    imageMobile: promo.imageUrl ?? promo.bannerImageUrl ?? undefined,
    imageAlt: promo.title,
    fallbackIcon: "percent",
    status: promo.displayStatus === "active" ? "active" : "coming_soon",
    href,
  };
}
