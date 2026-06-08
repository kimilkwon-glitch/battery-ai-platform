export const ORDER_REQUEST_PAGE_COPY = {
  title: "상담 주문 요청",
  description:
    "장바구니에 담긴 배터리와 차량 정보를 기준으로 상담 요청을 남겨주세요. 확인 후 규격·주문 조건을 안내드립니다.",
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
  body: "접수 내용을 확인한 뒤 배터리 규격과 주문 조건을 안내드릴 수 있습니다.",
  paymentNotice:
    "실제 결제가 완료된 주문이 아닙니다. 담당자 확인 후 주문/결제 방법을 별도로 안내드립니다.",
  staffSummaryTitle: "직원 확인용 요약",
} as const;

export const ORDER_REQUEST_VEHICLE_COPY = {
  sectionTitle: "차량 정보 확인",
  hint: "차량 정보를 입력하면 배터리 확인에 도움이 됩니다. 모르시면 비워두셔도 됩니다.",
} as const;

/** 주문·상담 요청 — 차량정보·현장 공구 안내 (차분한 톤) */
export const ORDER_REQUEST_VEHICLE_GUIDANCE_COPY = {
  line1: "차량명·연식·연료 정보를 남겨주시면 규격 확인이 더 정확해집니다.",
  line2: "차량정보가 미기재된 경우, 현장 교체 공구나 안내가 제한될 수 있습니다.",
} as const;

export const ORDER_REQUEST_USED_BATTERY_COPY = {
  sectionTitle: "폐배터리 반납 여부",
  hint: "폐배터리 반납 여부를 선택해 주세요.",
  options: [
    { value: "return" as const, label: "반납" },
    { value: "no_return" as const, label: "미반납" },
  ],
};

export const ORDER_REQUEST_FULFILLMENT_COPY = {
  sectionTitle: "수령/장착 방식",
  sectionHint: "선택한 방식에 따라 결제 예정금액이 달라집니다.",
  visitHint: "출장 주소 또는 지역을 입력해 주세요.",
  visitAvailabilityNote: "출장 일정은 상담 후 확정됩니다.",
  methods: [
    { value: "delivery" as const, label: "택배 주문" },
    { value: "visit_install" as const, label: "출장 교체" },
    { value: "store_install" as const, label: "매장 교체" },
    { value: "store_pickup_self" as const, label: "매장 수령" },
  ],
  stores: [
    { value: "deokcheon" as const, label: "덕천점" },
    { value: "hakjang" as const, label: "학장점" },
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
    label: "반납 여부 등 주문 조건은 상담 시 안내드립니다.",
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
