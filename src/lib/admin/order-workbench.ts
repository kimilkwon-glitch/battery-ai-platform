import { COMMERCE_LIFECYCLE_LABELS } from "@/types/commerce-order";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import {
  filterUnifiedRowsByDataScope,
  type AdminOrderDataScope,
} from "@/lib/admin/order-data-scope";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";

/** 스마트스토어식 주문 작업대 탭 (6개) */
export type OrderWorkbenchView =
  | "new_order"
  | "preparing"
  | "in_progress"
  | "completed"
  | "cancel_request"
  | "return_exchange";

export type OrderWorkbenchClaimContext = {
  cancelRequestOrderIds: ReadonlySet<string>;
  returnExchangeOrderIds: ReadonlySet<string>;
};

export const EMPTY_CLAIM_CONTEXT: OrderWorkbenchClaimContext = {
  cancelRequestOrderIds: new Set(),
  returnExchangeOrderIds: new Set(),
};

export type OrderBulkAction =
  | "confirm_order"
  | "mark_preparing"
  | "ship_order"
  | "mark_delivered"
  | "mark_work_completed"
  | "mark_pickup_completed"
  | "cancel_order"
  | "save_admin_memo";

/**
 * 주문 작업대 탭 — 대시보드 카드·목록 필터와 동일한 `matchesWorkbenchView` 기준
 */
export const WORKBENCH_STATUS_BAR: { id: OrderWorkbenchView; label: string; hint?: string }[] = [
  { id: "new_order", label: "신규주문", hint: "결제 완료·발주확인 전" },
  { id: "preparing", label: "상품준비", hint: "발주확인 후 출고·작업 준비" },
  { id: "in_progress", label: "배송/출장중", hint: "배송·출장·매장 방문 진행" },
  { id: "completed", label: "완료주문", hint: "배송·작업·수령 완료" },
  { id: "cancel_request", label: "취소요청", hint: "고객 취소 접수·처리 전" },
  { id: "return_exchange", label: "반품/교환요청", hint: "반품·교환 접수·처리 전" },
];

export const SHIPPING_CARRIERS = [
  "CJ대한통운",
  "롯데택배",
  "한진택배",
  "로젠택배",
  "우체국택배",
  "경동택배",
  "대신택배",
  "직접배송",
  "기타",
] as const;

const PREPARING = new Set(["order_confirmed", "preparing", "shipping_prep"]);
const IN_PROGRESS = new Set([
  "shipping",
  "shipped",
  "in_transit",
  "visit_scheduled",
  "store_visit_scheduled",
]);
const COMPLETED = new Set(["work_completed", "delivered", "picked_up", "completed"]);
const CANCELED = new Set(["canceled", "refunded", "payment_failed"]);

function isCanceledPayment(ps: string): boolean {
  return ps === "canceled" || ps === "refunded";
}

/**
 * 신규주문 = payment_status completed + order_status payment_completed (발주확인 전)
 */
export function matchCommerceNewOrder(orderStatus: string, paymentStatus: string): boolean {
  if (isCanceledPayment(paymentStatus) || CANCELED.has(orderStatus) || COMPLETED.has(orderStatus)) {
    return false;
  }
  return paymentStatus === "completed" && orderStatus === "payment_completed";
}

/** URL `view` 파라미터 파싱 — 기본값 신규주문 */
export function parseWorkbenchView(
  view: string | null,
  legacyStatus: string | null,
): OrderWorkbenchView {
  const raw = view ?? legacyStatus;
  if (!raw || raw === "all") return "new_order";
  const map: Record<string, OrderWorkbenchView> = {
    new_order: "new_order",
    new: "new_order",
    unpaid_intake: "new_order",
    unpaid: "new_order",
    paid: "new_order",
    paid_action_required: "new_order",
    payment_completed: "new_order",
    confirm_pending: "new_order",
    order_created: "new_order",
    preparing: "preparing",
    shipping_prep: "preparing",
    in_progress: "in_progress",
    completed: "completed",
    canceled: "completed",
    cancel_request: "cancel_request",
    cancel: "cancel_request",
    return_exchange: "return_exchange",
    return: "return_exchange",
    exchange: "return_exchange",
  };
  return map[raw] ?? "new_order";
}

