import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminBatteriesTable } from "@/components/admin/AdminBatteriesTable";
import { buildAdminBatteryRows } from "@/lib/admin/data/batteries-admin";

export default function AdminBatteriesPage() {
  const rows = buildAdminBatteryRows();

  return (
    <AdminShellLayout
      title="배터리 DB 관리"
      description="baseSpecs 기준 규격별 제원 검수 — 로케트 GB / 쏠라이트 CMF 표기 원칙을 관리자에서 확인합니다."
    >
      <AdminBatteriesTable rows={rows} />
    </AdminShellLayout>
  );
}
