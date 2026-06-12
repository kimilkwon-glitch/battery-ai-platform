import type { BenefitCardConfig } from "@/lib/benefits-data";
import { DEFAULT_PROMOTION_IDS } from "@/lib/promotion/default-promotions";

/** 고객 혜택 화면에서 숨길 프로모션 ID (운영 정책·어드민 시드는 유지) */
export const HIDDEN_PUBLIC_BENEFIT_PROMO_IDS = new Set<string>([
  DEFAULT_PROMOTION_IDS.storePickupNoDelivery,
]);

export function filterPublicBenefitCards(cards: BenefitCardConfig[]): BenefitCardConfig[] {
  return cards.filter((card) => !HIDDEN_PUBLIC_BENEFIT_PROMO_IDS.has(card.id));
}
