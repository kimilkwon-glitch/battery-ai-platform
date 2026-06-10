import "server-only";

import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import { commerceToUnifiedRow } from "@/lib/admin/unified-orders";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";

export type AdminShippingQueueItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  batteryCode: string;
  orderStatus: string;
  orderStatusLabel: string;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  createdAt: string;
  queueStatus: "needs_invoice" | "ready_to_ship" | "in_transit";
};

export type AdminShippingSummary = {
  dbReady: boolean;
  needsInvoice: number;
  readyToShip: number;
  inTransit: number;
  items: AdminShippingQueueItem[];
};

const PREPARING = new Set(["order_confirmed", "preparing", "shipping_prep"]);
const IN_TRANSIT = new Set(["shipping", "shipped", "in_transit"]);

export async function loadAdminShippingSummary(): Promise<AdminShippingSummary> {
  const dbReady = isCommerceOrderStoreEnabled();
  if (!dbReady) {
    return { dbReady: false, needsInvoice: 0, readyToShip: 0, inTransit: 0, items: [] };
  }

  try {
    const orders = await storeCommerceOrderListItems(200);
    const rows = filterUnifiedRowsByDataScope(
      orders
        .map((o) => commerceToUnifiedRow(o))
        .filter((r) => r.fulfillmentType === "delivery"),
      "production",
    );

    const items: AdminShippingQueueItem[] = [];

    for (const row of rows) {
      if (row.channel !== "commerce") continue;
      const tracking = row.shippingTrackingNumber?.trim();
      const carrier = row.shippingCarrier?.trim();

      if (IN_TRANSIT.has(row.orderStatus)) {
        items.push({
          id: row.id,
          orderNumber: row.orderNumber,
          customerName: row.customerName,
          productName: row.productName,
          batteryCode: row.batteryCode,
          orderStatus: row.orderStatus,
          orderStatusLabel: row.orderStatusLabel,
          shippingCarrier: carrier,
          shippingTrackingNumber: tracking,
          createdAt: row.createdAt,
          queueStatus: "in_transit",
        });
      } else if (PREPARING.has(row.orderStatus)) {
        items.push({
          id: row.id,
          orderNumber: row.orderNumber,
          customerName: row.customerName,
          productName: row.productName,
          batteryCode: row.batteryCode,
          orderStatus: row.orderStatus,
          orderStatusLabel: row.orderStatusLabel,
          shippingCarrier: carrier,
          shippingTrackingNumber: tracking,
          createdAt: row.createdAt,
          queueStatus: tracking ? "ready_to_ship" : "needs_invoice",
        });
      }
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      dbReady: true,
      needsInvoice: items.filter((i) => i.queueStatus === "needs_invoice").length,
      readyToShip: items.filter((i) => i.queueStatus === "ready_to_ship").length,
      inTransit: items.filter((i) => i.queueStatus === "in_transit").length,
      items,
    };
  } catch {
    return { dbReady: false, needsInvoice: 0, readyToShip: 0, inTransit: 0, items: [] };
  }
}
