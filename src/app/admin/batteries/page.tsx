import { AdminBatteriesTable } from "@/components/admin/AdminBatteriesTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import {
  buildAdminBatteryRows,
  countBatteriesNeedingReview,
  countMissingBatteryImages,
} from "@/lib/admin/data/batteries-admin";

export default function AdminBatteriesPage() {
  const rows = buildAdminBatteryRows();
  const review = countBatteriesNeedingReview(rows);
  const missingImg = countMissingBatteryImages(rows);

  return (
    <AdminShellLayout
      title="배터리 DB"
      description="규격별 제원·이미지·표기를 검수합니다."
      summary={[
        { label: "전체", value: rows.length },
        { label: "검수 필요", value: review, tone: review > 0 ? "warning" : "default" },
        { label: "이미지 없음", value: missingImg, tone: missingImg > 0 ? "warning" : "default" },
        { label: "숨김", value: rows.filter((r) => r.hidden).length },
      ]}
    >
      <AdminBatteriesTable rows={rows} />
    </AdminShellLayout>
  );
}
