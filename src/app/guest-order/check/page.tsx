import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { GuestOrderCheckClient } from "@/components/guest-order/GuestOrderCheckClient";

export default function GuestOrderCheckPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="주문 조회"
      title="비회원 주문 조회"
      description="주문번호와 연락처로 접수 상태를 확인합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <Suspense fallback={<p className="text-center text-sm text-slate-500">불러오는 중…</p>}>
          <GuestOrderCheckClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
