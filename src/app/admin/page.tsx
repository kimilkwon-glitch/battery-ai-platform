import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSmartStoreDashboard } from "@/components/admin/AdminSmartStoreDashboard";
import { loadAdminWorkbenchSnapshot } from "@/lib/admin/data/admin-workbench-snapshot";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const snapshot = await loadAdminWorkbenchSnapshot();

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
      />
    </AdminShellLayout>
  );
}