export function matchesWorkbenchView(
  row: UnifiedAdminOrderRow,
  view: OrderWorkbenchView,
  claimContext: OrderWorkbenchClaimContext = EMPTY_CLAIM_CONTEXT,
): boolean {
  if (view === "cancel_request") {
    return row.channel === "commerce" && claimContext.cancelRequestOrderIds.has(row.id);
  }
  if (view === "return_exchange") {
    return row.channel === "commerce" && claimContext.returnExchangeOrderIds.has(row.id);
  }

  if (row.channel === "commerce") {
    const s = row.orderStatus;
    const ps = row.paymentStatus;
    switch (view) {
      case "new_order":
        return matchCommerceNewOrder(s, ps);
      case "preparing":
        return PREPARING.has(s);
      case "in_progress":
        return IN_PROGRESS.has(s);
      case "completed":
        return COMPLETED.has(s);
      default:
        return false;
    }
  }

  const s = row.orderStatus;
  switch (view) {
    case "new_order":
      return s === "pending_review" || s === "waiting_customer";
    case "preparing":
      return s === "contacted";
    case "in_progress":
      return s === "quoted";
    case "completed":
      return s === "closed" || s === "canceled";
    default:
      return false;
  }
}

export function countWorkbenchView(
  rows: UnifiedAdminOrderRow[],
  view: OrderWorkbenchView,
  dataScope: AdminOrderDataScope = "production",
  claimContext: OrderWorkbenchClaimContext = EMPTY_CLAIM_CONTEXT,
): number {
  const scoped = filterUnifiedRowsByDataScope(rows, dataScope);
  return scoped.filter((r) => matchesWorkbenchView(r, view, claimContext)).length;
}

export function isDeliveryOrder(row: UnifiedAdminOrderRow): boolean {
  return row.fulfillmentType === "delivery";
}

export function isVisitOrStoreInstall(row: UnifiedAdminOrderRow): boolean {
  return row.fulfillmentType === "visit_install" || row.fulfillmentType === "store_install";
}

export function isStorePickup(row: UnifiedAdminOrderRow): boolean {
  return row.fulfillmentType === "store_pickup_self" || row.fulfillmentType === "store_pickup";
}

export function canBulkAction(row: UnifiedAdminOrderRow, action: OrderBulkAction): string | null {
  if (row.channel !== "commerce") {
    return "자사몰 결제 주문만 일괄 처리할 수 있습니다.";
  }
  const s = row.orderStatus;
  const ps = row.paymentStatus;
  if (CANCELED.has(s) || COMPLETED.has(s)) {
    return "완료·취소된 주문은 상태를 변경할 수 없습니다.";
  }

  switch (action) {
    case "confirm_order":
      if (!matchCommerceNewOrder(s, ps)) {
        return "발주확인은 신규주문(발주확인 전)만 가능합니다.";
      }
      return null;
    case "mark_preparing":
      if (s !== "order_confirmed") return "발주확인 상태에서만 상품준비 처리가 가능합니다.";
      return null;
    case "ship_order":
      if (!isDeliveryOrder(row)) return "택배 주문만 송장 입력이 가능합니다.";
      if (!PREPARING.has(s)) {
        return "상품준비·배송준비 상태에서만 발송처리가 가능합니다.";
      }
      return null;
    case "mark_delivered":
      if (!isDeliveryOrder(row)) return "택배 주문만 배송완료 처리가 가능합니다.";
      if (!IN_PROGRESS.has(s)) {
        return "배송중·발송처리 상태에서만 배송완료가 가능합니다.";
      }
      return null;
    case "mark_work_completed":
      if (!isVisitOrStoreInstall(row)) return "출장·매장 교체 주문만 장착완료 처리가 가능합니다.";
      if (!["order_confirmed", "preparing", "shipping_prep", "visit_scheduled", "store_visit_scheduled"].includes(s)) {
        return "작업 진행 가능한 상태가 아닙니다.";
      }
      return null;
    case "mark_pickup_completed":
      if (!isStorePickup(row)) return "매장 수령 주문만 수령완료 처리가 가능합니다.";
      if (!PREPARING.has(s)) return "수령완료 처리 가능한 상태가 아닙니다.";
      return null;
    case "cancel_order":
      if (COMPLETED.has(s) || CANCELED.has(s)) return "이미 종료된 주문입니다.";
      return null;
    case "save_admin_memo":
      return null;
    default:
      return "지원하지 않는 처리입니다.";
  }
}

