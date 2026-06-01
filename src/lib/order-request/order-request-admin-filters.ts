import type { AdminOrderRequestFilterKey } from "@/lib/order-request/order-request-admin-constants";
import type { OrderRequestRecord, OrderRequestWorkflowStatus } from "@/types/order-request";

const WORKFLOW_FILTERS: OrderRequestWorkflowStatus[] = [
  "pending_review",
  "contacted",
  "waiting_customer",
  "quoted",
  "closed",
  "canceled",
];

export function matchesAdminOrderFilter(
  row: OrderRequestRecord,
  filter: AdminOrderRequestFilterKey,
): boolean {
  if (filter === "all") return true;
  if (WORKFLOW_FILTERS.includes(filter as OrderRequestWorkflowStatus)) {
    return row.workflowStatus === filter || row.adminStatus === filter;
  }
  switch (filter) {
    case "return":
      return row.usedBatteryReturnOption === "return";
    case "no_return":
      return row.usedBatteryReturnOption === "no_return";
    case "delivery":
      return row.fulfillment.method === "delivery";
    case "store":
      return row.fulfillment.method === "store_pickup";
    case "visit":
      return row.fulfillment.method === "visit_install";
    default:
      return true;
  }
}

export function matchesAdminOrderSearch(row: OrderRequestRecord, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const hay = [
    row.requestNumber,
    row.customer.name,
    row.customer.phone,
    row.vehicle?.name,
    row.vehicle?.year,
    row.staffSummary.vehicleLine,
    row.staffSummary.batteryLine,
    ...row.items.map((i) => i.batterySpec),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

/** API status 쿼리 — 워크플로 필터만 서버에 전달 */
export function filterToApiStatus(
  filter: AdminOrderRequestFilterKey,
): string | undefined {
  if (WORKFLOW_FILTERS.includes(filter as OrderRequestWorkflowStatus)) {
    return filter;
  }
  return undefined;
}
