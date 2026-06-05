import { AdminShell } from "@/components/admin/AdminShell";
import { AdminVehiclesTable } from "@/components/admin/AdminVehiclesTable";
import { buildAdminVehicleRows } from "@/lib/admin/data/vehicles-admin";

export const dynamic = "force-dynamic";

export default function AdminVehiclesPage() {
  const rows = buildAdminVehicleRows();

  return (
    <AdminShell
      title="차량 DB 관리"
      description="vehicle-battery-db + car-assets 기준 검수 화면 — 운영자 전용 상세 정보입니다."
    >
      <AdminVehiclesTable rows={rows} />
    </AdminShell>
  );
}
