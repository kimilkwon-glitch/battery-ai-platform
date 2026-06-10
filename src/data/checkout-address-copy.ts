import type { FulfillmentMethod } from "@/types/cart";

export const CHECKOUT_ADDRESS_PURPOSE = {
  delivery: {
    title: "택배 배송지 입력",
    description: "택배 배송지를 입력하면 결제 직전 확인 화면으로 이동합니다.",
    searchLabel: "배송지 검색하기",
    searchDialogTitle: "배송지 검색",
    readonlyHint: "아래 검색 버튼을 눌러 우편번호와 기본주소를 입력할 수 있습니다.",
  },
  visit_install: {
    title: "출장 교체 주소 입력",
    description: "출장 교체 주소를 입력하면 방문 가능 여부 확인 후 결제 단계로 이동합니다.",
    searchLabel: "출장 주소 검색하기",
    searchDialogTitle: "출장 주소 검색",
    readonlyHint: "아래 검색 버튼을 눌러 우편번호와 기본주소를 입력할 수 있습니다.",
  },
  store_pickup_self: {
    title: "매장 수령 지점 선택",
    description: "수령 매장을 선택하면 배송지 입력 없이 주문 내용 확인 단계로 이동합니다.",
  },
  store_install: {
    title: "매장 교체 지점 선택",
    description: "교체 매장을 선택하면 배송지 입력 없이 주문 내용 확인 단계로 이동합니다.",
  },
} as const;

export function checkoutSubmitLabel(
  method: FulfillmentMethod | "undecided",
  paymentLive: boolean,
): string {
  if (!paymentLive) return "금액 확인";
  if (method === "delivery" || method === "visit_install") {
    return "결제 전 확인으로 이동";
  }
  if (method === "store_pickup_self" || method === "store_install") {
    return "주문 내용 확인하기";
  }
  return "주문 확인 및 결제";
}
