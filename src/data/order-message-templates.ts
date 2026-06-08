/**
 * 주문 상태별 고객 안내 메시지 템플릿 (SMS / 알림톡)
 * — 실제 발송 API 미연결. 운영 문구·미리보기·3차 발송 시스템 연동용.
 */

export type MessageChannel = "sms" | "alimtalk" | "both";

/** UI 필터용 그룹 */
export type MessageTemplateFilterGroup = "주문/결제" | "배송" | "폐전지" | "교환/반품";

/** 템플릿 분류 라벨 (운영·발송 트리거 설명) */
export type MessageTemplateCategory =
  | "주문 완료"
  | "무통장 입금 대기"
  | "입금 확인"
  | "결제 완료"
  | "배송 준비중"
  | "배송 시작/운송장 안내"
  | "배송 지연 안내"
  | "배송 완료 안내"
  | "폐전지 반납 안내"
  | "폐전지 회수 신청 안내"
  | "폐전지 미반납 안내"
  | "주문 자동 취소 예정 안내"
  | "주문 자동 취소 완료 안내"
  | "불량/오배송 접수 안내"
  | "교환/반품 접수 안내";

export type MessageTemplateVariable =
  | "customerName"
  | "orderNumber"
  | "productName"
  | "batterySpec"
  | "vehicleName"
  | "paymentMethod"
  | "bankName"
  | "bankAccount"
  | "depositAmount"
  | "depositDeadline"
  | "trackingCompany"
  | "trackingNumber"
  | "trackingUrl"
  | "storePhone"
  | "returnDeadline"
  | "pickupGuideUrl"
  | "orderDetailUrl";

/** 템플릿 본문에서 사용하는 {{variable}} 키 */
export const MESSAGE_TEMPLATE_VARIABLES: {
  key: MessageTemplateVariable;
  placeholder: string;
  label: string;
}[] = [
  { key: "customerName", placeholder: "{{customerName}}", label: "고객명" },
  { key: "orderNumber", placeholder: "{{orderNumber}}", label: "주문번호" },
  { key: "productName", placeholder: "{{productName}}", label: "상품명" },
  { key: "batterySpec", placeholder: "{{batterySpec}}", label: "배터리 규격" },
  { key: "vehicleName", placeholder: "{{vehicleName}}", label: "차량명" },
  { key: "paymentMethod", placeholder: "{{paymentMethod}}", label: "결제수단" },
  { key: "bankName", placeholder: "{{bankName}}", label: "입금은행" },
  { key: "bankAccount", placeholder: "{{bankAccount}}", label: "입금계좌" },
  { key: "depositAmount", placeholder: "{{depositAmount}}", label: "입금금액" },
  { key: "depositDeadline", placeholder: "{{depositDeadline}}", label: "입금기한" },
  { key: "trackingCompany", placeholder: "{{trackingCompany}}", label: "택배사" },
  { key: "trackingNumber", placeholder: "{{trackingNumber}}", label: "운송장번호" },
  { key: "trackingUrl", placeholder: "{{trackingUrl}}", label: "배송조회 URL" },
  { key: "storePhone", placeholder: "{{storePhone}}", label: "고객센터 전화" },
  { key: "returnDeadline", placeholder: "{{returnDeadline}}", label: "폐전지 반납 기한" },
  { key: "pickupGuideUrl", placeholder: "{{pickupGuideUrl}}", label: "폐전지 회수 안내 URL" },
  { key: "orderDetailUrl", placeholder: "{{orderDetailUrl}}", label: "주문 상세 URL" },
];

export type OrderMessageTemplate = {
  id: string;
  category: MessageTemplateCategory;
  filterGroup: MessageTemplateFilterGroup;
  channel: MessageChannel;
  title: string;
  description: string;
  trigger: string;
  message: string;
  variables: MessageTemplateVariable[];
  caution?: string;
};

