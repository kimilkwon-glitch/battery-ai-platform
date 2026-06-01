import Link from "next/link";
import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { OrderRequestCompleteClient } from "@/components/order-request/OrderRequestCompleteClient";
import { ORDER_REQUEST_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function OrderRequestCompletePage() {
  return (
    <PageShell
      zone="support"
      pageLabel="접수 완료"
      title="상담 주문 요청 완료"
      description="입력하신 상담 요청 요약입니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href={ORDER_REQUEST_PAGE} className={`${bm.btnTertiary} text-xs`}>
          ← 상담 주문 요청
        </Link>
        <Suspense
          fallback={
            <div className="text-center text-sm text-slate-500">불러오는 중…</div>
          }
        >
          <OrderRequestCompleteClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
