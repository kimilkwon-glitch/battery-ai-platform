import { AdminSettlementClient } from "@/components/admin/AdminSettlementClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { loadAdminSettlementSummary } from "@/lib/admin/data/settlement-summary";

export const dynamic = "force-dynamic";

export default async function AdminSettlementPage() {
  const summary = await loadAdminSettlementSummary();

  return (
    <AdminShellLayout
      title="정산관리"
      description="주문·결제 기준 매출 요약"
      frameClassName="admin-page-frame--workspace admin-page-frame--settlement"
    >
      <AdminSettlementClient summary={summary} />
    </AdminShellLayout>
  );
}
