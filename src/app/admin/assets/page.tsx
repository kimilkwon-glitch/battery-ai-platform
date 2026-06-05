import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminAssetsTable } from "@/components/admin/AdminAssetsTable";
import { buildAdminAssetRows } from "@/lib/admin/data/assets-admin";

export default function AdminAssetsPage() {
  const rows = buildAdminAssetRows();

  return (
    <AdminShellLayout
      title="이미지/에셋 관리"
      description="파일 존재 여부와 표시 영역 기준을 분리해 점검합니다."
    >
      <AdminAssetsTable rows={rows} />
    </AdminShellLayout>
  );
}
