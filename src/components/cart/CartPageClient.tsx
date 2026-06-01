"use client";

import Link from "next/link";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import {
  CART_NEEDS_REVIEW_COPY,
  CART_ORDER_CHECKLIST,
  CART_USED_BATTERY_BOX_COPY,
} from "@/data/cart-flow-guide";
import {
  CHECKOUT_PAGE,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_HUB,
} from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export function CartPageClient() {
  const { items, summary, hydrated } = useBatteryCart();

  const showUsedBatteryBox = items.some(
    (i) =>
      i.usedBatteryReturn.option === "return" || i.usedBatteryReturn.option === "undecided",
  );

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
          <Link href="/shop" className={`${bm.btnSecondary} inline-flex justify-center text-sm`}>
            배터리 규격 보기
          </Link>
          <Link
            href={CUSTOMER_CENTER_ORDER_GUIDE}
            className={`${bm.btnTertiary} inline-flex justify-center text-sm`}
          >
            주문 전 체크리스트 보기
          </Link>
        </div>
      </div>
    );
  }

  const priceLabel =
    summary.subtotal > 0
      ? `${summary.estimatedTotal.toLocaleString()}원`
      : "상담 후 안내";

  return (
    <div className="cart-page space-y-5" data-page="cart">
      <section className={`${bm.card} ${bm.cardPad} border-blue-100/80 bg-gradient-to-br from-white to-blue-50/20`}>
        <h1 className="text-lg font-black text-slate-950 sm:text-xl">장바구니</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          주문 전 차량 정보, 배터리 규격, 폐전지 반납 여부를 다시 확인해 주세요.
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
            <dt className="text-slate-500">예상 상품 금액</dt>
            <dd className="text-base font-black text-blue-700">{priceLabel}</dd>
          </div>
        </dl>
        {summary.hasNoReturnItem ? (
          <p className="mt-2 text-[11px] font-medium text-slate-600">
            미반납 조건 상품이 포함되어 있습니다. 폐전지 회수가 없습니다.
          </p>
        ) : null}
        {summary.hasNeedsReviewItem ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-950 ring-1 ring-amber-200">
            확인이 필요한 항목이 있습니다. 아래 안내를 확인한 뒤 주문해 주세요.
          </p>
        ) : null}
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      {summary.hasNeedsReviewItem ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h2 className="text-sm font-black text-amber-950">{CART_NEEDS_REVIEW_COPY.title}</h2>
          <p className="mt-1 text-xs font-medium text-amber-900">{CART_NEEDS_REVIEW_COPY.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/photo-check" className={`${bm.btnSecondary} text-xs`}>
              사진 확인 먼저 하기
            </Link>
            <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnTertiary} text-xs`}>
              고객센터 문의
            </Link>
            <Link href="/order-checklist" className={`${bm.btnTertiary} text-xs`}>
              주문 전 체크리스트 보기
            </Link>
          </div>
        </section>
      ) : null}

      {showUsedBatteryBox ? (
        <section className={`${bm.card} ${bm.cardPad} border-emerald-100/80`}>
          <h2 className="text-sm font-black text-slate-900">{CART_USED_BATTERY_BOX_COPY.title}</h2>
          <p className="mt-1 text-xs font-medium text-slate-600">{CART_USED_BATTERY_BOX_COPY.body}</p>
          <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href={CART_USED_BATTERY_BOX_COPY.href}>
            {CART_USED_BATTERY_BOX_COPY.linkLabel} →
          </Link>
        </section>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">주문 전 체크리스트</h2>
        <ul className="mt-3 space-y-2">
          {CART_ORDER_CHECKLIST.map((line) => (
            <li
              key={line}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
            >
              <span className="size-4 shrink-0 rounded border-2 border-slate-300" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <div className="flex flex-wrap gap-2">
          <Link href="/shop" className={`${bm.btnTertiary} text-xs`}>
            계속 쇼핑하기
          </Link>
          <Link href="/photo-check" className={`${bm.btnSecondary} text-xs`}>
            사진 확인 먼저 하기
          </Link>
          <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} text-xs`}>
            주문하기
          </Link>
        </div>
        {summary.hasNeedsReviewItem ? (
          <p className="text-[11px] font-medium text-amber-800">
            확인 필요 항목이 있습니다. 주문 전 사진 확인 또는 상담을 권장합니다. 최종 확인
            페이지에서 다시 점검할 수 있습니다.
          </p>
        ) : (
          <p className="text-[11px] font-medium text-slate-500">
            주문하기를 누르면 결제 전 최종 확인 페이지로 이동합니다.
          </p>
        )}
      </section>
    </div>
  );
}
