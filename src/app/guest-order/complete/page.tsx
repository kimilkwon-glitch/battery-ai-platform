import Link from "next/link";
import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { GuestOrderCompleteClient } from "@/components/guest-order/GuestOrderCompleteClient";
import { GUEST_ORDER_CHECK_PAGE } from "@/lib/guest-order/guest-order-routes";
import { bm } from "@/lib/design-tokens";

export default function GuestOrderCompletePage() {
  return (
    <PageShell
      zone="default"
      pageLabel="접수 완료"
      title="비회원 주문 요청 접수"
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <Suspense fallback={<p className="text-center text-sm text-slate-500">불러오는 중…</p>}>
          <GuestOrderCompleteClient />
        </Suspense>
        <Link href={GUEST_ORDER_CHECK_PAGE} className={`${bm.btnTertiary} inline-flex text-xs`}>
          주문 조회
        </Link>
      </div>
    </PageShell>
  );
}
