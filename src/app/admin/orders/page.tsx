import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrderRequests({ limit: 500 });

  return (
    <AdminShellLayout
      title="주문 관리"
      description="주문·결제 예정금액·수령 방식 통합 목록 — PG 연동 후 결제 상태가 함께 표시됩니다."
    >
      <AdminOrdersTable orders={orders} />
    </AdminShellLayout>
  );
}
