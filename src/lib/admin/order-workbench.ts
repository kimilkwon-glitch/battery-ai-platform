import { COMMERCE_LIFECYCLE_LABELS } from "@/types/commerce-order";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";

export type OrderWorkbenchView =
  | "all"
  | "new"
  | "paid"
  | "confirm_pending"
  | "preparing"
  | "shipping_prep"
  | "in_progress"
  | "completed"
  | "canceled";

export type OrderBulkAction =
  | "confirm_order"
  | "mark_preparing"
  | "ship_order"
  | "mark_delivered"
  | "mark_work_completed"
  | "mark_pickup_completed"
  | "cancel_order"
  | "save_admin_memo";

export const WORKBENCH_STATUS_BAR: { id: OrderWorkbenchView; label: string }[] = [
  { id: "new", label: "신규주문" },
  { id: "confirm_pending", label: "발주확인 대기" },
  { id: "preparing", label: "상품준비" },
  { id: "shipping_prep", label: "배송준비" },
  { id: "in_progress", label: "배송중" },
  { id: "completed", label: "완료" },
  { id: "canceled", label: "취소/환불" },
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

const CONFIRM_PENDING = new Set(["payment_completed", "payment_pending"]);
const PREPARING = new Set(["order_confirmed", "preparing"]);
const SHIPPING_PREP = new Set(["shipping_prep"]);
const IN_TRANSIT = new Set(["shipping", "shipped", "in_transit", "visit_scheduled", "store_visit_scheduled"]);
const COMPLETED = new Set(["work_completed", "delivered", "picked_up", "completed"]);
const CANCELED = new Set(["canceled", "refunded", "payment_failed"]);

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** URL `view` 파라미터 파싱 (구 `status` 호환) */
export function parseWorkbenchView(
  view: string | null,
  legacyStatus: string | null,
): OrderWorkbenchView {
  const raw = view ?? legacyStatus;
  if (!raw || raw === "all") return "all";
  const map: Record<string, OrderWorkbenchView> = {
    new: "new",
    paid: "paid",
    payment_completed: "paid",
    confirm_pending: "confirm_pending",
    order_created: "confirm_pending",
    preparing: "preparing",
    shipping_prep: "shipping_prep",
    in_progress: "in_progress",
    completed: "completed",
    canceled: "canceled",
  };
  return map[raw] ?? "all";
}

export function matchesWorkbenchView(row: UnifiedAdminOrderRow, view: OrderWorkbenchView): boolean {
  if (view === "all") return true;

  if (row.channel === "commerce") {
    const s = row.orderStatus;
    const ps = row.paymentStatus;
    switch (view) {
      case "new":
        return isToday(row.createdAt) && (CONFIRM_PENDING.has(s) || s === "payment_pending");
      case "paid":
        return ps === "completed" || s === "payment_completed";
      case "confirm_pending":
        return CONFIRM_PENDING.has(s) && ps !== "canceled" && ps !== "refunded";
      case "preparing":
        return PREPARING.has(s);
      case "shipping_prep":
        return SHIPPING_PREP.has(s);
      case "in_progress":
        return IN_TRANSIT.has(s);
      case "completed":
        return COMPLETED.has(s);
      case "canceled":
        return CANCELED.has(s) || ps === "canceled" || ps === "refunded";
      default:
        return true;
    }
  }

  const s = row.orderStatus;
  switch (view) {
    case "new":
      return isToday(row.createdAt) && (s === "pending_review" || s === "waiting_customer");
    case "paid":
    case "confirm_pending":
      return s === "pending_review";
    case "preparing":
      return s === "contacted";
    case "shipping_prep":
      return false;
    case "in_progress":
      return s === "contacted" || s === "waiting_customer" || s === "quoted";
    case "completed":
      return s === "closed";
    case "canceled":
      return s === "canceled";
    default:
      return true;
  }
}

export function countWorkbenchView(rows: UnifiedAdminOrderRow[], view: OrderWorkbenchView): number {
  return rows.filter((r) => matchesWorkbenchView(r, view)).length;
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
  if (CANCELED.has(s) || COMPLETED.has(s)) {
    return "완료·취소된 주문은 상태를 변경할 수 없습니다.";
  }

  switch (action) {
    case "confirm_order":
      if (!CONFIRM_PENDING.has(s)) return "발주확인은 결제완료·결제대기 주문만 가능합니다.";
      return null;
    case "mark_preparing":
      if (s !== "order_confirmed") return "발주확인 상태에서만 상품준비 처리가 가능합니다.";
      return null;
    case "ship_order":
      if (!isDeliveryOrder(row)) return "택배 주문만 송장 입력이 가능합니다.";
      if (!["order_confirmed", "preparing", "shipping_prep"].includes(s)) {
        return "상품준비·배송준비 상태에서만 발송처리가 가능합니다.";
      }
      return null;
    case "mark_delivered":
      if (!isDeliveryOrder(row)) return "택배 주문만 배송완료 처리가 가능합니다.";
      if (!IN_TRANSIT.has(s)) return "배송중·발송처리 상태에서만 배송완료가 가능합니다.";
      return null;
    case "mark_work_completed":
      if (!isVisitOrStoreInstall(row)) return "출장·매장 교체 주문만 장착완료 처리가 가능합니다.";
      if (!["order_confirmed", "preparing", "shipping_prep", "visit_scheduled", "store_visit_scheduled"].includes(s)) {
        return "작업 진행 가능한 상태가 아닙니다.";
      }
      return null;
    case "mark_pickup_completed":
      if (!isStorePickup(row)) return "매장 수령 주문만 수령완료 처리가 가능합니다.";
      if (!["order_confirmed", "preparing", "shipping_prep"].includes(s)) return "수령완료 처리 가능한 상태가 아닙니다.";
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
