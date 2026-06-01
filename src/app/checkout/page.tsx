import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { CheckoutOrderPage } from "@/components/checkout/CheckoutOrderPage";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function CheckoutPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="주문 확인"
      title="주문 정보 확인"
      description="주문 전 상품과 차량 정보를 확인해 주세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href={CART_PAGE} className={`${bm.btnTertiary} text-xs`}>
          ← 장바구니
        </Link>
        <CheckoutOrderPage />
      </div>
    </PageShell>
  );
}
