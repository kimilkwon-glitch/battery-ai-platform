import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { OrderRequestForm } from "@/components/order-request/OrderRequestForm";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function OrderRequestPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="상담 주문"
      title="상담 주문 요청"
      description="장바구니 상품 기준으로 상담 요청을 남겨 주세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href={CHECKOUT_PAGE} className={`${bm.btnTertiary} text-xs`}>
          ← 주문 전 확인
        </Link>
        <OrderRequestForm />
      </div>
    </PageShell>
  );
}
