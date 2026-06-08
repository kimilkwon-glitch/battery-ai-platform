import "@/styles/checkout-order.css";
import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { CheckoutReviewPage } from "@/components/checkout/CheckoutReviewPage";

export default function CheckoutReviewRoutePage() {
  return (
    <PageShell
      zone="checkout"
      pageLabel="주문 및 결제"
      title="주문 및 결제"
      description="주문 내용을 확인한 뒤 결제 수단을 선택해 주세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto w-full max-w-6xl space-y-4 px-0 sm:px-1">
        <Suspense fallback={<ContentAreaFallback lines={4} />}>
          <CheckoutReviewPage />
        </Suspense>
      </div>
    </PageShell>
  );
}
