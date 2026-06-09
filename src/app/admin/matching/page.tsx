import { AdminMatchingTable } from "@/components/admin/AdminMatchingTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { buildMatchingAuditRows, countMatchingReview } from "@/lib/admin/data/matching-audit";

export default function AdminMatchingPage() {
  const rows = buildMatchingAuditRows();
  const review = countMatchingReview(rows);
  const unmatched = rows.filter((r) => r.batteryMatchStatus === "unmatched").length;
  const imageMissing = rows.filter((r) => r.imageStatus !== "present").length;

  return (
    <AdminShellLayout
      title="매칭 검수"
      description="차량-배터리 매칭·이미지·단자 충돌을 확인합니다."
      summary={[
        { label: "전체", value: rows.length },
        { label: "확인 필요", value: review, tone: review > 0 ? "warning" : "default" },
        { label: "미매칭", value: unmatched, tone: unmatched > 0 ? "danger" : "default" },
        { label: "이미지 없음", value: imageMissing, tone: imageMissing > 0 ? "warning" : "default" },
      ]}
    >
      <AdminMatchingTable rows={rows} />
    </AdminShellLayout>
  );
}
