import type {
  AdminOrderRequestListItem,
  OrderRequestRecord,
  OrderRequestWorkflowStatus,
} from "@/types/order-request";

export type OrderRequestAdminStats = {
  total: number;
  needsReview: number;
  contacted: number;
  usedBatteryReturn: number;
  visitInstall: number;
};

export function statsFromRecords(records: OrderRequestRecord[]): OrderRequestAdminStats {
  return {
    total: records.length,
    needsReview: records.filter(
      (r) =>
        r.workflowStatus === "pending_review" ||
        r.adminStatus === "pending_review" ||
        (r.reviewFlagKeys?.length ?? r.staffSummary.reviewFlags.length) > 0,
    ).length,
    contacted: records.filter(
      (r) =>
        r.workflowStatus === "contacted" ||
        r.workflowStatus === "waiting_customer" ||
        r.workflowStatus === "quoted" ||
        r.adminStatus === "contacted",
    ).length,
    usedBatteryReturn: records.filter((r) => r.usedBatteryReturnOption === "return").length,
    visitInstall: records.filter((r) => r.fulfillment.method === "visit_install").length,
  };
}

export function statsFromListItems(items: AdminOrderRequestListItem[]): OrderRequestAdminStats {
  return {
    total: items.length,
    needsReview: items.filter(
      (i) => i.status === "pending_review" || i.reviewFlags.length > 0,
    ).length,
    contacted: items.filter((i) =>
      (["contacted", "waiting_customer", "quoted"] as OrderRequestWorkflowStatus[]).includes(
        i.status,
      ),
    ).length,
    usedBatteryReturn: items.filter((i) => i.usedBatteryReturnOption === "return").length,
    visitInstall: items.filter((i) => i.fulfillmentMethod === "visit_install").length,
  };
}
