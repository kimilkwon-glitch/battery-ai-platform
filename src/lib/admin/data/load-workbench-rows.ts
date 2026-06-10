import "server-only";

import { buildClaimWorkbenchContext } from "@/lib/admin/claim-dashboard-counts";
import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  type UnifiedAdminOrderRow,
} from "@/lib/admin/unified-orders";
import { claimList } from "@/lib/claims/claim-store";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";
import type { OrderWorkbenchClaimContext } from "@/lib/admin/order-workbench";

export type AdminWorkbenchRowsBundle = {
  rows: UnifiedAdminOrderRow[];
  productionRows: UnifiedAdminOrderRow[];
  claimContext: OrderWorkbenchClaimContext;
  dbReady: boolean;
};

export async function loadAdminWorkbenchRows(): Promise<AdminWorkbenchRowsBundle> {
  const dbReady = isCommerceOrderStoreEnabled();
  let commerceOrders: Awaited<ReturnType<typeof storeCommerceOrderListItems>> = [];
  if (dbReady) {
    try {
      commerceOrders = await storeCommerceOrderListItems(200);
    } catch {
      commerceOrders = [];
    }
  }

  const [consultations, claims] = await Promise.all([
    listOrderRequests({ limit: 120 }),
    claimList({ limit: 120 }),
  ]);
  const claimContext = buildClaimWorkbenchContext(claims);

  const rows = [
    ...commerceOrders.map((o) => commerceToUnifiedRow(o)),
    ...consultations.map(consultationToUnifiedRow),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    rows,
    productionRows: filterUnifiedRowsByDataScope(rows, "production"),
    claimContext,
    dbReady,
  };
}
