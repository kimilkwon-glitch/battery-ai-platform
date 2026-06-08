import {
  CUSTOMER_FULFILLMENT_LABELS,
  CUSTOMER_PRICE_LABELS,
} from "@/lib/pricing/customer-price-labels";
import { DELIVERY_FEE, STORE_INSTALL_DISCOUNT } from "@/lib/pricing/order-price";

/** 토스 심사·주문/배송/환불 페이지 공통 가격 정책 문구 */
export const COMMERCE_PRICING_POLICY = {
  delivery: {
    label: CUSTOMER_FULFILLMENT_LABELS.delivery,
    formula: `${CUSTOMER_PRICE_LABELS.productPurchase} + ${CUSTOMER_PRICE_LABELS.deliveryFee} ${DELIVERY_FEE.toLocaleString("ko-KR")}원`,
    note: "전국 택배 발송 기준이며, 제품 구매가에 택배비가 추가됩니다.",
  },
  visitInstall: {
    label: CUSTOMER_FULFILLMENT_LABELS.onsite_install,
    formula: CUSTOMER_PRICE_LABELS.mobileInstall,
    note: "고객 위치로 방문해 교체하는 방식이며, 출장 교체가 기준으로 계산됩니다.",
  },
  storeInstall: {
    label: CUSTOMER_FULFILLMENT_LABELS.store_install,
    formula: `${CUSTOMER_PRICE_LABELS.mobileInstall} − ${STORE_INSTALL_DISCOUNT.toLocaleString("ko-KR")}원`,
    note: "매장 방문 후 교체 시 출장 교체가에서 매장 방문 할인이 적용됩니다.",
  },
  storePickupSelf: {
    label: CUSTOMER_FULFILLMENT_LABELS.store_pickup_self,
    formula: `${CUSTOMER_PRICE_LABELS.productPurchase} (${CUSTOMER_PRICE_LABELS.noDeliveryFee})`,
    note: "매장에서 배터리만 수령해 직접 교체하는 방식입니다.",
  },
} as const;

export const COMMERCE_PRICING_EXAMPLES = [
  {
    product: "로케트 GB80L",
    internet: 67_500,
    onsite: 90_000,
    delivery: 82_500,
    visit: 90_000,
    storeInstall: 85_000,
    pickup: 67_500,
  },
  {
    product: "쏠라이트 CMF80L",
    internet: 62_000,
    onsite: 85_000,
    delivery: 77_000,
    visit: 85_000,
    storeInstall: 80_000,
    pickup: 62_000,
  },
  {
    product: "로케트 AGM80L",
    internet: 119_300,
    onsite: 150_000,
    delivery: 134_300,
    visit: 150_000,
    storeInstall: 145_000,
    pickup: 119_300,
  },
] as const;
