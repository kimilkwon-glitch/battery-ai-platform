import { Suspense } from "react";

import { AdminOrderWorkbenchClient } from "@/components/admin/AdminOrderWorkbenchClient";

import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

import { loadAdminWorkbenchRows } from "@/lib/admin/data/load-workbench-rows";
import { countWorkbenchView } from "@/lib/admin/unified-orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { productionRows, claimContext, dbReady } = await loadAdminWorkbenchRows();

  const count = (view: Parameters<typeof countWorkbenchView>[1]) =>
    countWorkbenchView(productionRows, view, "production", claimContext);



  return (

    <AdminShellLayout

      title="주문관리"

      description="신규 · 준비 · 배송/출장 · 취소요청 상태별로 주문을 처리합니다."

      frameClassName="admin-page-frame--orders admin-page-frame--workspace"

      summary={[

        { label: "신규주문", value: count("new_order"), tone: "warning" },

        { label: "상품준비", value: count("preparing"), tone: "info" },

        { label: "배송/출장중", value: count("in_progress"), tone: "info" },

        { label: "취소요청", value: count("cancel_request"), tone: "warning" },

      ]}

    >

      <Suspense fallback={<p className="text-xs text-slate-500">주문 작업대 불러오는 중…</p>}>

        <AdminOrderWorkbenchClient

          rows={productionRows}

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

