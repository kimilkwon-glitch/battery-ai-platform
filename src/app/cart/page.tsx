import { PageShell } from "@/components/common/PageShell";
import { CartPageClient } from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="장바구니"
      title="장바구니"
      description="담긴 상품과 수량·금액을 확인한 뒤 주문을 진행하세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <CartPageClient />
      </div>
    </PageShell>
  );
}
