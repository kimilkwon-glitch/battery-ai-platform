import type { BenefitCardConfig } from "@/lib/benefits-data";
import { DEFAULT_PROMOTION_IDS } from "@/lib/promotion/default-promotions";

/** 고객 혜택 화면에서 숨길 프로모션 ID (운영 정책·어드민 시드는 유지) */
export const HIDDEN_PUBLIC_BENEFIT_PROMO_IDS = new Set<string>([
  DEFAULT_PROMOTION_IDS.storePickupNoDelivery,
]);

/** 고객 혜택 슬라이더/카드에서 이미지 노출만 숨길 항목 (3% 기능·계산은 유지) */
export const HIDDEN_BENEFIT_CAROUSEL_CARD_IDS = new Set<string>([
  ...HIDDEN_PUBLIC_BENEFIT_PROMO_IDS,
  DEFAULT_PROMOTION_IDS.firstOrder3Pct,
  "first-order-3",
  "first-order-3-fallback",
]);

export function filterPublicBenefitCards(cards: BenefitCardConfig[]): BenefitCardConfig[] {
  return cards.filter((card) => !HIDDEN_BENEFIT_CAROUSEL_CARD_IDS.has(card.id));
}
