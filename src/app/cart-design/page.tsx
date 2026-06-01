import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { CartDesignPreview } from "@/components/cart/CartDesignPreview";
import { CART_DESIGN_COPY } from "@/data/cart-flow-guide";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function CartDesignPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="장바구니 설계"
      title={CART_DESIGN_COPY.pageTitle}
      description={CART_DESIGN_COPY.pageDescription}
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnTertiary} text-xs`}>
          ← 고객센터
        </Link>
        <CartDesignPreview />
      </div>
    </PageShell>
  );
}
