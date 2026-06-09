import "@/styles/checkout-order.css";
import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { CheckoutOrderPage } from "@/components/checkout/CheckoutOrderPage";

export default function CheckoutPage() {
  return (
    <PageShell
      zone="checkout"
      pageLabel="주문 및 결제"
      showPageHeader={false}
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto w-full max-w-6xl space-y-4 px-0 sm:px-1">
        <Suspense fallback={<ContentAreaFallback lines={4} />}>
          <CheckoutOrderPage />
        </Suspense>
      </div>
    </PageShell>
  );
}
