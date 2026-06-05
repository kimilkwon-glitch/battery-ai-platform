import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminCommerceOrdersTable } from "@/components/admin/AdminCommerceOrdersTable";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";

export default async function AdminCommerceOrdersPage() {
  const records = await storeCommerceOrderList(500);
  const orders = records.map(commerceOrderToListItem);

  return (
    <AdminShellLayout
      title="자사몰 결제 주문"
      description="결제 대기·준비 단계 주문 — PG 연동 후 결제 완료 정보가 함께 표시됩니다."
    >
      <AdminCommerceOrdersTable orders={orders} />
    </AdminShellLayout>
  );
}
