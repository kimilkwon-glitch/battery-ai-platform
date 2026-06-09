import { Suspense } from "react";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { AdminProductsToolbar } from "@/components/admin/AdminProductsToolbar";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { buildAdminProductRows } from "@/lib/admin/products/products-admin-service";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const rows = buildAdminProductRows();

  return (
    <AdminShellLayout
      title="제품 관리"
      description="배터리 상품 가격·이미지·상세·검수 상태를 관리합니다."
    >
      <AdminProductsToolbar />
      <div className="mt-4">
        <Suspense fallback={<p className="text-sm text-slate-500">제품 목록 불러오는 중…</p>}>
          <AdminProductsTable rows={rows} />
        </Suspense>
      </div>
    </AdminShellLayout>
  );
}
