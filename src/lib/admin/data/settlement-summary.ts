import "server-only";

import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import { commerceToUnifiedRow } from "@/lib/admin/unified-orders";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";

export type AdminSettlementSummary = {
  dbReady: boolean;
  orderCount: number;
  paidAmount: number;
  canceledAmount: number;
  refundedAmount: number;
  estimatedSettlement: number;
};

export async function loadAdminSettlementSummary(): Promise<AdminSettlementSummary> {
  const dbReady = isCommerceOrderStoreEnabled();
  if (!dbReady) {
    return {
      dbReady: false,
      orderCount: 0,
      paidAmount: 0,
      canceledAmount: 0,
      refundedAmount: 0,
      estimatedSettlement: 0,
    };
  }

  try {
    const orders = await storeCommerceOrderListItems(300);
    const rows = filterUnifiedRowsByDataScope(
      orders.map((o) => commerceToUnifiedRow(o)),
      "production",
    );

    let paidAmount = 0;
    let canceledAmount = 0;
    let refundedAmount = 0;

    for (const row of rows) {
      const amount = row.finalAmount ?? 0;
      if (row.paymentStatus === "completed" && !["canceled", "refunded"].includes(row.orderStatus)) {
        paidAmount += amount;
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
      canceledAmount,
      refundedAmount,
      estimatedSettlement: paidAmount - refundedAmount,
    };
  } catch {
    return {
      dbReady: false,
      orderCount: 0,
      paidAmount: 0,
      canceledAmount: 0,
      refundedAmount: 0,
      estimatedSettlement: 0,
    };
  }
}
