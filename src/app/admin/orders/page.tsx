import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrderRequests({ limit: 500 });

  return (
    <AdminShellLayout
      title="주문 관리"
      description="상담 주문 요청 접수 목록 — 결제 완료가 아닌 주문 요청/상담 접수 기준입니다."
    >
      <AdminOrdersTable orders={orders} />
    </AdminShellLayout>
  );
}
