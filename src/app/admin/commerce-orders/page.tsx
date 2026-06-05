import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminCommerceOrdersTable } from "@/components/admin/AdminCommerceOrdersTable";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { isTossTestModeFlag } from "@/lib/payment/payment-config";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";

export default async function AdminCommerceOrdersPage() {
  const records = await storeCommerceOrderList(500);
  const orders = records.map(commerceOrderToListItem);
  const testMode = isTossTestModeFlag();

  return (
    <AdminShellLayout
      title="자사몰 결제 주문"
      description="토스페이먼츠 연동 주문 — 결제완료·결제실패 상태가 함께 표시됩니다."
    >
      {testMode ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-950">
          토스페이먼츠 테스트 키 모드 — 실제 카드 결제가 발생하지 않습니다.
        </p>
      ) : null}
      <AdminCommerceOrdersTable orders={orders} />
    </AdminShellLayout>
  );
}
