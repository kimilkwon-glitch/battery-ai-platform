import "server-only";

import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import {
  countSettlementBucket,
  estimatedSettlementAmount,
  isCanceledRow,
  isRefundedRow,
  isSettlementPaid,
  startOfDay,
  startOfMonth,
  type SettlementRowInput,
} from "@/lib/admin/settlement-selectors";
import { commerceToUnifiedRow } from "@/lib/admin/unified-orders";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";

export type AdminSettlementRow = {
  id: string;
  orderNumber: string;
  paymentAt: string;
  createdAt: string;
  customerName: string;
  productName: string;
  batteryCode: string;
  fulfillmentLabel: string;
  finalAmount: number;
  cancelRefundAmount: number;
  estimatedSettlementAmount: number;
  paymentStatus: string;
  paymentStatusLabel: string;
  orderStatus: string;
  orderStatusLabel: string;
  refundKind: "none" | "canceled" | "refunded";
};

export type AdminSettlementSummary = {
  dbReady: boolean;
  orderCount: number;
  paidAmount: number;
  todayPaidAmount: number;
  monthPaidAmount: number;
  canceledAmount: number;
  refundedAmount: number;
  estimatedSettlement: number;
  items: AdminSettlementRow[];
};

function toSettlementRow(row: SettlementRowInput): AdminSettlementRow {
  const amount = row.finalAmount ?? 0;
  let refundKind: AdminSettlementRow["refundKind"] = "none";
  if (isCanceledRow(row)) refundKind = "canceled";
  else if (isRefundedRow(row)) refundKind = "refunded";

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    paymentAt: row.paymentAt,
    createdAt: row.createdAt,
    customerName: row.customerName,
    productName: row.productName,
    batteryCode: row.batteryCode,
    fulfillmentLabel: row.fulfillmentLabel,
    finalAmount: amount,
    cancelRefundAmount: refundKind === "none" ? 0 : amount,
    estimatedSettlementAmount: estimatedSettlementAmount(row),
    paymentStatus: row.paymentStatus,
    paymentStatusLabel: row.paymentStatusLabel,
    orderStatus: row.orderStatus,
    orderStatusLabel: row.orderStatusLabel,
    refundKind,
  };
}

export async function loadAdminSettlementSummary(): Promise<AdminSettlementSummary> {
  const empty: AdminSettlementSummary = {
    dbReady: false,
    orderCount: 0,
    paidAmount: 0,
    todayPaidAmount: 0,
    monthPaidAmount: 0,
    canceledAmount: 0,
    refundedAmount: 0,
    estimatedSettlement: 0,
    items: [],
  };

  if (!isCommerceOrderStoreEnabled()) return empty;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);
    const orders = await storeCommerceOrderListItems(300);
    const scoped = filterUnifiedRowsByDataScope(
      orders.map((o) => commerceToUnifiedRow(o)),
      "production",
    );

    const settlementRows: SettlementRowInput[] = scoped.map((row) => ({
      ...row,
      paymentAt: row.approvedAt ?? row.createdAt,
    }));

    let paidAmount = 0;
    let todayPaidAmount = 0;
    let monthPaidAmount = 0;
    let canceledAmount = 0;
    let refundedAmount = 0;

    for (const row of settlementRows) {
      const amount = row.finalAmount ?? 0;
      const paymentAt = new Date(row.paymentAt);
      if (isSettlementPaid(row)) {
        paidAmount += amount;
        if (paymentAt >= todayStart) todayPaidAmount += amount;
        if (paymentAt >= monthStart) monthPaidAmount += amount;
      }
      if (isCanceledRow(row)) canceledAmount += amount;
      if (isRefundedRow(row)) refundedAmount += amount;
    }

    return {
      dbReady: true,
      orderCount: countSettlementBucket(settlementRows, "order_count", now),
      paidAmount,
      todayPaidAmount,
      monthPaidAmount,
      canceledAmount,
      refundedAmount,
      estimatedSettlement: paidAmount - refundedAmount,
      items: settlementRows.map(toSettlementRow),
    };
  } catch {
    return empty;
  }
}
