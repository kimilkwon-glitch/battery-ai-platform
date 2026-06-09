import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminVehiclesTable } from "@/components/admin/AdminVehiclesTable";
import {
  buildAdminVehicleRows,
  countMissingVehicleImages,
  countVehiclesNeedingReview,
} from "@/lib/admin/data/vehicles-admin";

export const dynamic = "force-dynamic";

export default function AdminVehiclesPage() {
  const rows = buildAdminVehicleRows();
  const reviewNeeded = countVehiclesNeedingReview(rows);
  const missingImages = countMissingVehicleImages(rows);
  const matched = rows.filter((r) => r.batteryMatchStatus === "matched").length;

  return (
    <AdminShellLayout
      title="차량 DB"
      description="차량 규격·이미지·매칭 상태를 검수합니다."
      summary={[
        { label: "전체", value: rows.length },
        { label: "검수 필요", value: reviewNeeded, tone: reviewNeeded > 0 ? "warning" : "default" },
        { label: "이미지 없음", value: missingImages, tone: missingImages > 0 ? "danger" : "default" },
        { label: "매칭 완료", value: matched, tone: "info" },
      ]}
    >
      <AdminVehiclesTable rows={rows} />
    </AdminShellLayout>
  );
}
