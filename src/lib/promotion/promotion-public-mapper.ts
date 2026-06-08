import type { PromotionRecord, PublicPromotionCard } from "@/types/promotion";

function effectiveDisplayStatus(
  promo: Pick<PromotionRecord, "status" | "startsAt" | "endsAt">,
  now = new Date(),
): PublicPromotionCard["displayStatus"] {
  if (promo.status === "inactive") return "expired";
  const starts = promo.startsAt ? new Date(promo.startsAt) : null;
  const ends = promo.endsAt ? new Date(promo.endsAt) : null;
  if (ends && ends < now) return "expired";
  if (starts && starts > now) return "scheduled";
  return "active";
}

export function toPublicPromotionCard(promo: PromotionRecord, now = new Date()): PublicPromotionCard {
  const displayStatus = effectiveDisplayStatus(promo, now);

  return {
    id: promo.id,
    title: promo.title,
    description: promo.description,
    type: promo.type,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    badgeText: promo.badgeText,
    imageUrl: promo.imageUrl,
    bannerImageUrl: promo.bannerImageUrl,
    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
    code: promo.type === "coupon_code" && promo.showOnBenefitsPage ? promo.code : null,
    showOnMain: promo.showOnMain,
    showOnBenefitsPage: promo.showOnBenefitsPage,
    displayStatus,
  };
}
