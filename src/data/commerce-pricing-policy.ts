import { DELIVERY_FEE, STORE_INSTALL_DISCOUNT } from "@/lib/pricing/order-price";

/** 토스 심사·주문/배송/환불 페이지 공통 가격 정책 문구 */
export const COMMERCE_PRICING_POLICY = {
  delivery: {
    label: "택배 발송",
    formula: `상품 인터넷가 + 택배비 ${DELIVERY_FEE.toLocaleString("ko-KR")}원`,
    note: "전국 택배 발송 기준이며, 상품별 인터넷가에 택배비가 추가됩니다.",
  },
  visitInstall: {
    label: "출장교체",
    formula: "출장가",
    note: "고객 위치로 방문해 교체하는 방식이며, 출장가 기준으로 계산됩니다.",
  },
  storeInstall: {
    label: "내방교체",
    formula: `출장가 − ${STORE_INSTALL_DISCOUNT.toLocaleString("ko-KR")}원`,
    note: "매장 방문 후 교체 시 출장가에서 내방교체 차감액이 적용됩니다.",
  },
  storePickupSelf: {
    label: "내방수령 / 셀프교체",
    formula: "상품 인터넷가 (택배비 없음)",
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
