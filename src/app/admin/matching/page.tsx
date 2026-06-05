import { AdminShell } from "@/components/admin/AdminShell";
import { AdminMatchingTable } from "@/components/admin/AdminMatchingTable";
import { buildMatchingAuditRows } from "@/lib/admin/data/matching-audit";

export default function AdminMatchingPage() {
  const rows = buildMatchingAuditRows();

  return (
    <AdminShell
      title="차량-배터리 매칭 검수"
      description="단자 방향·AGM/일반·판매 제외·이미지 누락 등 위험 패턴을 점검합니다."
    >
      <AdminMatchingTable rows={rows} />
    </AdminShell>
  );
}
