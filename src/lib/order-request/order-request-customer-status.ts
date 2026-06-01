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
    label: "접수 확인 중",
    description: "접수 내용을 확인하고 있습니다.",
    guide:
      "차량 정보와 배터리 규격 확인 후 안내드릴 수 있습니다. 추가 확인이 필요하면 연락드릴 수 있습니다.",
    badgeClass: "bg-amber-50 text-amber-950 ring-amber-200",
  },
  contacted: {
    label: "상담 연락 완료",
    description: "상담 연락이 완료된 상태입니다.",
    guide: "안내받은 내용에 따라 주문을 진행해 주세요. 결제·입금은 별도 안내에 따라 진행됩니다.",
    badgeClass: "bg-blue-50 text-blue-900 ring-blue-200",
  },
  waiting_customer: {
    label: "고객 확인 대기",
    description: "추가 확인이 필요한 상태입니다.",
    guide:
      "사진 확인, 차량 정보, 폐전지 반납 여부 등을 확인해 주세요. 고객센터 또는 안내 연락에 응해 주시면 빠르게 진행할 수 있습니다.",
    badgeClass: "bg-violet-50 text-violet-900 ring-violet-200",
  },
  quoted: {
    label: "안내 완료",
    description: "배터리 규격 또는 주문 조건 안내가 완료된 상태입니다.",
    guide: "안내된 규격·수령 방식·폐전지 조건을 확인한 뒤 주문 방법을 안내받으실 수 있습니다.",
    badgeClass: "bg-indigo-50 text-indigo-900 ring-indigo-200",
  },
  closed: {
    label: "상담 종료",
    description: "상담 요청 처리가 종료된 상태입니다.",
    guide: "추가 문의가 있으시면 고객센터로 연락해 주세요.",
    badgeClass: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  },
  canceled: {
    label: "접수 취소",
    description: "상담 주문 요청이 취소된 상태입니다.",
    guide: "다시 상담이 필요하시면 상담 주문 요청을 새로 접수해 주세요.",
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};
