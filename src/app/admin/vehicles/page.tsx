import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminVehiclesTable } from "@/components/admin/AdminVehiclesTable";
import { buildAdminVehicleRows } from "@/lib/admin/data/vehicles-admin";

export const dynamic = "force-dynamic";

export default function AdminVehiclesPage() {
  const rows = buildAdminVehicleRows();

  return (
    <AdminShellLayout
      title="차량 DB"
      description="차량 규격·이미지·매칭 상태를 검수합니다."
    >
      <AdminVehiclesTable rows={rows} />
    </AdminShellLayout>
  );
}
