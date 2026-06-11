import { AdminShippingClient } from "@/components/admin/AdminShippingClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { loadAdminShippingSummary } from "@/lib/admin/data/shipping-summary";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const summary = await loadAdminShippingSummary();

  return (
    <AdminShellLayout
      title="배송관리"
      description="택배 주문 송장등록·발송처리 대기 목록"
      frameClassName="admin-page-frame--workspace admin-page-frame--shipping"
    >
      <AdminShippingClient summary={summary} />
    </AdminShellLayout>
  );
}
