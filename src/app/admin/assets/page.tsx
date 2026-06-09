import { AdminAssetsTable } from "@/components/admin/AdminAssetsTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { buildAdminAssetRows } from "@/lib/admin/data/assets-admin";

export default function AdminAssetsPage() {
  const rows = buildAdminAssetRows();
  const missing = rows.filter((r) => r.missing).length;

  return (
    <AdminShellLayout
      title="이미지/에셋"
      description="파일 존재 여부와 사용 영역을 점검합니다."
      summary={[
        { label: "전체", value: rows.length },
        { label: "누락", value: missing, tone: missing > 0 ? "danger" : "default" },
        { label: "정상", value: rows.length - missing, tone: "info" },
      ]}
    >
      <AdminAssetsTable rows={rows} />
    </AdminShellLayout>
  );
}
