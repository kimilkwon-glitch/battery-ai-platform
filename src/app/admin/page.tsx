import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSmartStoreDashboard } from "@/components/admin/AdminSmartStoreDashboard";
import { loadAdminWorkbenchSnapshot } from "@/lib/admin/data/admin-workbench-snapshot";
import { loadAdminSettlementSummary } from "@/lib/admin/data/settlement-summary";
import { loadAdminShippingSummary } from "@/lib/admin/data/shipping-summary";
import {
  buildAdminProductRows,
  countProductsByReview,
} from "@/lib/admin/products/products-admin-service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [snapshot, settlement, shipping, productCounts] = await Promise.all([
    loadAdminWorkbenchSnapshot(),
    loadAdminSettlementSummary(),
    loadAdminShippingSummary(),
    Promise.resolve(countProductsByReview(buildAdminProductRows())),
  ]);

  return (
    <AdminShellLayout
      title="대시보드"
      description="신규주문부터 클레임까지 처리할 건수를 확인합니다."
    >
      <AdminSmartStoreDashboard
        actionCards={snapshot.actionCards}
        productionRows={snapshot.productionRows}
        claimContext={{
          cancelRequestOrderIds: [...snapshot.claimContext.cancelRequestOrderIds],
          returnExchangeOrderIds: [...snapshot.claimContext.returnExchangeOrderIds],
        }}
        consultationSummary={snapshot.consultationSummary}
        opsOverview={{
          todayPaidAmount: settlement.todayPaidAmount,
          monthPaidAmount: settlement.monthPaidAmount,
          needsInvoice: shipping.needsInvoice,
          readyToShip: shipping.readyToShip,
          priceMissing: productCounts.price_missing ?? 0,
          imageMissing: productCounts.image_missing ?? 0,
        }}
      />
    </AdminShellLayout>
  );
}
