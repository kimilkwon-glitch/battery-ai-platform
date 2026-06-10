import { Suspense } from "react";

import { AdminOrderWorkbenchClient } from "@/components/admin/AdminOrderWorkbenchClient";

import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

import { buildClaimWorkbenchContext } from "@/lib/admin/claim-dashboard-counts";

import {

  commerceToUnifiedRow,

  consultationToUnifiedRow,

  countWorkbenchView,

} from "@/lib/admin/unified-orders";

import { claimList } from "@/lib/claims/claim-store";

import { listOrderRequests } from "@/lib/order-request/order-request-service";

import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";

import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";



export const dynamic = "force-dynamic";



export default async function AdminOrdersPage() {

  const dbReady = isCommerceOrderStoreEnabled();

  let commerceOrders: Awaited<ReturnType<typeof storeCommerceOrderListItems>> = [];

  if (dbReady) {

    try {

      commerceOrders = await storeCommerceOrderListItems(200);

    } catch {

      commerceOrders = [];

    }

  }



  const [consultations, claims] = await Promise.all([
    listOrderRequests({ limit: 120 }),
    claimList({ limit: 120 }),
  ]);

  const claimContext = buildClaimWorkbenchContext(claims);



  const rows = [

    ...commerceOrders.map((o) => commerceToUnifiedRow(o)),

    ...consultations.map(consultationToUnifiedRow),

  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  const count = (view: Parameters<typeof countWorkbenchView>[1]) =>

    countWorkbenchView(rows, view, "production", claimContext);



  return (

    <AdminShellLayout

      title="주문관리"

      description="신규주문부터 발주확인, 상품준비, 배송/출장 처리까지 관리합니다."

      summary={[

        { label: "신규주문", value: count("new_order"), tone: "warning" },

        { label: "상품준비", value: count("preparing"), tone: "info" },

        { label: "배송/출장중", value: count("in_progress"), tone: "info" },

        { label: "취소요청", value: count("cancel_request"), tone: "warning" },

      ]}

    >

      <Suspense fallback={<p className="text-xs text-slate-500">주문 작업대 불러오는 중…</p>}>

        <AdminOrderWorkbenchClient

          rows={rows}

          dbReady={dbReady}

          claimContext={{

            cancelRequestOrderIds: [...claimContext.cancelRequestOrderIds],

            returnExchangeOrderIds: [...claimContext.returnExchangeOrderIds],

          }}

        />

      </Suspense>

    </AdminShellLayout>

  );

}

