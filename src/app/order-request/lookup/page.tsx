import Link from "next/link";
import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { OrderRequestLookupClient } from "@/components/order-request/OrderRequestLookupClient";
import { ORDER_REQUEST_COMPLETE_PAGE, ORDER_REQUEST_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function OrderRequestLookupPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="접수 조회"
      title="상담 주문 요청 조회"
      description="접수번호와 연락처로 상담 접수 상태를 확인합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link href={ORDER_REQUEST_PAGE} className={`${bm.btnTertiary} text-xs`}>
            ← 상담 주문 요청
          </Link>
          <Link href={ORDER_REQUEST_COMPLETE_PAGE} className={`${bm.btnTertiary} text-xs`}>
            접수 완료 화면
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="text-center text-sm text-slate-500">불러오는 중…</div>
          }
        >
          <OrderRequestLookupClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