export const ORDER_MESSAGE_GUIDE_COPY = {
  pageTitle: "주문 후 안내 메시지",
  pageDescription:
    "주문 접수부터 배송, 폐전지 반납까지 고객님께 안내되는 주요 메시지 예시입니다.",
  disclaimer:
    "아래 문구는 주문 상태별 안내 메시지 예시입니다. 실제 발송 문구는 주문 조건, 배송 방식, 폐전지 반납 여부에 따라 일부 달라질 수 있습니다.",
  notSendingYet:
    "실제 문자·알림톡 자동 발송 기능은 준비 중입니다. 현재는 운영 문구 확인 및 수정용 템플릿입니다.",
} as const;

export const MESSAGE_TEMPLATE_FILTER_GROUPS: MessageTemplateFilterGroup[] = [
  "주문/결제",
  "배송",
  "폐전지",
  "교환/반품",
];

/** 미리보기용 샘플 값 */
export const MESSAGE_TEMPLATE_SAMPLE_VALUES: Record<MessageTemplateVariable, string> = {
  customerName: "홍길동",
  orderNumber: "BM-20260530-0012",
  productName: "로케트 AGM95L (폐전지 반납)",
  batterySpec: "AGM95L",
  vehicleName: "쏘렌토 MQ4",
  paymentMethod: "무통장 입금",
  bankName: "국민은행",
  bankAccount: "123-456-789012 (예시)",
  depositAmount: "185,000원",
  depositDeadline: "2026-06-01 14:00까지",
  trackingCompany: "CJ대한통운",
  trackingNumber: "123456789012",
  trackingUrl: "https://example.com/tracking/123456789012",
  storePhone: "051-000-0000",
  returnDeadline: "2026-06-10",
  pickupGuideUrl: "/support/used-battery-return",
  orderDetailUrl: "/mypage",
};

