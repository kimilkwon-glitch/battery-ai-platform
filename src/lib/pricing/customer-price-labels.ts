/**
 * 고객 화면 가격·수령 방식 표시 라벨 (단일 source of truth)
 * 관리자/내부 코드의 internetPrice·onsitePrice 필드명은 유지한다.
 */
export const CUSTOMER_PRICE_LABELS = {
  productPurchase: "제품 구매가",
  deliveryOrder: "택배 주문",
  mobileInstall: "출장교체가",
  storeInstall: "매장 교체가",
  storePickup: "매장 수령가",
  deliveryFee: "택배비",
  /** @deprecated 고객 breakdown — mobileInstall 사용 */
  onsiteInstallFee: "출장/장착비",
  /** @deprecated 고객 breakdown — storeVisitDiscount 사용 */
  storeInstallFee: "매장 교체비",
  pickupFee: "수령비",
  storeVisitDiscount: "내방할인",
  noReturnFee: "미반납 추가금",
  noReturnSurcharge: "폐배터리 미반납",
  noReturnFeeIfSelected: "폐배터리 미반납 추가금이 있으면",
  batteryReturn: "폐배터리 반납",
  batteryReturnFree: "추가금 없음",
  total: "총 결제금액",
  priceBasis: "가격 기준",
  subtotal: "소계",
  baseSelectionPrice: "기본 선택가",
  finalAmount: "최종금액",
  noDeliveryFee: "택배비 없음",
  productAmount: "상품 합계",
} as const;

export const BATTERY_RETURN_POLICY_COPY = {
  return: "폐배터리 반납 조건 가격입니다.",
  noReturn: "폐배터리 미반납 시 전 제품 공통 25,000원이 추가됩니다.",
} as const;

export const CUSTOMER_FULFILLMENT_LABELS = {
  delivery: "택배 주문",
  onsite_install: "출장 교체",
  store_install: "매장 교체",
  store_pickup_self: "매장 수령",
} as const;

export type CustomerFulfillmentDisplayKey = keyof typeof CUSTOMER_FULFILLMENT_LABELS;

export const CUSTOMER_FULFILLMENT_DESCRIPTIONS: Record<CustomerFulfillmentDisplayKey, string> = {
  delivery: "제품 구매가 + 택배비 15,000원 · 직접 교체 가능",
  onsite_install: "출장 교체가 기준 · 방문 위치에서 교체",
  store_install: "출장 교체가 −5,000원 · 매장 방문 후 교체",
  store_pickup_self: "제품 구매가 기준 · 택배비 없음 · 매장 수령",
};

/** 수령/장착 카드 — 1줄 요약 (모바일 줄바꿈 최소화) */
export const CUSTOMER_FULFILLMENT_DESC_PRIMARY: Record<CustomerFulfillmentDisplayKey, string> = {
  delivery: "제품 구매가 + 택배비 15,000원",
  onsite_install: "출장 교체가 기준",
  store_install: "출장 교체가 −5,000원",
  store_pickup_self: "제품 구매가 기준",
};

export const CUSTOMER_FULFILLMENT_DESC_SECONDARY: Record<
  CustomerFulfillmentDisplayKey,
  string | null
> = {
  delivery: "직접 교체 가능",
  onsite_install: "방문 위치에서 교체",
  store_install: "매장 방문 후 교체 · 출장가에서 5,000원 할인",
  store_pickup_self: "택배비 없음 · 매장 수령",
};

/** 상품 상세 상단 — 기본 노출 가격 라벨 */
export const CUSTOMER_DETAIL_PRICE_LABELS = {
  productPurchase: CUSTOMER_PRICE_LABELS.productPurchase,
  mobileInstall: CUSTOMER_PRICE_LABELS.mobileInstall,
} as const;
