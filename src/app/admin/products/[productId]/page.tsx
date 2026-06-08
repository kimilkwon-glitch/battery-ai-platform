import { notFound } from "next/navigation";
import { AdminProductEditClient } from "@/components/admin/AdminProductEditClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import {
  getAdminProductDetail,
  pathSegmentToProductId,
} from "@/lib/admin/products/products-admin-service";
import { loadProductPriceHistory } from "@/lib/admin/products/product-overrides-store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ productId: string }> };

export default async function AdminProductDetailPage({ params }: Props) {
  const { productId: segment } = await params;
  const productId = pathSegmentToProductId(segment);
  const detail = getAdminProductDetail(productId);
  if (!detail) notFound();

  const priceHistory = loadProductPriceHistory(productId);

  return (
    <AdminShellLayout
      title="제품 편집"
      description={`${detail.brandLabel} ${detail.batteryCode} — 가격·상품명·상세·검수`}
    >
      <AdminProductEditClient initial={detail} priceHistory={priceHistory} />
    </AdminShellLayout>
  );
}
