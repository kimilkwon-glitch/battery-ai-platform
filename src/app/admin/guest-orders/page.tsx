import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminGuestOrdersPage() {
  const orders = await listOrderRequests({ limit: 500 });
  const guests = orders.filter((o) => o.customerType === "guest");
  const pending = guests.filter(
    (o) => o.status === "pending_review" || o.status === "waiting_customer",
  ).length;
  const done = guests.filter((o) => o.status === "closed" || o.status === "quoted").length;

  return (
    <AdminShellLayout
      title="비회원 주문"
      description="비회원 접수 건만 모아 확인·상담합니다."
      summary={[
        { label: "전체", value: guests.length },
        { label: "처리 대기", value: pending, tone: pending > 0 ? "warning" : "default" },
        { label: "완료/예약", value: done, tone: "info" },
      ]}
    >
      <AdminOrdersTable orders={orders} guestOnly />
    </AdminShellLayout>
  );
}
