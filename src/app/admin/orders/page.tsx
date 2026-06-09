import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrderRequests({ limit: 500 });
  const pending = orders.filter(
    (o) => o.status === "pending_review" || o.status === "waiting_customer",
  ).length;
  const done = orders.filter((o) => o.status === "closed" || o.status === "quoted").length;

  return (
    <AdminShellLayout
      title="주문 관리"
      description="접수·확인·완료 상태를 한 목록에서 관리합니다."
      summary={[
        { label: "전체", value: orders.length },
        { label: "처리 대기", value: pending, tone: pending > 0 ? "warning" : "default" },
        { label: "완료/예약", value: done, tone: "info" },
        { label: "비회원", value: orders.filter((o) => o.customerType === "guest").length },
      ]}
    >
      <AdminOrdersTable orders={orders} />
    </AdminShellLayout>
  );
}
