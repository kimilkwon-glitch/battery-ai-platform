import { AdminShippingClient } from "@/components/admin/AdminShippingClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { loadAdminShippingSummary } from "@/lib/admin/data/shipping-summary";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const summary = await loadAdminShippingSummary();

  return (
    <AdminShellLayout
      title="배송관리"
      description="택배 주문의 송장등록·발송처리 대기 목록입니다. 경동택배 단일 사용 전제."
    >
      <div className="mt-4">
        <AdminShippingClient summary={summary} />
      </div>
    </AdminShellLayout>
  );
}
