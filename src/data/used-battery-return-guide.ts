import {
  CUSTOMER_CENTER_FAQ,
  CUSTOMER_CENTER_HUB,
  CUSTOMER_CENTER_MESSAGE_GUIDE,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_USED_BATTERY,
} from "@/lib/customer-center-routes";

export const USED_BATTERY_GUIDE_COPY = {
  title: "폐전지 반납 안내",
  description:
    "배터리 주문 시 폐전지 반납 여부에 따라 상품 금액과 회수 절차가 달라질 수 있습니다. 반납 조건 상품을 선택하신 경우, 새 배터리 수령 후 기존 배터리 회수가 필요합니다.",
  disclaimer:
    "실제 택배 회수 신청·자동 추가금 청구 기능은 준비 중입니다. 아래는 운영 안내 및 고객 확인용 절차입니다.",
} as const;

export type UsedBatteryOptionCard = {
  id: "return-condition" | "no-return" | "pickup-guide";
  title: string;
  bullets: string[];
  tone: "blue" | "slate" | "emerald";
};

export const USED_BATTERY_OPTION_CARDS: UsedBatteryOptionCard[] = [
  {
    id: "return-condition",
    title: "반납 조건 상품",
    tone: "blue",
    bullets: [
      "기존 배터리를 반납하는 조건의 상품입니다.",
      "새 배터리 수령 후 기존 배터리를 포장해 회수 절차에 따라 반납해 주세요.",
      "반납이 확인되지 않으면 추가 비용이 발생할 수 있습니다.",
    ],
  },
  {
    id: "no-return",
    title: "미반납 상품",
    tone: "slate",
    bullets: [
      "폐전지를 반납하지 않는 조건의 상품입니다.",
      "기존 배터리를 직접 보관하거나 별도로 처리하시는 경우 선택합니다.",
      "반납 조건 상품과 금액이 다를 수 있습니다.",
    ],
  },
  {
    id: "pickup-guide",
    title: "회수 신청 안내",
    tone: "emerald",
    bullets: [
      "새 배터리를 받은 뒤 기존 배터리를 안전하게 포장해 주세요.",
      "회수 신청 또는 상담 안내에 따라 택배 회수를 진행합니다.",
      "자세한 회수 방법은 주문 후 안내 메시지 또는 고객센터 안내를 확인해 주세요.",
    ],
  },
];

export const USED_BATTERY_PRICE_DIFFERENCE = {
  title: "폐전지 반납과 미반납 금액이 다른 이유",
  body: [
    "자동차 배터리는 기존 폐전지 회수 여부에 따라 판매 조건이 달라질 수 있습니다.",
    "폐전지를 반납하는 조건의 상품은 회수를 전제로 한 금액이며, 폐전지를 반납하지 않는 경우에는 미반납 조건의 금액이 적용될 수 있습니다.",
  ],
  emphasis: "주문 전 반드시 폐전지 반납 여부를 확인해 주세요.",
  caution:
    "폐전지 반납 조건으로 주문한 뒤 반납이 진행되지 않으면 추가 비용이 발생할 수 있습니다.",
} as const;

export type UsedBatteryReturnStep = {
  step: number;
  title: string;
  body: string;
};

export const USED_BATTERY_RETURN_STEPS: UsedBatteryReturnStep[] = [
  {
    step: 1,
    title: "새 배터리 수령",
    body: "주문한 새 배터리를 먼저 수령합니다.",
  },
  {
    step: 2,
    title: "기존 배터리 탈거",
    body: "차량에 장착되어 있던 기존 배터리를 분리합니다. 직접 교체가 어렵다면 전문가 상담 또는 장착 서비스를 이용해 주세요.",
  },
  {
    step: 3,
    title: "폐전지 포장",
    body: "기존 배터리는 눕히지 말고 세운 상태로 포장해 주세요. 단자 부분이 다른 금속과 닿지 않도록 주의해 주세요. 누액이나 파손이 있다면 고객센터로 먼저 문의해 주세요.",
  },
  {
    step: 4,
    title: "회수 신청",
    body: "안내된 방법에 따라 회수 신청을 진행합니다. 택배 기사 방문 시 포장된 폐전지를 전달해 주세요.",
  },
  {
    step: 5,
    title: "반납 확인",
    body: "회수 완료 후 반납 확인이 진행됩니다. 반납 확인 전까지는 주문 조건에 따라 추가 안내가 있을 수 있습니다.",
  },
];

export const USED_BATTERY_PACKING_NOTICE = {
  title: "폐전지 포장 시 주의사항",
  items: [
    "배터리는 반드시 세워서 보관/포장해 주세요.",
    "배터리를 눕히거나 거꾸로 뒤집지 마세요.",
    "단자 부분이 금속과 닿지 않게 주의해 주세요.",
    "외부 충격을 줄일 수 있도록 박스 안에서 흔들리지 않게 포장해 주세요.",
    "누액, 파손, 부풀음이 있는 경우 임의 발송하지 말고 고객센터로 먼저 문의해 주세요.",
    "폐전지는 일반 쓰레기로 버리면 안 됩니다.",
  ],
} as const;

export const USED_BATTERY_NOT_RETURNED = {
  title: "폐전지를 반납하지 못하는 경우",
  body: [
    "폐전지 반납이 어려운 경우에는 미반납 조건 상품을 선택해 주세요.",
    "이미 반납 조건으로 주문하셨다면 고객센터로 문의해 처리 방법을 확인해 주세요.",
  ],
  caution:
    "반납 조건 주문 후 폐전지 반납이 진행되지 않으면 추가 비용이 발생할 수 있습니다.",
} as const;

export const USED_BATTERY_ORDER_PRECHECK = {
  title: "폐전지 반납 여부 확인",
  intro:
    "배터리 상품은 폐전지 반납 여부에 따라 금액과 주문 조건이 달라질 수 있습니다. 주문 전 반납 가능 여부를 꼭 확인해 주세요.",
  checklist: [
    "기존 배터리를 반납할 수 있나요?",
    "직접 교체 후 폐전지를 포장할 수 있나요?",
    "회수 신청 절차를 진행할 수 있나요?",
    "반납이 어렵다면 미반납 상품을 선택했나요?",
  ],
} as const;

/** 2차 메시지 템플릿 — 발송 미연결 */
export const USED_BATTERY_MESSAGE_TEMPLATE_IDS = [
  "used-battery-return-guide",
  "used-battery-pickup-request",
  "used-battery-not-returned",
] as const;

export const USED_BATTERY_MESSAGE_LINKS: {
  templateId: (typeof USED_BATTERY_MESSAGE_TEMPLATE_IDS)[number];
  label: string;
}[] = [
  { templateId: "used-battery-return-guide", label: "폐전지 반납 안내" },
  { templateId: "used-battery-pickup-request", label: "폐전지 회수 신청 안내" },
  { templateId: "used-battery-not-returned", label: "폐전지 미반납 안내" },
];

export function messageGuideUrlForUsedBatteryTemplate(templateId: string): string {
  return `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=폐전지#${templateId}`;
}

export const USED_BATTERY_GUIDE_LINKS = {
  hub: CUSTOMER_CENTER_HUB,
  fullGuide: CUSTOMER_CENTER_USED_BATTERY,
  orderGuide: `${CUSTOMER_CENTER_ORDER_GUIDE}#used-battery-precheck`,
  orderChecklist: "/order-checklist",
  faq: `${CUSTOMER_CENTER_FAQ}`,
  messageGuide: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=폐전지`,
} as const;
