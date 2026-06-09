import { Suspense } from "react";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminCommerceOrdersClient } from "@/components/admin/AdminCommerceOrdersClient";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { isCommerceOrderStoreEnabled, isTossTestModeFlag } from "@/lib/payment/payment-config";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";

export default async function AdminCommerceOrdersPage() {
  const dbReady = isCommerceOrderStoreEnabled();
  const records = dbReady ? await storeCommerceOrderList(500) : [];
  const orders = records.map(commerceOrderToListItem);
  const testMode = isTossTestModeFlag();
  const paid = orders.filter((o) => o.paymentStatus === "completed").length;
  const failed = orders.filter((o) => o.paymentStatus === "failed").length;
  const canceled = orders.filter((o) => o.paymentStatus === "canceled").length;

  return (
    <AdminShellLayout
      title="자사몰 결제 주문"
      description="토스페이먼츠 연동 결제 주문을 확인합니다."
      summary={[
        { label: "전체", value: orders.length },
        { label: "결제완료", value: paid, tone: "info" },
        { label: "결제실패", value: failed, tone: failed > 0 ? "danger" : "default" },
        { label: "결제취소", value: canceled, tone: canceled > 0 ? "warning" : "default" },
      ]}
    >
      {!dbReady ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-900">
          DATABASE_URL이 설정되지 않았습니다. Postgres 저장소 연결 후 주문이 표시됩니다.
        </p>
      ) : null}
      {testMode ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-950">
          토스페이먼츠 테스트 키 모드 — 실제 카드 결제가 발생하지 않습니다.
        </p>
      ) : null}
      <Suspense fallback={<p className="text-xs text-slate-500">목록 불러오는 중…</p>}>
        <AdminCommerceOrdersClient orders={orders} />
      </Suspense>
    </AdminShellLayout>
  );
}