export const ORDER_MESSAGE_TEMPLATES: OrderMessageTemplate[] = [
  {
    id: "order-completed",
    category: "주문 완료",
    filterGroup: "주문/결제",
    channel: "both",
    title: "주문이 정상 접수되었습니다",
    description: "주문 접수 직후 고객에게 주문 요약을 안내합니다.",
    trigger: "주문 접수 완료 시",
    message: `[배터리매니저]
{{customerName}}님, 주문이 정상 접수되었습니다.

주문번호: {{orderNumber}}
상품: {{productName}}
차량/규격: {{vehicleName}} / {{batterySpec}}

주문 정보 확인 후 순차적으로 안내드리겠습니다.
주문 내역은 아래에서 확인 가능합니다.
{{orderDetailUrl}}

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "productName",
      "vehicleName",
      "batterySpec",
      "orderDetailUrl",
      "storePhone",
    ],
  },
  {
    id: "bank-transfer-waiting",
    category: "무통장 입금 대기",
    filterGroup: "주문/결제",
    channel: "both",
    title: "무통장 입금 안내",
    description: "무통장 입금 주문 시 입금 정보를 안내합니다.",
    trigger: "무통장 입금 주문 접수 직후",
    message: `[배터리매니저]
{{customerName}}님, 무통장 입금 주문이 접수되었습니다.

주문번호: {{orderNumber}}
입금금액: {{depositAmount}}
입금계좌: {{bankName}} {{bankAccount}}
입금기한: {{depositDeadline}}

주문 후 48시간 이내 미입금 시 주문이 자동 취소될 수 있습니다.
입금자명이 주문자명과 다를 경우 고객센터로 알려주세요.

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "depositAmount",
      "bankName",
      "bankAccount",
      "depositDeadline",
      "storePhone",
    ],
    caution: "48시간 자동 취소는 3차 작업에서 정책 UI·로직과 연동 예정입니다.",
  },
  {
    id: "payment-confirmed",
    category: "입금 확인",
    filterGroup: "주문/결제",
    channel: "both",
    title: "입금이 확인되었습니다",
    description: "무통장 입금 확인 후 발송합니다.",
    trigger: "입금 확인 처리 완료 시",
    message: `[배터리매니저]
{{customerName}}님, 주문번호 {{orderNumber}} 입금이 확인되었습니다.

상품: {{productName}}
배터리 규격: {{batterySpec}}

이제 상품 준비 후 배송/수령 안내를 순차적으로 도와드리겠습니다.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "productName", "batterySpec", "storePhone"],
  },
  {
    id: "payment-completed",
    category: "결제 완료",
    filterGroup: "주문/결제",
    channel: "both",
    title: "결제가 완료되었습니다",
    description: "카드·간편결제 등 즉시 결제 완료 시 안내합니다.",
    trigger: "결제 승인 완료 시",
    message: `[배터리매니저]
{{customerName}}님, 주문번호 {{orderNumber}} 결제가 완료되었습니다.

결제수단: {{paymentMethod}}
상품: {{productName}}
배터리 규격: {{batterySpec}}

상품 준비 후 배송 안내를 순차적으로 도와드리겠습니다.
주문 내역: {{orderDetailUrl}}

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "paymentMethod",
      "productName",
      "batterySpec",
      "orderDetailUrl",
      "storePhone",
    ],
  },
  {
    id: "shipping-preparing",
    category: "배송 준비중",
    filterGroup: "배송",
    channel: "alimtalk",
    title: "상품 준비 중입니다",
    description: "출고 전 상품 포장·검수 단계 안내입니다.",
    trigger: "입금/결제 확인 후 출고 대기 시 (선택 발송)",
    message: `[배터리매니저]
{{customerName}}님, 주문번호 {{orderNumber}} 상품을 준비하고 있습니다.

상품: {{productName}}
배터리 규격: {{batterySpec}}

발송이 시작되면 운송장 번호를 다시 안내드리겠습니다.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "productName", "batterySpec", "storePhone"],
  },
  {
    id: "shipping-started",
    category: "배송 시작/운송장 안내",
    filterGroup: "배송",
    channel: "both",
    title: "상품이 발송되었습니다",
    description: "택배 발송 및 운송장 정보를 안내합니다.",
    trigger: "운송장 등록·출고 처리 시",
    message: `[배터리매니저]
{{customerName}}님, 주문하신 상품이 발송되었습니다.

주문번호: {{orderNumber}}
택배사: {{trackingCompany}}
운송장번호: {{trackingNumber}}
배송조회: {{trackingUrl}}

운송장 등록 후 택배사 집하/스캔 상황에 따라 조회 반영이 늦어질 수 있습니다.

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "trackingCompany",
      "trackingNumber",
      "trackingUrl",
      "storePhone",
    ],
  },
  {
    id: "shipping-delayed",
    category: "배송 지연 안내",
    filterGroup: "배송",
    channel: "both",
    title: "배송 조회 반영 지연 안내",
    description: "운송장 등록 후 이동 내역이 없을 때 안내합니다.",
    trigger: "배송중 상태에서 일정 시간 스캔 미반영 시 (수동·자동 선택)",
    message: `[배터리매니저]
{{customerName}}님, 주문번호 {{orderNumber}} 배송 정보 안내입니다.

현재 택배사 집하 또는 물류 이동 과정에서 배송 정보 반영이 지연될 수 있습니다.

운송장번호: {{trackingNumber}}
배송조회: {{trackingUrl}}

일정 시간 이후에도 이동 내역이 없으면 고객센터로 문의해 주세요.
확인 후 안내드리겠습니다.

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "trackingNumber",
      "trackingUrl",
      "storePhone",
    ],
  },
  {
    id: "shipping-completed",
    category: "배송 완료 안내",
    filterGroup: "배송",
    channel: "both",
    title: "배송 완료 안내",
    description: "택배 배송 완료 처리 시 안내합니다.",
    trigger: "택배사 배송완료 스캔 반영 시",
    message: `[배터리매니저]
{{customerName}}님, 주문하신 상품이 배송 완료로 확인됩니다.

주문번호: {{orderNumber}}
상품: {{productName}}

수령하지 못하셨다면 문 앞, 경비실, 택배 보관장소, 대리수령 여부를 먼저 확인해 주세요.
확인 후에도 수령하지 못한 경우 고객센터로 문의해 주세요.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "productName", "storePhone"],
  },
  {
    id: "used-battery-return-guide",
    category: "폐전지 반납 안내",
    filterGroup: "폐전지",
    channel: "both",
    title: "폐전지 반납 안내",
    description: "반납 조건 주문·수령 후 기존 배터리 회수 안내입니다.",
    trigger: "반납 조건 주문 + 배송 완료 또는 수령 확인 후",
    message: `[배터리매니저]
{{customerName}}님, 폐전지 반납 조건 주문 안내입니다.

주문번호: {{orderNumber}}
폐전지 반납 조건으로 주문하신 경우 기존 배터리 회수가 필요합니다.

새 배터리 수령 후 기존 배터리를 안전하게 포장해 주세요.
회수 신청 및 포장 방법은 아래 안내를 확인해 주세요.

폐전지 회수 안내: {{pickupGuideUrl}}

반납이 진행되지 않을 경우 추가 비용이 발생할 수 있습니다.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "pickupGuideUrl", "storePhone"],
    caution: "미반납 시 추가 비용은 주문 조건·운영 정책에 따라 안내됩니다.",
  },
  {
    id: "used-battery-pickup-request",
    category: "폐전지 회수 신청 안내",
    filterGroup: "폐전지",
    channel: "both",
    title: "폐전지 회수 신청 안내",
    description: "회수 신청 절차·포장·기한을 안내합니다.",
    trigger: "회수 신청 가능 상태 또는 고객 신청 요청 시",
    message: `[배터리매니저]
{{customerName}}님, 폐전지 회수 신청을 진행해 주세요.

주문번호: {{orderNumber}}
반납 기한: {{returnDeadline}}

기존 배터리는 누액이 생기지 않도록 세워서 포장해 주세요.
회수 신청 후 택배 기사 방문 시 전달해 주시면 됩니다.

자세한 안내: {{pickupGuideUrl}}

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "returnDeadline",
      "pickupGuideUrl",
      "storePhone",
    ],
  },
  {
    id: "used-battery-not-returned",
    category: "폐전지 미반납 안내",
    filterGroup: "폐전지",
    channel: "both",
    title: "폐전지 반납 확인 안내",
    description: "반납 기한 내 미반납 확인 시 안내합니다.",
    trigger: "반납 기한 임박 또는 미반납 확인 시",
    message: `[배터리매니저]
{{customerName}}님, 폐전지 반납 확인 안내입니다.

주문번호: {{orderNumber}}
반납 기한: {{returnDeadline}}

폐전지 반납 조건 주문 건의 반납 확인이 아직 완료되지 않았습니다.

이미 발송하셨다면 회수 송장 또는 접수 정보를 고객센터로 알려주세요.
기한 내 반납이 어려운 경우 추가 비용이 발생할 수 있습니다.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "returnDeadline", "storePhone"],
    caution: "추가 비용은 별도 안내드립니다.",
  },
  {
    id: "order-cancel-scheduled",
    category: "주문 자동 취소 예정 안내",
    filterGroup: "주문/결제",
    channel: "both",
    title: "입금 기한 안내",
    description: "입금 기한 임박 시 리마인더입니다.",
    trigger: "입금 기한 24시간 전 등 (3차 정책 연동 예정)",
    message: `[배터리매니저]
{{customerName}}님, 무통장 입금 주문의 입금 기한이 가까워지고 있습니다.

주문번호: {{orderNumber}}
입금금액: {{depositAmount}}
입금기한: {{depositDeadline}}

기한 내 미입금 시 주문이 자동 취소될 수 있습니다.
입금 완료 후 확인이 필요하면 고객센터로 문의해 주세요.

문의: {{storePhone}}`,
    variables: [
      "customerName",
      "orderNumber",
      "depositAmount",
      "depositDeadline",
      "storePhone",
    ],
    caution: "자동 발송 시점은 3차 무통장 정책 UI와 함께 확정합니다.",
  },
  {
    id: "order-cancel-completed",
    category: "주문 자동 취소 완료 안내",
    filterGroup: "주문/결제",
    channel: "both",
    title: "주문이 자동 취소되었습니다",
    description: "48시간 미입금 등으로 자동 취소 처리 시 안내합니다.",
    trigger: "입금 기한 만료 후 자동 취소 처리 시 (3차 로직 연동 예정)",
    message: `[배터리매니저]
{{customerName}}님, 주문번호 {{orderNumber}} 건은 입금 기한 내 입금 확인이 되지 않아 자동 취소되었습니다.

다시 주문을 원하시면 상품을 재확인 후 새로 주문해 주세요.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "storePhone"],
  },
  {
    id: "defect-wrong-item",
    category: "불량/오배송 접수 안내",
    filterGroup: "교환/반품",
    channel: "both",
    title: "불량/오배송 접수 안내",
    description: "사진·라벨 확인 전 임의 장착·발송 방지 안내입니다.",
    trigger: "불량/오배송 문의 접수 또는 고객 요청 시",
    message: `[배터리매니저]
{{customerName}}님, 불량 또는 오배송 접수 안내입니다.

주문번호: {{orderNumber}}

아래 자료를 먼저 준비해 주세요.
· 상품 전체 사진
· 배터리 라벨 사진
· 단자 방향 확인 사진
· 포장 상태 사진

제품을 임의로 장착하거나 발송하기 전 고객센터로 먼저 문의해 주세요.
확인 후 교환/반품 절차를 안내드리겠습니다.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "storePhone"],
  },
  {
    id: "return-exchange-received",
    category: "교환/반품 접수 안내",
    filterGroup: "교환/반품",
    channel: "both",
    title: "교환/반품 접수 안내",
    description: "접수 후 상태 확인·회수 절차 안내입니다.",
    trigger: "교환/반품 접수 완료 시",
    message: `[배터리매니저]
{{customerName}}님, 교환/반품 접수 안내입니다.

주문번호: {{orderNumber}}

교환/반품은 제품 상태 확인 후 안내됩니다.
배터리는 제품 특성상 개봉, 장착, 사용 흔적, 폐전지 반납 여부에 따라 처리 방식이 달라질 수 있습니다.
임의 발송 전 고객센터로 먼저 문의해 주세요.

문의: {{storePhone}}`,
    variables: ["customerName", "orderNumber", "storePhone"],
  },
];

/** 발송 시스템 연동용: id로 템플릿 조회 */
export function getOrderMessageTemplateById(id: string): OrderMessageTemplate | undefined {
  return ORDER_MESSAGE_TEMPLATES.find((t) => t.id === id);
}

/** {{key}} → 샘플 또는 실제 값 치환 */
export function renderOrderMessagePreview(
  message: string,
  values: Partial<Record<MessageTemplateVariable, string>> = MESSAGE_TEMPLATE_SAMPLE_VALUES,
): string {
  let out = message;
  for (const { key, placeholder } of MESSAGE_TEMPLATE_VARIABLES) {
    const val = values[key] ?? placeholder;
    out = out.split(placeholder).join(val);
  }
  return out;
}

export function getTemplatesByFilterGroup(
  group: MessageTemplateFilterGroup | "전체",
): OrderMessageTemplate[] {
  if (group === "전체") return ORDER_MESSAGE_TEMPLATES;
  return ORDER_MESSAGE_TEMPLATES.filter((t) => t.filterGroup === group);
}

/** URL ?group= 또는 #group-배송 형태 */
export function parseMessageGuideFilter(
  groupParam: string | null,
): MessageTemplateFilterGroup | "전체" {
  const allowed = MESSAGE_TEMPLATE_FILTER_GROUPS as readonly string[];
  if (groupParam && allowed.includes(groupParam)) {
    return groupParam as MessageTemplateFilterGroup;
  }
  return "전체";
}
