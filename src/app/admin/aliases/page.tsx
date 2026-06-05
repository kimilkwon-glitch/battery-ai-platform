import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminAliasesTable } from "@/components/admin/AdminAliasesTable";
import { buildAdminAliasRows } from "@/lib/admin/data/aliases-admin";

export default function AdminAliasesPage() {
  const rows = buildAdminAliasRows();

  return (
    <AdminShellLayout
      title="검색어/별칭 관리"
      description="vehicle-alias-db 기준 — 고객 화면에는 정식명 중심, 별칭은 검색 매칭용입니다."
    >
      <AdminAliasesTable rows={rows} />
    </AdminShellLayout>
  );
}
