import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { CheckoutReviewPage } from "@/components/checkout/CheckoutReviewPage";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function CheckoutPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="주문 확인"
      title="주문 전 최종 확인"
      description="결제 전 차량·규격·폐전지·입금 정책을 다시 확인하세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href={CART_PAGE} className={`${bm.btnTertiary} text-xs`}>
          ← 장바구니
        </Link>
        <CheckoutReviewPage />
      </div>
    </PageShell>
  );
}
