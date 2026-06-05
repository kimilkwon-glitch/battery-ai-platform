import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminGuestOrdersPage() {
  const orders = await listOrderRequests({ limit: 500 });

  return (
    <AdminShellLayout
      title="비회원 주문 관리"
      description="비회원 주문 요청만 필터링합니다. 연락처 기준으로 확인·상담 안내합니다."
    >
      <AdminOrdersTable orders={orders} guestOnly />
    </AdminShellLayout>
  );
}
