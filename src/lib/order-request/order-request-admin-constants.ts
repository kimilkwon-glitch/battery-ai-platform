import type {
  OrderRequestReviewFlag,
  OrderRequestWorkflowStatus,
} from "@/types/order-request";

export const WORKFLOW_STATUS_LABELS: Record<
  OrderRequestWorkflowStatus,
  { label: string; className: string }
> = {
  pending_review: {
    label: "접수",
    className: "bg-blue-50 text-blue-900 ring-blue-200",
  },
  contacted: {
    label: "연락완료",
    className: "bg-violet-50 text-violet-900 ring-violet-200",
  },
  waiting_customer: {
    label: "확인중",
    className: "bg-amber-50 text-amber-950 ring-amber-200",
  },
  quoted: {
    label: "예약완료",
    className: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  },
  closed: {
    label: "작업완료",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  canceled: {
    label: "취소",
    className: "bg-red-50 text-red-800 ring-red-200",
  },
};

export const REVIEW_FLAG_LABELS: Record<OrderRequestReviewFlag, string> = {
  vehicle_info_missing: "차량 정보 미입력",
  terminal_direction_unknown: "단자 방향 확인 필요",
  battery_spec_unknown: "배터리 규격 확인 필요",
  used_battery_return_undecided: "폐전지 반납 여부 미정",
  visit_region_check_needed: "출장 지역 확인 필요",
  photo_check_needed: "사진 확인 필요",
  phone_check_needed: "연락처 확인 필요",
};

export const ALL_REVIEW_FLAGS = Object.keys(
  REVIEW_FLAG_LABELS,
) as OrderRequestReviewFlag[];

export type AdminOrderRequestFilterKey =
  | "all"
  | "pending_review"
  | "contacted"
  | "waiting_customer"
  | "quoted"
  | "closed"
  | "canceled"
  | "return"
  | "no_return"
  | "delivery"
  | "store"
  | "visit";

export const ADMIN_ORDER_REQUEST_FILTERS: {
  key: AdminOrderRequestFilterKey;
  label: string;
}[] = [
  { key: "all", label: "전체" },
  { key: "pending_review", label: "확인 필요" },
  { key: "contacted", label: "연락 완료" },
  { key: "waiting_customer", label: "고객 응답 대기" },
  { key: "quoted", label: "견적 안내" },
  { key: "closed", label: "종료" },
  { key: "canceled", label: "취소" },
  { key: "return", label: "폐전지 반납" },
  { key: "no_return", label: "미반납" },
  { key: "delivery", label: "택배" },
  { key: "store", label: "매장 방문" },
  { key: "visit", label: "출장 교체" },
];
