import { Suspense } from "react";
import { AdminOrderWorkbenchClient } from "@/components/admin/AdminOrderWorkbenchClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { commerceOrderAdminMetaListAll } from "@/lib/admin/commerce-order-admin-meta-store";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  countWorkbenchView,
} from "@/lib/admin/unified-orders";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const dbReady = isCommerceOrderStoreEnabled();
  const metaList = await commerceOrderAdminMetaListAll();
  const metaByOrderId = new Map(metaList.map((m) => [m.orderId, m]));

  let commerceOrders: ReturnType<typeof commerceOrderToListItem>[] = [];
  if (dbReady) {
    try {
      const records = await storeCommerceOrderList(500);
      commerceOrders = records.map(commerceOrderToListItem);
    } catch {
      commerceOrders = [];
    }
  }

  const consultations = await listOrderRequests({ limit: 500 });
  const rows = [
    ...commerceOrders.map((o) => commerceToUnifiedRow(o, metaByOrderId.get(o.orderId))),
    ...consultations.map(consultationToUnifiedRow),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AdminShellLayout
      title="주문 관리"
      description="발주확인·발송처리·배송완료를 목록에서 바로 처리하는 주문 작업대입니다."
      summary={[
        { label: "전체", value: rows.length },
        {
          label: "발주확인 대기",
          value: countWorkbenchView(rows, "confirm_pending"),
          tone: "warning",
        },
        { label: "배송준비", value: countWorkbenchView(rows, "shipping_prep") },
        { label: "배송중", value: countWorkbenchView(rows, "in_progress"), tone: "info" },
        { label: "비회원", value: rows.filter((r) => r.customerType === "guest").length },
      ]}
    >
      <Suspense fallback={<p className="text-xs text-slate-500">주문 작업대 불러오는 중…</p>}>
        <AdminOrderWorkbenchClient rows={rows} dbReady={dbReady} />
      </Suspense>
    </AdminShellLayout>
  );
}
