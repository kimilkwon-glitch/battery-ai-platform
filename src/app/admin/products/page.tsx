import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { AdminProductsToolbar } from "@/components/admin/AdminProductsToolbar";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  buildAdminProductRows,
  countProductsByReview,
} from "@/lib/admin/products/products-admin-service";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const rows = buildAdminProductRows();
  const counts = countProductsByReview(rows);

  return (
    <AdminShellLayout
      title="제품 관리"
      description="배터리 상품 가격·이미지·상세·검수 상태를 관리합니다."
      summary={[
        { label: "전체", value: rows.length },
        {
          label: "가격 누락",
          value: counts.price_missing,
          tone: "danger",
          href: `${ADMIN_ROUTES.products}?review=price_missing`,
        },
        {
          label: "이미지 누락",
          value: counts.image_missing,
          tone: "warning",
          href: `${ADMIN_ROUTES.products}?review=image_missing`,
        },
        {
          label: "검수 필요",
          value: counts.needs_review,
          tone: counts.needs_review > 0 ? "warning" : "default",
        },
      ]}
    >
      <p className="mb-3 text-xs font-medium text-slate-500">
        로케트 GB · 쏠라이트 CMF 표기 원칙을 확인하세요.
      </p>
      <AdminProductsToolbar />
      <div className="mt-4">
        <AdminProductsTable rows={rows} />
      </div>
    </AdminShellLayout>
  );
}
