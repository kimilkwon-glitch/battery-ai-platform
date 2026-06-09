import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSmartStoreDashboard } from "@/components/admin/AdminSmartStoreDashboard";
import { loadAdminDashboardStats } from "@/lib/admin/data/dashboard-stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await loadAdminDashboardStats();

  return (
    <AdminShellLayout
      title="대시보드"
      description="오늘 처리할 일과 운영 현황을 확인합니다."
    >
      <AdminSmartStoreDashboard
        orderSections={stats.orderSections}
        claimSections={stats.claimSections}
        inquirySections={stats.inquirySections}
        productSections={stats.productSections}
        recentOrders={stats.recentUnifiedOrders}
      />
    </AdminShellLayout>
  );
}
