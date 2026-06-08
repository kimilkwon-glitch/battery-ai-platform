import Link from "next/link";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { AdminProductsToolbar } from "@/components/admin/AdminProductsToolbar";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      description="배터리 상품·가격·상세·검수 — 카탈로그 기준 + 관리자 오버라이드(JSON)"
    >
      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="가격 누락"
          value={counts.price_missing}
          href={`${ADMIN_ROUTES.products}?review=price_missing`}
          tone="danger"
        />
        <AdminStatCard
          label="이미지 누락"
          value={counts.image_missing}
          href={`${ADMIN_ROUTES.products}?review=image_missing`}
          tone="warning"
        />
        <AdminStatCard
          label="상세페이지 없음"
          value={counts.detail_missing}
          href={`${ADMIN_ROUTES.products}?review=detail_missing`}
          tone="warning"
        />
        <AdminStatCard
          label="검수 필요"
          value={counts.needs_review}
          href={ADMIN_ROUTES.products}
          tone="info"
        />
      </section>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">표기 원칙</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600">
          <p>· 로케트 일반 배터리: GB 표기 (예: GB80L) — CMF로 표기하지 않음</p>
          <p>· 쏠라이트 일반 배터리: CMF 표기 (예: CMF80L) — GB로 표기하지 않음</p>
          <p>
            · 수령/장착 방식별 가격은 인터넷가·출장가에서 자동 계산 (
            <Link href="/admin/products" className="text-blue-700 hover:underline">
              공통 계산식
            </Link>
            )
          </p>
        </CardContent>
      </Card>

      <AdminProductsToolbar />

      <div className="mt-4">
        <AdminProductsTable rows={rows} />
      </div>
    </AdminShellLayout>
  );
}
