import type { PromotionRecord } from "@/types/promotion";
import {
  BENEFIT_VISIT_5000_DISCOUNT_MOBILE_SRC,
  BENEFIT_VISIT_5000_DISCOUNT_PC_SRC,
} from "@/lib/brand-assets";

/** checkout 자동 할인에 적용하지 않는 운영 가격 정책 혜택 (노출·설명 전용) */
export const PRICE_POLICY_PROMO_IDS = new Set([
  "promo_store_install_5000",
  "promo_store_pickup_no_delivery",
]);

export const DEFAULT_PROMOTION_IDS = {
  firstOrder3Pct: "promo_first_order_3pct",
  storeInstall5000: "promo_store_install_5000",
  storePickupNoDelivery: "promo_store_pickup_no_delivery",
} as const;

type DefaultPromotionSeed = Pick<
  PromotionRecord,
  | "id"
  | "title"
  | "description"
  | "status"
  | "type"
  | "discountType"
  | "discountValue"
  | "maxDiscountAmount"
  | "minOrderAmount"
  | "firstOrderOnly"
  | "newMemberOnly"
  | "memberOnly"
  | "allowedFulfillmentTypes"
  | "stackable"
  | "priority"
  | "imageUrl"
  | "bannerImageUrl"
  | "badgeText"
  | "showOnMain"
  | "showOnBenefitsPage"
>;

export const DEFAULT_PROMOTION_SEEDS: DefaultPromotionSeed[] = [
  {
    id: DEFAULT_PROMOTION_IDS.firstOrder3Pct,
    title: "회원가입 첫 주문 3% 자동 혜택",
    description: "회원가입 후 첫 주문 시 자동 적용됩니다.",
    status: "active",
    type: "automatic",
    discountType: "percent",
    discountValue: 3,
    maxDiscountAmount: null,
    minOrderAmount: null,
    firstOrderOnly: true,
    newMemberOnly: true,
    memberOnly: true,
    allowedFulfillmentTypes: null,
    stackable: false,
    priority: 100,
    imageUrl: "/assets/benefits/benefit-first-order-3-percent-mobile.png",
    bannerImageUrl: "/assets/benefits/benefit-first-order-3-percent-pc.png",
    badgeText: "첫 주문 3%",
    showOnMain: true,
    showOnBenefitsPage: true,
  },
  {
    id: DEFAULT_PROMOTION_IDS.storeInstall5000,
    title: "매장교체 내방 5,000원 할인",
    description: "매장 방문 후 교체 시 출장 교체가에서 5,000원 할인됩니다.",
    status: "active",
    type: "automatic",
    discountType: "fixed_amount",
    discountValue: 5_000,
    maxDiscountAmount: null,
    minOrderAmount: null,
    firstOrderOnly: false,
    newMemberOnly: false,
    memberOnly: false,
    allowedFulfillmentTypes: ["store_install"],
    stackable: false,
    priority: 50,
    imageUrl: BENEFIT_VISIT_5000_DISCOUNT_MOBILE_SRC,
    bannerImageUrl: BENEFIT_VISIT_5000_DISCOUNT_PC_SRC,
    badgeText: "내방 5,000원",
    showOnMain: false,
    showOnBenefitsPage: true,
  },
  {
    id: DEFAULT_PROMOTION_IDS.storePickupNoDelivery,
    title: "매장수령 택배비 없음",
    description:
      "셀프교체를 위해 매장 수령 시 제품 구매가 기준이며 택배비는 부과되지 않습니다.",
    status: "active",
    type: "automatic",
    discountType: "fixed_amount",
    discountValue: 15_000,
    maxDiscountAmount: null,
    minOrderAmount: null,
    firstOrderOnly: false,
    newMemberOnly: false,
    memberOnly: false,
    allowedFulfillmentTypes: ["store_pickup_self"],
    stackable: false,
    priority: 40,
    imageUrl: null,
    bannerImageUrl: null,
    badgeText: "택배비 없음",
    showOnMain: false,
    showOnBenefitsPage: true,
  },
];

export function formatAdminPromotionDiscount(promo: Pick<PromotionRecord, "id" | "discountType" | "discountValue">): string {
  if (promo.id === DEFAULT_PROMOTION_IDS.storeInstall5000) {
    return "정액 5,000원 · 가격정책";
  }
  if (promo.id === DEFAULT_PROMOTION_IDS.storePickupNoDelivery) {
    return "택배비 제외 · 가격정책";
  }
  if (promo.discountType === "percent") {
    return `${promo.discountValue}%`;
  }
  return `${promo.discountValue.toLocaleString("ko-KR")}원`;
}

export function formatAdminPromotionType(promo: Pick<PromotionRecord, "id" | "type" | "code">): string {
  if (PRICE_POLICY_PROMO_IDS.has(promo.id)) {
    return "가격 안내/정책";
  }
  if (promo.type === "automatic") {
    return "자동 적용";
  }
  return `쿠폰 ${promo.code ?? ""}`.trim();
}
