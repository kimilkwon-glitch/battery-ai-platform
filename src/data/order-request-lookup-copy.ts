import {
  CUSTOMER_CENTER_HUB,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_USED_BATTERY,
  CHECKOUT_PAGE,
} from "@/lib/customer-center-routes";

export const ORDER_REQUEST_LOOKUP_COPY = {
  pageTitle: "상담 주문 요청 조회",
  pageDescription:
    "상담 주문 요청 접수번호와 연락처를 입력하면 접수 상태를 확인할 수 있습니다. 실제 결제 주문 조회가 아니라 배터리 상담 주문 요청 조회입니다.",
  notPaymentNotice:
    "이 화면은 결제·배송 주문조회가 아닙니다. 상담 접수 상태와 안내 진행 상황을 확인하는 기능입니다.",
  requestNumberPlaceholder: "BM-20260530-0001",
  phonePlaceholder: "010-0000-0000",
  hint: "접수번호는 상담 주문 요청 완료 화면에서 확인할 수 있습니다. 접수번호를 잊으신 경우 고객센터로 문의해 주세요.",
  submitLabel: "조회하기",
  loading: "접수 정보를 확인하는 중입니다.",
  notFoundTitle: "접수 내역을 찾을 수 없습니다",
  notFoundBody:
    "접수번호와 연락처를 다시 확인해 주세요. 접수번호를 잊으셨거나 조회가 되지 않는 경우 고객센터로 문의해 주세요.",
  usedBatteryNote:
    "폐전지 반납 여부에 따라 금액과 회수 절차가 달라질 수 있습니다.",
  nextGuideTitle: "다음 안내",
} as const;

export const ORDER_REQUEST_LOOKUP_CTAS = {
  customerHub: { label: "고객센터 문의", href: CUSTOMER_CENTER_HUB },
  photoCheck: { label: "사진 확인 먼저 하기", href: "/photo-check" },
  usedBattery: { label: "폐전지 안내 보기", href: CUSTOMER_CENTER_USED_BATTERY },
  orderGuide: { label: "주문 안내 보기", href: CUSTOMER_CENTER_ORDER_GUIDE },
  retryRequest: { label: "상담 주문 요청 다시 하기", href: CHECKOUT_PAGE },
  home: { label: "메인으로 이동", href: "/" },
} as const;
