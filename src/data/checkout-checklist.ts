import {
  CUSTOMER_CENTER_ORDER_GUIDE_BANK_TRANSFER,
  CUSTOMER_CENTER_USED_BATTERY,
} from "@/lib/customer-center-routes";

export type CheckoutChecklistItem = {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  relatedLink?: string;
};

export const CHECKOUT_PAGE_COPY = {
  title: "주문 전 최종 확인",
  description:
    "배터리는 차량 규격과 단자 방향, 폐전지 반납 여부에 따라 주문 조건이 달라질 수 있습니다. 결제 전 아래 내용을 한 번 더 확인해 주세요.",
  needsReviewTitle: "주문 전 확인이 필요한 항목이 있습니다.",
  needsReviewBody:
    "배터리는 차량 규격과 단자 방향이 맞지 않으면 장착이 어려울 수 있습니다. 확인이 필요한 경우 사진 확인 또는 고객센터 상담 후 주문해 주세요.",
  proceedBlockedHint: "아래 체크리스트를 모두 확인해 주시면 주문 진행 버튼이 활성화됩니다.",
  orderPrepModalTitle: "주문 기능 준비 중",
  orderPrepModalBody:
    "현재 주문 기능은 준비 중입니다. 상품 확인 후 고객센터 상담 또는 기존 주문 채널을 이용해 주세요.",
  consultCtaLabel: "상담 후 주문하기",
  proceedCtaLabel: "주문 진행하기",
} as const;

export const CHECKOUT_USED_BATTERY_NOTICES = {
  return: {
    title: "폐전지 반납 조건 포함",
    body: "폐전지 반납 조건 상품이 포함되어 있습니다. 새 배터리 수령 후 기존 배터리 회수가 필요하며, 반납이 진행되지 않으면 추가 비용이 발생할 수 있습니다.",
    href: CUSTOMER_CENTER_USED_BATTERY,
    linkLabel: "폐전지 반납 안내 보기",
  },
  noReturn: {
    title: "폐전지 미반납 조건 포함",
    body: "폐전지 미반납 조건 상품이 포함되어 있습니다. 폐전지 회수 없이 주문하는 조건이며, 반납 조건 상품과 금액이 다를 수 있습니다.",
    href: CUSTOMER_CENTER_USED_BATTERY,
    linkLabel: "폐전지 반납·미반납 안내 보기",
  },
} as const;

export const CHECKOUT_CHECKLIST_ITEMS: CheckoutChecklistItem[] = [
  {
    id: "vehicle",
    label: "차량명과 연식을 확인했습니다.",
    required: true,
  },
  {
    id: "spec",
    label: "배터리 규격을 확인했습니다.",
    required: true,
  },
  {
    id: "terminal",
    label: "단자 방향 L/R을 확인했습니다.",
    required: true,
  },
  {
    id: "used-battery",
    label: "폐전지 반납 또는 미반납 조건을 확인했습니다.",
    description: "반납 조건은 회수 절차가 필요합니다.",
    required: true,
    relatedLink: CUSTOMER_CENTER_USED_BATTERY,
  },
  {
    id: "fulfillment",
    label: "수령/설치 방식을 확인했습니다.",
    required: true,
  },
  {
    id: "shipping",
    label: "배송지와 연락처를 정확히 입력할 예정입니다.",
    required: true,
  },
  {
    id: "bank-transfer",
    label: "무통장 입금 선택 시 48시간 이내 입금이 필요함을 확인했습니다.",
    description: "입금자명이 주문자명과 다르면 확인이 지연될 수 있습니다.",
    required: true,
    relatedLink: CUSTOMER_CENTER_ORDER_GUIDE_BANK_TRANSFER,
  },
];
