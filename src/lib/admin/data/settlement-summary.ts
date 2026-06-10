import "server-only";

import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import { commerceToUnifiedRow } from "@/lib/admin/unified-orders";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";

export type AdminSettlementSummary = {
  dbReady: boolean;
  orderCount: number;
  paidAmount: number;
  todayPaidAmount: number;
  monthPaidAmount: number;
  canceledAmount: number;
  refundedAmount: number;
  estimatedSettlement: number;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function loadAdminSettlementSummary(): Promise<AdminSettlementSummary> {
  const dbReady = isCommerceOrderStoreEnabled();
  if (!dbReady) {
    return {
      dbReady: false,
      orderCount: 0,
      paidAmount: 0,
      todayPaidAmount: 0,
      monthPaidAmount: 0,
      canceledAmount: 0,
      refundedAmount: 0,
      estimatedSettlement: 0,
    };
  }

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);
    const orders = await storeCommerceOrderListItems(300);
    const rows = filterUnifiedRowsByDataScope(
      orders.map((o) => commerceToUnifiedRow(o)),
      "production",
    );

    let paidAmount = 0;
    let todayPaidAmount = 0;
    let monthPaidAmount = 0;
    let canceledAmount = 0;
    let refundedAmount = 0;

    for (const row of rows) {
      const amount = row.finalAmount ?? 0;
      const created = new Date(row.createdAt);
      const isPaid =
        row.paymentStatus === "completed" && !["canceled", "refunded"].includes(row.orderStatus);
      if (isPaid) {
        paidAmount += amount;
        if (created >= todayStart) todayPaidAmount += amount;
        if (created >= monthStart) monthPaidAmount += amount;
      }
      if (row.paymentStatus === "canceled" || row.orderStatus === "canceled") {
        canceledAmount += amount;
      }
      if (row.paymentStatus === "refunded" || row.orderStatus === "refunded") {
        refundedAmount += amount;
      }
    }

    return {
      dbReady: true,
      orderCount: rows.length,
      paidAmount,
      todayPaidAmount,
      monthPaidAmount,
      canceledAmount,
      refundedAmount,
      estimatedSettlement: paidAmount - refundedAmount,
    };
  } catch {
    return {
      dbReady: false,
      orderCount: 0,
      paidAmount: 0,
      todayPaidAmount: 0,
      monthPaidAmount: 0,
      canceledAmount: 0,
      refundedAmount: 0,
      estimatedSettlement: 0,
    };
  }
}
