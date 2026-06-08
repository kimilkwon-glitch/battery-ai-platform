import {
  CUSTOMER_CENTER_HUB,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_USED_BATTERY,
  CHECKOUT_PAGE,
} from "@/lib/customer-center-routes";

export const ORDER_REQUEST_LOOKUP_COPY = {
  pageTitle: "비회원 주문조회",
  pageDescription: "주문번호와 연락처를 입력하면 주문 상태를 확인할 수 있습니다.",
  formTitle: "비회원 주문조회",
  formDescription: "주문번호와 연락처를 입력해 주세요.",
  orderNumberLabel: "주문번호",
  requestNumberPlaceholder: "BM-20260530-0001",
  phoneLabel: "연락처",
  phonePlaceholder: "010-0000-0000",
  hint: "주문번호를 모르시면 고객센터로 문의해 주세요.",
  submitLabel: "조회하기",
  loading: "주문 정보를 확인하는 중입니다.",
  notFoundTitle: "주문 내역을 찾을 수 없습니다",
  notFoundBody:
    "주문번호와 연락처를 다시 확인해 주세요. 주문번호를 모르시면 고객센터로 문의해 주세요.",
  usedBatteryNote: "폐전지 반납 여부에 따라 금액과 회수 절차가 달라질 수 있습니다.",
  nextGuideTitle: "다음 안내",
  resultStatusKicker: "주문 상태",
  orderNumberResultLabel: "주문번호",
  orderDateLabel: "주문일",
} as const;

export const ORDER_REQUEST_LOOKUP_CTAS = {
  customerHub: { label: "고객센터 문의", href: CUSTOMER_CENTER_HUB },
  photoCheck: { label: "사진 확인 먼저 하기", href: "/photo-check" },
  usedBattery: { label: "폐전지 안내 보기", href: CUSTOMER_CENTER_USED_BATTERY },
  orderGuide: { label: "주문 안내 보기", href: CUSTOMER_CENTER_ORDER_GUIDE },
  retryRequest: { label: "주문하기", href: CHECKOUT_PAGE },
  home: { label: "메인으로 이동", href: "/" },
} as const;
