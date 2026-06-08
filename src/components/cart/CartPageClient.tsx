"use client";

import Link from "next/link";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import { OrderPriceTotalBar } from "@/components/pricing/OrderPriceBreakdown";
import { CART_NEEDS_REVIEW_COPY } from "@/data/cart-flow-guide";
import { clearBuyNowCheckoutItems } from "@/lib/cart/checkout-flow";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { buildLoginRedirectUrl } from "@/lib/customer-auth-redirect";
import { isCustomerLoggedIn } from "@/lib/customer-auth-session";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export function CartPageClient() {
  const { items, summary, hydrated } = useBatteryCart();
  const checkoutHref = isCustomerLoggedIn()
    ? `${CHECKOUT_PAGE}?flow=cart`
    : buildLoginRedirectUrl(`${CHECKOUT_PAGE}?flow=cart`);

  if (!hydrated) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center text-sm font-medium text-slate-500`}>
        장바구니를 불러오는 중…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`} data-cart-empty>
        <h2 className="text-lg font-black text-slate-950">장바구니가 비어 있습니다</h2>
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          차량에 맞는 배터리를 검색하거나, 배터리 규격을 확인한 뒤 상품을 담아보세요.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
            차량 배터리 검색하기
          </Link>
          <Link href="/search" className={`${bm.btnSecondary} inline-flex justify-center text-sm`}>
            배터리 규격 검색
          </Link>
        </div>
      </div>
    );
  }

  const priceLabel =
    summary.estimatedTotal > 0
      ? formatPriceWon(summary.estimatedTotal)
      : "수령 방식 선택 후 표시";

  return (
    <div className="cart-page space-y-5 pb-28 lg:pb-8" data-page="cart">
      <section className={`${bm.card} ${bm.cardPad} border-blue-100/80 bg-gradient-to-br from-white to-blue-50/20`}>
        <h1 className="text-lg font-black text-slate-950 sm:text-xl">장바구니</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          수령/장착 방식과 반납 여부를 확인한 뒤 주문서로 이동해 주세요.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">주문 요약</h2>
        <dl className="mt-3 grid gap-2 text-xs font-bold text-slate-700 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">담긴 상품</dt>
            <dd className="text-base font-black text-slate-900">{summary.itemCount}개</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">결제 예정금액</dt>
            <dd className="text-base font-black text-blue-700">{priceLabel}</dd>
          </div>
        </dl>
        {summary.hasUndecidedFulfillment ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-950 ring-1 ring-amber-200">
            수령/장착 방식이 선택되지 않은 상품이 있습니다. 각 상품에서 방식을 선택해 주세요.
          </p>
        ) : null}
        {summary.hasNeedsReviewItem ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-950 ring-1 ring-amber-200">
            확인이 필요한 항목이 있습니다. 주문서에서 다시 확인할 수 있습니다.
          </p>
        ) : null}
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      {summary.hasNeedsReviewItem ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950 ring-1 ring-amber-200">
          {CART_NEEDS_REVIEW_COPY.body}
        </p>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad} hidden space-y-3 lg:block`}>
        <OrderPriceTotalBar items={items} />
        <div className="flex flex-wrap gap-2">
          <Link href="/search" className={`${bm.btnTertiary} text-xs`}>
            배터리 검색
          </Link>
          <Link
            href={checkoutHref}
            className={`${bm.btnNavy} min-h-[3rem] flex-1 justify-center text-sm font-black sm:flex-none sm:px-8`}
            onClick={() => clearBuyNowCheckoutItems()}
          >
            주문서로 이동
          </Link>
        </div>
      </section>

      <div className="cart-page__sticky-total fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <OrderPriceTotalBar items={items} />
        <div className="mt-2 flex gap-2">
          <Link href="/search" className={`${bm.btnTertiary} flex-1 justify-center text-xs`}>
            검색
          </Link>
          <Link
            href={checkoutHref}
            className={`${bm.btnNavy} min-h-[2.75rem] flex-[2] justify-center text-sm font-black`}
            onClick={() => clearBuyNowCheckoutItems()}
          >
            주문서로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
