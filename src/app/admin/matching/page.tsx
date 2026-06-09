import { AdminMatchingTable } from "@/components/admin/AdminMatchingTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { buildMatchingAuditRows } from "@/lib/admin/data/matching-audit";

export default function AdminMatchingPage() {
  const rows = buildMatchingAuditRows();

  return (
    <AdminShellLayout
      title="매칭 검수"
      description="차량-배터리 매칭·이미지·L/R 충돌을 확인합니다."
    >
      <AdminMatchingTable rows={rows} />
    </AdminShellLayout>
  );
}
