import { CUSTOMER_CENTER_USED_BATTERY } from "@/lib/customer-center-routes";

export const ORDER_REQUEST_PAGE_COPY = {
  title: "상담 주문 요청",
  description:
    "장바구니에 담긴 배터리와 차량 정보를 기준으로 상담 요청을 남겨주세요. 확인 후 배터리 규격, 폐전지 반납 여부, 수령 방식을 안내드릴 수 있습니다.",
  integrationNotice:
    "접수 내용은 서버에 저장됩니다. 결제·문자 발송은 담당자 확인 후 별도 안내됩니다. (운영 DB 전환 전 개발용 저장소 사용)",
  submitLabel: "접수하기",
} as const;

export const ORDER_REQUEST_EMPTY_COPY = {
  title: "요청할 상품이 없습니다",
  body: "상담 주문 요청을 위해 먼저 차량 또는 배터리 규격을 확인하고 상품을 장바구니에 담아주세요.",
} as const;

export const ORDER_REQUEST_COMPLETE_COPY = {
  title: "상담 주문 요청이 접수되었습니다",
  body: "접수 내용을 확인한 뒤 배터리 규격, 폐전지 반납 여부, 수령 방식 등을 안내드릴 수 있습니다.",
  paymentNotice:
    "실제 결제가 완료된 주문이 아닙니다. 담당자 확인 후 주문/결제 방법을 별도로 안내드립니다.",
  staffSummaryTitle: "직원 확인용 요약",
} as const;

export const ORDER_REQUEST_VEHICLE_COPY = {
  sectionTitle: "차량 정보 확인",
  hint: "차량 정보가 정확할수록 배터리 규격과 단자 방향 확인이 빨라집니다. 정확하지 않다면 사진 확인을 먼저 진행해 주세요.",
} as const;

export const ORDER_REQUEST_USED_BATTERY_COPY = {
  sectionTitle: "폐전지 반납 여부",
  hint: "폐전지 반납 여부에 따라 상품 금액과 회수 절차가 달라질 수 있습니다. 반납 조건 주문 후 반납이 진행되지 않으면 추가 비용이 발생할 수 있습니다.",
  linkLabel: "폐전지 반납 안내 보기",
  href: CUSTOMER_CENTER_USED_BATTERY,
  options: [
    { value: "return" as const, label: "폐전지 반납 예정" },
    { value: "no_return" as const, label: "폐전지 미반납" },
    { value: "unknown" as const, label: "아직 모르겠음" },
  ],
};

export const ORDER_REQUEST_FULFILLMENT_COPY = {
  sectionTitle: "수령·설치 방식",
  visitHint:
    "출장 교체는 지역, 일정, 차량 상태에 따라 가능 여부가 달라질 수 있습니다. 상담 후 가능한 일정과 조건을 안내드립니다.",
  visitAvailabilityNote: "출장 가능 여부는 상담 후 안내됩니다.",
  methods: [
    { value: "delivery" as const, label: "택배 수령" },
    { value: "store_pickup" as const, label: "매장 방문 수령" },
    { value: "visit_install" as const, label: "출장 교체 상담" },
    { value: "undecided" as const, label: "아직 결정하지 않음" },
  ],
  stores: [
    { value: "deokcheon" as const, label: "덕천점" },
    { value: "hakjang" as const, label: "학장점" },
    { value: "undecided" as const, label: "아직 미정" },
  ],
};

export const ORDER_REQUEST_CONFIRMATION_ITEMS = [
  {
    id: "fitmentNeedsFinalCheck" as const,
    label:
      "차량 정보와 배터리 규격은 상담 과정에서 최종 확인이 필요할 수 있습니다.",
  },
  {
    id: "usedBatteryPriceMayDiffer" as const,
    label: "폐전지 반납 여부에 따라 금액이 달라질 수 있음을 확인했습니다.",
  },
  {
    id: "bankTransferDeadlineAware" as const,
    label: "무통장 입금 선택 시 48시간 이내 입금이 필요할 수 있음을 확인했습니다.",
  },
  {
    id: "orderWillBeGuidedSeparately" as const,
    label: "상담 요청 후 실제 주문/결제는 별도 안내에 따라 진행됩니다.",
  },
] as const;

export const ORDER_REQUEST_MEMO_PLACEHOLDER =
  "예: 2021년식 쏘렌토 MQ4 하이브리드입니다. 시동이 조금 늦게 걸리고, 폐전지는 반납 예정입니다.";
