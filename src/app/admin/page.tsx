import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSmartStoreDashboard } from "@/components/admin/AdminSmartStoreDashboard";
import { loadAdminDashboardStats } from "@/lib/admin/data/dashboard-stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await loadAdminDashboardStats();

  return (
    <AdminShellLayout
      title="대시보드"
      description="신규주문부터 클레임까지 처리할 건수를 확인합니다."
    >
      <AdminSmartStoreDashboard
        actionCards={stats.todayActionSections}
        recentOrders={stats.recentUnifiedOrders}
      />
    </AdminShellLayout>
  );
}
