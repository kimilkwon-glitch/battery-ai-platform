import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { CheckoutReviewPage } from "@/components/checkout/CheckoutReviewPage";

export default function CheckoutReviewRoutePage() {
  return (
    <PageShell
      zone="support"
      pageLabel="결제 전 확인"
      title="결제 전 최종 확인"
      description="주문 내용과 결제 예정금액을 마지막으로 확인합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <Suspense fallback={<ContentAreaFallback lines={4} />}>
          <CheckoutReviewPage />
        </Suspense>
      </div>
    </PageShell>
  );
}
