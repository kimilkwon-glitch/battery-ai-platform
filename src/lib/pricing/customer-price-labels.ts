/**
 * 고객 화면 가격·수령 방식 표시 라벨 (단일 source of truth)
 * 관리자/내부 코드의 internetPrice·onsitePrice 필드명은 유지한다.
 */
export const CUSTOMER_PRICE_LABELS = {
  productPurchase: "제품 구매가",
  deliveryOrder: "택배 주문",
  mobileInstall: "출장 교체가",
  storeInstall: "매장 교체가",
  storePickup: "매장 수령가",
  deliveryFee: "택배비",
  storeVisitDiscount: "매장 방문 할인",
  noReturnFee: "미반납 추가금",
  noReturnFeeIfSelected: "폐배터리 미반납 추가금이 있으면",
  batteryReturn: "폐배터리 반납",
  batteryReturnFree: "추가금 없음",
  total: "총 결제금액",
  priceBasis: "가격 기준",
  subtotal: "소계",
  noDeliveryFee: "택배비 없음",
  productAmount: "상품 합계",
} as const;

export const CUSTOMER_FULFILLMENT_LABELS = {
  delivery: "택배 주문",
  onsite_install: "출장 교체",
  store_install: "매장 교체",
  store_pickup_self: "매장 수령",
} as const;

export type CustomerFulfillmentDisplayKey = keyof typeof CUSTOMER_FULFILLMENT_LABELS;

export const CUSTOMER_FULFILLMENT_DESCRIPTIONS: Record<CustomerFulfillmentDisplayKey, string> = {
  delivery:
    "제품을 택배로 받아 직접 교체합니다. 택배비 15,000원이 추가됩니다.",
  onsite_install:
    "고객님 위치로 방문해 교체합니다. 출장 가능 지역은 확인 후 안내됩니다.",
  store_install:
    "매장 방문 후 교체합니다. 출장 교체가에서 5,000원이 차감됩니다.",
  store_pickup_self:
    "매장에서 제품만 수령해 직접 교체합니다. 제품 구매가 기준이며 택배비는 없습니다.",
};

/** 상품 상세 상단 — 기본 노출 가격 라벨 */
export const CUSTOMER_DETAIL_PRICE_LABELS = {
  productPurchase: CUSTOMER_PRICE_LABELS.productPurchase,
  mobileInstall: CUSTOMER_PRICE_LABELS.mobileInstall,
} as const;
