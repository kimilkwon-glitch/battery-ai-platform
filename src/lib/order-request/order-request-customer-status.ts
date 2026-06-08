import type { OrderRequestWorkflowStatus } from "@/types/order-request";

export type CustomerOrderRequestStatusCopy = {
  label: string;
  description: string;
  guide: string;
  badgeClass: string;
};

export const CUSTOMER_ORDER_REQUEST_STATUS: Record<
  OrderRequestWorkflowStatus,
  CustomerOrderRequestStatusCopy
> = {
  pending_review: {
    label: "주문 확인 중",
    description: "주문 내용을 확인하고 있습니다.",
    guide:
      "차량 정보와 배터리 규격 확인 후 안내드릴 수 있습니다. 추가 확인이 필요하면 연락드릴 수 있습니다.",
    badgeClass: "bg-amber-50 text-amber-950 ring-amber-200",
  },
  contacted: {
    label: "처리 중",
    description: "주문 관련 안내가 진행 중입니다.",
    guide: "안내받은 내용에 따라 주문을 진행해 주세요. 결제·입금은 별도 안내에 따라 진행됩니다.",
    badgeClass: "bg-blue-50 text-blue-900 ring-blue-200",
  },
  waiting_customer: {
    label: "고객 확인 대기",
    description: "추가 확인이 필요한 상태입니다.",
    guide:
      "사진·차량 정보·폐전지 반납 여부를 확인 중입니다. 연락이 오면 빠르게 답변해 주시면 진행이 수월합니다.",
    badgeClass: "bg-violet-50 text-violet-900 ring-violet-200",
  },
  quoted: {
    label: "안내 완료",
    description: "배터리 규격 또는 주문 조건 안내가 완료된 상태입니다.",
    guide: "안내된 규격·수령 방식·폐전지 조건을 확인한 뒤 주문 방법을 안내받으실 수 있습니다.",
    badgeClass: "bg-indigo-50 text-indigo-900 ring-indigo-200",
  },
  closed: {
    label: "처리 완료",
    description: "주문 처리가 완료된 상태입니다.",
    guide: "추가 문의가 있으시면 고객센터로 연락해 주세요.",
    badgeClass: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  },
  canceled: {
    label: "주문 취소",
    description: "주문이 취소된 상태입니다.",
    guide: "다시 주문이 필요하시면 고객센터 또는 주문하기 메뉴를 이용해 주세요.",
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};
