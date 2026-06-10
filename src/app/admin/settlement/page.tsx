import { AdminSettlementClient } from "@/components/admin/AdminSettlementClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { loadAdminSettlementSummary } from "@/lib/admin/data/settlement-summary";

export const dynamic = "force-dynamic";

export default async function AdminSettlementPage() {
  const summary = await loadAdminSettlementSummary();

  return (
    <AdminShellLayout
      title="정산관리"
      description="주문·결제 데이터 기준 매출 요약입니다. 토스 정산 연동 후 실제 정산금이 반영됩니다."
    >
      <div className="mt-4">
        <AdminSettlementClient summary={summary} />
      </div>
    </AdminShellLayout>
  );
}