export function nextStatusForAction(
  order: Pick<CommerceOrderRecord, "orderStatus" | "fulfillmentType">,
  action: OrderBulkAction,
): CommerceOrderRecord["orderStatus"] | null {
  switch (action) {
    case "confirm_order":
      return "order_confirmed";
    case "mark_preparing":
      return "preparing";
    case "ship_order":
      return "shipping";
    case "mark_delivered":
      return "delivered";
    case "mark_work_completed":
      return "work_completed";
    case "mark_pickup_completed":
      return "picked_up";
    case "cancel_order":
      return "canceled";
    default:
      return null;
  }
}

export function actionStatusNote(action: OrderBulkAction): string {
  const notes: Record<OrderBulkAction, string> = {
    confirm_order: "관리자: 발주확인 처리",
    mark_preparing: "관리자: 상품준비중 처리",
    ship_order: "관리자: 송장 입력·발송처리",
    mark_delivered: "관리자: 배송완료 처리",
    mark_work_completed: "관리자: 출장/장착 완료 처리",
    mark_pickup_completed: "관리자: 매장 수령 완료 처리",
    cancel_order: "관리자: 주문 취소(내부)",
    save_admin_memo: "관리자: 메모 저장",
  };
  return notes[action];
}

export function orderStatusBadgeLabel(status: string): string {
  return COMMERCE_LIFECYCLE_LABELS[status as keyof typeof COMMERCE_LIFECYCLE_LABELS] ?? status;
}

/** 신규주문(발주확인 전) — 테이블·최근주문 강조용 */
export function rowNeedsOperatorAction(row: UnifiedAdminOrderRow): boolean {
  if (row.channel !== "commerce") return false;
  return matchCommerceNewOrder(row.orderStatus, row.paymentStatus);
}

/** 출장·매장 교체 — 상품준비 탭에서 출장시작 가능 여부 */
export function canStartVisit(row: UnifiedAdminOrderRow): string | null {
  if (row.channel !== "commerce") return "자사몰 주문만 처리할 수 있습니다.";
  if (!isVisitOrStoreInstall(row)) return "출장·매장 교체 주문만 출장시작이 가능합니다.";
  if (!PREPARING.has(row.orderStatus)) return "상품준비 단계에서만 출장시작이 가능합니다.";
  return null;
}

export function visitStartStatus(row: UnifiedAdminOrderRow): CommerceOrderRecord["orderStatus"] | null {
  if (canStartVisit(row)) return null;
  return row.fulfillmentType === "visit_install" ? "visit_scheduled" : "store_visit_scheduled";
}

/** 배송/출장중 탭 — 완료처리 액션 (택배는 택배사 추적 연동 전 수동 배송완료 미노출) */
export function completeActionForRow(row: UnifiedAdminOrderRow): OrderBulkAction | null {
  if (row.channel !== "commerce" || !IN_PROGRESS.has(row.orderStatus)) return null;
  if (isVisitOrStoreInstall(row) && canBulkAction(row, "mark_work_completed") === null) {
    return "mark_work_completed";
  }
  if (isStorePickup(row) && canBulkAction(row, "mark_pickup_completed") === null) {
    return "mark_pickup_completed";
  }
  return null;
}

/** 택배 주문 배송조회 URL (송장 등록 후) */
export function deliveryTrackingUrl(
  carrier: string | undefined | null,
  trackingNumber: string | undefined | null,
): string | null {
  const no = (trackingNumber ?? "").trim();
  if (!no) return null;
  const c = (carrier ?? "").trim();
  if (/CJ|대한통운/i.test(c)) {
    return `https://trace.cjlogistics.com/web/detail.jsp?slipno=${encodeURIComponent(no)}`;
  }
  if (/롯데/i.test(c)) {
    return `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${encodeURIComponent(no)}`;
  }
  if (/한진/i.test(c)) {
    return `https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnumText2=${encodeURIComponent(no)}`;
  }
  return null;
}
