import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSmartStoreDashboard } from "@/components/admin/AdminSmartStoreDashboard";
import { loadAdminDashboardSnapshot } from "@/lib/admin/data/admin-dashboard-snapshot";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const snapshot = await loadAdminDashboardSnapshot();

  return (
    <AdminShellLayout
      title="대시보드"
      description="판매 · 주문 · 클레임 · 상담 현황"
      frameClassName="admin-page-frame--dashboard"
    >
      <AdminSmartStoreDashboard
        orderFlowCards={snapshot.orderFlowCards}
        claimCards={snapshot.claimCards}
        delayCards={snapshot.delayCards}
        productCards={snapshot.productCards}
        consultationCards={snapshot.consultationCards}
        reviewCards={snapshot.reviewCards}
        reviewRows={snapshot.reviewRows}
        productionRows={snapshot.productionRows}
        productionClaims={snapshot.productionClaims}
        productRows={snapshot.productRows}
        productionInquiries={snapshot.productionInquiries}
        batteryTalkThreads={snapshot.batteryTalkThreads}
        photoCheckCount={snapshot.photoCheckCount}
        recentConsultations={snapshot.recentConsultations}
        claimContext={{
          cancelRequestOrderIds: [...snapshot.claimContext.cancelRequestOrderIds],
          returnExchangeOrderIds: [...snapshot.claimContext.returnExchangeOrderIds],
        }}
      />
    </AdminShellLayout>
  );
}
