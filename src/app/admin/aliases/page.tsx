import { AdminAliasesTable } from "@/components/admin/AdminAliasesTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { buildAdminAliasRows } from "@/lib/admin/data/aliases-admin";

export default function AdminAliasesPage() {
  const rows = buildAdminAliasRows();
  const dupes = rows.filter((r) => r.duplicate).length;
  const unlinked = rows.filter((r) => r.unlinked).length;

  return (
    <AdminShellLayout
      title="검색어/별칭"
      description="차량 검색 별칭·중복·미연결 항목을 관리합니다."
      summary={[
        { label: "전체", value: rows.length },
        { label: "중복", value: dupes, tone: dupes > 0 ? "warning" : "default" },
        { label: "미연결", value: unlinked, tone: unlinked > 0 ? "danger" : "default" },
      ]}
    >
      <AdminAliasesTable rows={rows} />
    </AdminShellLayout>
  );
}
