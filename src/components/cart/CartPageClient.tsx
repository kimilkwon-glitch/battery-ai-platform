"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import { getCartItems, getCartSummary } from "@/lib/cart/cart-storage";
import { CART_EMPTY_COPY, CART_PAGE_COPY } from "@/data/checkout-checklist";
import { CART_NEEDS_REVIEW_COPY } from "@/data/cart-flow-guide";
import { clearBuyNowCheckoutItems } from "@/lib/cart/checkout-flow";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export function CartPageClient() {
  const pathname = usePathname();
  const { items, summary, hydrated, refresh } = useBatteryCart();
  const checkoutHref = `${CHECKOUT_PAGE}?flow=cart`;

  useEffect(() => {
    if (pathname === "/cart") refresh();
  }, [pathname, refresh]);

  const displayItems = useMemo(() => {
    if (items.length > 0) return items;
    if (!hydrated) return [];
    return getCartItems();
  }, [items, hydrated]);

  const displaySummary = useMemo(
    () => (displayItems === items ? summary : getCartSummary(displayItems)),
    [displayItems, items, summary],
  );

  if (!hydrated) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center text-sm font-medium text-slate-500`}>
        장바구니를 불러오는 중…
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`} data-page="cart" data-cart-empty>
        <h2 className="text-lg font-black text-slate-950">{CART_EMPTY_COPY.title}</h2>
        <p className="text-sm font-medium leading-relaxed text-slate-600">{CART_EMPTY_COPY.body}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
            {CART_EMPTY_COPY.vehicleCta}
          </Link>
          <Link href="/search" className={`${bm.btnSecondary} inline-flex justify-center text-sm`}>
            {CART_EMPTY_COPY.specCta}
          </Link>
        </div>
      </div>
    );
  }

  const priceLabel =
    displaySummary.estimatedTotal > 0
      ? formatPriceWon(displaySummary.estimatedTotal)
      : "수령 방식 선택 후 표시";

  return (
    <div
      className="cart-page space-y-4 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:space-y-5 lg:pb-8"
      data-page="cart"
    >
      <section className={`cart-page__summary ${bm.card} ${bm.cardPad}`} data-cart-section="summary">
        <h1 className="text-lg font-black text-slate-950 sm:text-xl">{CART_PAGE_COPY.title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">{CART_PAGE_COPY.subtitle}</p>

        <dl className="mt-4 grid gap-2 text-xs font-bold text-slate-700 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">담긴 상품</dt>
            <dd className="text-base font-black text-slate-900">{displaySummary.itemCount}개</dd>
          </div>
          <div className="rounded-lg bg-blue-50/60 px-3 py-2 ring-1 ring-blue-100">
            <dt className="text-slate-500">결제 예정금액</dt>
            <dd className="text-base font-black text-blue-700">{priceLabel}</dd>
          </div>
        </dl>

        <p className="mt-2 text-[11px] font-medium text-slate-500">{CART_PAGE_COPY.fulfillmentHint}</p>

        {displaySummary.hasUndecidedFulfillment ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-950 ring-1 ring-amber-200">
            수령/장착 방식이 선택되지 않은 상품이 있습니다. 주문서에서도 선택할 수 있습니다.
          </p>
        ) : null}

        {displaySummary.hasNeedsReviewItem ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-950 ring-1 ring-amber-200">
            확인이 필요한 항목이 있습니다. 주문서에서 다시 확인할 수 있습니다.
          </p>
        ) : null}
      </section>

      <div className="space-y-4" data-cart-section="items">
        {displayItems.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      {displaySummary.hasNeedsReviewItem ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950 ring-1 ring-amber-200">
          {CART_NEEDS_REVIEW_COPY.body}
        </p>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad} hidden space-y-3 lg:block`}>
        <div className="flex flex-wrap gap-2">
          <Link href="/search" className={`${bm.btnTertiary} text-xs`}>
            {CART_PAGE_COPY.continueCta}
          </Link>
          <Link
            href={checkoutHref}
            className={`${bm.btnNavy} min-h-[3rem] flex-1 justify-center text-sm font-black sm:flex-none sm:px-8`}
            onClick={() => clearBuyNowCheckoutItems()}
          >
            {CART_PAGE_COPY.checkoutCta}
          </Link>
        </div>
      </section>

      <div className="cart-page__sticky-total fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/98 p-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
          <span className="text-xs font-bold text-slate-500">총 결제금액</span>
          <span className="text-base font-black tabular-nums text-slate-950">{priceLabel}</span>
        </div>
        <div className="flex gap-2">
          <Link href="/search" className={`${bm.btnTertiary} flex-1 justify-center text-xs`}>
            {CART_PAGE_COPY.continueCta}
          </Link>
          <Link
            href={checkoutHref}
            className={`${bm.btnNavy} min-h-[2.75rem] flex-[2] justify-center text-sm font-black`}
            onClick={() => clearBuyNowCheckoutItems()}
          >
            {CART_PAGE_COPY.checkoutCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
