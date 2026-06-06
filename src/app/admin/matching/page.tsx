import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminMatchingTable } from "@/components/admin/AdminMatchingTable";
import { buildMatchingAuditRows } from "@/lib/admin/data/matching-audit";

export default function AdminMatchingPage() {
  const rows = buildMatchingAuditRows();

  return (
    <AdminShellLayout
      title="차량-배터리 매칭 검수"
      description="차량 검수(vehicleStatus)·이미지·배터리 매칭(batteryMatchStatus) 분리 기준. 미매칭 목록: npm run audit:battery-match → reports/battery-match-unmatched.csv"
    >
      <AdminMatchingTable rows={rows} />
    </AdminShellLayout>
  );
}
