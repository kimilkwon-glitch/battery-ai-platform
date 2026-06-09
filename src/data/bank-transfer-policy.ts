import {
  CUSTOMER_CENTER_HUB,
  CUSTOMER_CENTER_MESSAGE_GUIDE,
  CUSTOMER_CENTER_ORDER_GUIDE,
} from "@/lib/customer-center-routes";

/** 실제 주문 연동 전 UI·문구 단일 소스 */
export type BankTransferPolicy = {
  id: string;
  title: string;
  deadlineHours: number;
  summary: string;
  notices: string[];
  cancellationRule: string;
  customerGuide: string;
  caution: string[];
};

export type BankTransferPaymentStatus =
  | "awaiting_deposit"
  | "deposit_confirmed"
  | "cancel_scheduled"
  | "cancelled";

export const BANK_TRANSFER_POLICY: BankTransferPolicy = {
  id: "bank-transfer-48h",
  title: "무통장 입금 안내",
  deadlineHours: 48,
  summary:
    "무통장 입금 주문은 주문 완료 후 48시간 이내 입금이 필요합니다. 기한 내 입금 확인이 되지 않으면 주문이 자동 취소될 수 있습니다.",
  notices: [
    "무통장 입금 주문은 주문 완료 후 48시간 이내 입금이 필요합니다.",
    "48시간 이내 입금 확인이 되지 않으면 주문이 자동 취소될 수 있습니다.",
    "입금자명이 주문자명과 다를 경우 입금 확인이 지연될 수 있으므로 고객센터로 알려주세요.",
    "자동 취소 후 다시 구매를 원하시면 상품을 재주문해 주세요.",
    "배송은 입금 확인 후 순차적으로 준비됩니다.",
  ],
  cancellationRule:
    "주문 후 48시간 이내 입금 확인이 되지 않으면 주문이 자동 취소될 수 있습니다.",
  customerGuide:
    "입금 전 주문번호·입금금액·입금자명을 확인하고, 기한 내 입금해 주세요. 입금 확인 후 배송 준비 안내가 이어집니다.",
  caution: [
    "입금자명이 주문자명과 다를 경우 확인이 지연될 수 있습니다.",
    "입금 확인은 순차 처리되며, 확인까지 시간이 걸릴 수 있습니다.",
  ],
};

export const BANK_TRANSFER_DEADLINE_LABEL = "주문 후 48시간 이내 입금 필요";

export const BANK_TRANSFER_CHECKLIST: { step: number; title: string; body: string }[] = [
  { step: 1, title: "주문번호 확인", body: "주문 완료 화면·문자 안내의 주문번호를 확인합니다." },
  { step: 2, title: "입금금액 확인", body: "안내된 입금금액과 동일하게 입금합니다." },
  { step: 3, title: "입금자명 확인", body: "가능하면 주문자명과 동일하게 입금합니다." },
  { step: 4, title: "48시간 이내 입금", body: "주문 후 48시간 이내 입금해 주세요." },
];

/** 2차 메시지 템플릿 id — 발송 미연결, 미리보기 링크용 */
export const BANK_TRANSFER_MESSAGE_TEMPLATE_IDS = [
  "bank-transfer-waiting",
  "payment-confirmed",
  "order-cancel-scheduled",
  "order-cancel-completed",
] as const;

export const BANK_TRANSFER_MESSAGE_LINKS: {
  templateId: (typeof BANK_TRANSFER_MESSAGE_TEMPLATE_IDS)[number];
  label: string;
}[] = [
  { templateId: "bank-transfer-waiting", label: "무통장 입금 대기 안내" },
  { templateId: "payment-confirmed", label: "입금 확인 안내" },
  { templateId: "order-cancel-scheduled", label: "자동 취소 예정 안내" },
  { templateId: "order-cancel-completed", label: "자동 취소 완료 안내" },
];

export function messageGuideUrlForTemplate(templateId: string): string {
  return `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=주문/결제#${templateId}`;
}

export const BANK_TRANSFER_POLICY_LINKS = {
  orderGuide: `${CUSTOMER_CENTER_ORDER_GUIDE}#bank-transfer`,
  messageGuide: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=주문/결제`,
  customerHub: CUSTOMER_CENTER_HUB,
  orderCompleteDemo: "/order-complete",
  mypage: "/mypage",
} as const;

export const BANK_TRANSFER_STATUS_LABELS: Record<
  BankTransferPaymentStatus,
  { label: string; tone: "amber" | "emerald" | "orange" | "slate" }
> = {
  awaiting_deposit: { label: "입금 대기", tone: "amber" },
  deposit_confirmed: { label: "입금 확인", tone: "emerald" },
  cancel_scheduled: { label: "입금 기한 임박", tone: "orange" },
  cancelled: { label: "자동 취소", tone: "slate" },
};

/** 주문 완료 화면 정책 안내 예시 (더미) */
export const ORDER_COMPLETE_DEMO_COPY = {
  banner:
    "무통장 입금 주문 접수 후 고객님께 안내되는 입금·배송 준비 정보입니다. 주문번호·입금기한·입금금액을 확인해 주세요.",
  title: "주문 접수 완료",
} as const;

export const ORDER_COMPLETE_DEMO_ORDER = {
  orderNumber: "BM-20260530-0048",
  customerName: "홍길동",
  productName: "로케트 AGM95L (폐전지 반납)",
  batterySpec: "AGM95L",
  vehicleName: "쏘렌토 MQ4",
  paymentMethod: "무통장 입금",
  depositAmount: "185,000원",
  bankName: "국민은행",
  bankAccount: "123-456-789012 (예시)",
  depositDeadline: "2026-06-02 15:30까지",
  status: "awaiting_deposit" as BankTransferPaymentStatus,
};
