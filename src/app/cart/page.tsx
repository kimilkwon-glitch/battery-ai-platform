import { PageShell } from "@/components/common/PageShell";
import { CartPageClient } from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="장바구니"
      title="장바구니"
      description="주문 전 차량·규격·폐전지 반납 여부를 확인하세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <CartPageClient />
      </div>
    </PageShell>
  );
}
