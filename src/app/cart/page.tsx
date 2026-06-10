import { PageShell } from "@/components/common/PageShell";
import { CartPageClient } from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <PageShell
      zone="cart"
      pageLabel="장바구니"
      showPageHeader={false}
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <CartPageClient />
      </div>
    </PageShell>
  );
}
