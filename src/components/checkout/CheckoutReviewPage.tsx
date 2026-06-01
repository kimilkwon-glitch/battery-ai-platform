"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutItemReviewCard } from "@/components/checkout/CheckoutItemReviewCard";
import { CheckoutPolicyNotice } from "@/components/checkout/CheckoutPolicyNotice";
import { CheckoutSafetyChecklist } from "@/components/checkout/CheckoutSafetyChecklist";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import {
  CHECKOUT_PAGE_COPY,
  CHECKOUT_USED_BATTERY_NOTICES,
} from "@/data/checkout-checklist";
import { cartHasCheckoutReviewItems } from "@/lib/checkout/checkout-review";
import {
  CART_PAGE,
  ORDER_REQUEST_PAGE,
} from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export function CheckoutReviewPage() {
  const router = useRouter();
  const { items, summary, hydrated } = useBatteryCart();
  const [checklistComplete, setChecklistComplete] = useState(false);

  const hasReviewItems = cartHasCheckoutReviewItems(items);
  const hasReturnItems = items.some(
    (i) =>
      i.usedBatteryReturn.option === "return" || i.usedBatteryReturn.option === "undecided",
  );
  const hasNoReturnItems = items.some((i) => i.usedBatteryReturn.option === "no_return");

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace(CART_PAGE);
    }
  }, [hydrated, items.length, router]);

  if (!hydrated) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center text-sm font-medium text-slate-500`}>
        주문 정보를 불러오는 중…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-3 text-center`}>
        <p className="text-sm font-medium text-slate-600">장바구니가 비어 있습니다.</p>
        <Link href={CART_PAGE} className={`${bm.btnNavy} inline-flex text-sm`}>
          장바구니로 이동
        </Link>
      </div>
    );
  }

  const priceLabel =
    summary.subtotal > 0
      ? `${summary.estimatedTotal.toLocaleString()}원`
      : "상담 후 안내";

  return (
    <div className="checkout-review space-y-5 pb-28 md:pb-8" data-page="checkout">
      <section className={`${bm.card} ${bm.cardPad} border-blue-100/80 bg-gradient-to-br from-white to-blue-50/20`}>
        <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">
          결제 전 확인
        </p>
        <h1 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
          {CHECKOUT_PAGE_COPY.title}
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {CHECKOUT_PAGE_COPY.description}
        </p>
      </section>

      {hasReviewItems ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <h2 className="text-sm font-black text-amber-950">
            {CHECKOUT_PAGE_COPY.needsReviewTitle}
          </h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-amber-900">
            {CHECKOUT_PAGE_COPY.needsReviewBody}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/photo-check" className={`${bm.btnSecondary} text-xs`}>
              사진 확인 먼저 하기
            </Link>
            <Link href="/support" className={`${bm.btnTertiary} text-xs`}>
              고객센터 문의
            </Link>
            <Link href={CART_PAGE} className={`${bm.btnTertiary} text-xs`}>
              장바구니로 돌아가기
            </Link>
          </div>
        </section>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">주문 상품 확인</h2>
        <p className="mt-1 text-xs text-slate-500">
          {summary.itemCount}개 · 예상 {priceLabel}
        </p>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <CheckoutItemReviewCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">차량·규격 요약</h2>
        <ul className="mt-2 space-y-2 text-xs font-medium text-slate-700">
          {items.map((item) => (
            <li
              key={`sum-${item.id}`}
              className="rounded-lg bg-slate-50 px-3 py-2"
            >
              <span className="font-black text-slate-900">
                {item.batterySpec || "규격 확인 필요"}
              </span>
              {" — "}
              {item.vehicle?.displayName ?? "차량 정보 미입력"}
            </li>
          ))}
        </ul>
      </section>

      {(hasReturnItems || hasNoReturnItems) && (
        <section className="space-y-3" id="checkout-used-battery">
          <h2 className="text-sm font-black text-slate-900 px-0.5">폐전지 반납 여부 확인</h2>
          {hasReturnItems ? (
            <div className={`${bm.card} ${bm.cardPad} border-emerald-100/80`}>
              <h3 className="text-xs font-black text-emerald-900">
                {CHECKOUT_USED_BATTERY_NOTICES.return.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-600">
                {CHECKOUT_USED_BATTERY_NOTICES.return.body}
              </p>
              <Link
                href={CHECKOUT_USED_BATTERY_NOTICES.return.href}
                className={`${bm.btnTertiary} mt-3 inline-flex text-xs`}
              >
                {CHECKOUT_USED_BATTERY_NOTICES.return.linkLabel} →
              </Link>
            </div>
          ) : null}
          {hasNoReturnItems ? (
            <div className={`${bm.card} ${bm.cardPad}`}>
              <h3 className="text-xs font-black text-slate-800">
                {CHECKOUT_USED_BATTERY_NOTICES.noReturn.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-600">
                {CHECKOUT_USED_BATTERY_NOTICES.noReturn.body}
              </p>
              <Link
                href={CHECKOUT_USED_BATTERY_NOTICES.noReturn.href}
                className={`${bm.btnTertiary} mt-3 inline-flex text-xs`}
              >
                {CHECKOUT_USED_BATTERY_NOTICES.noReturn.linkLabel} →
              </Link>
            </div>
          ) : null}
        </section>
      )}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">수령·설치 방식 확인</h2>
        <ul className="mt-2 space-y-1.5 text-xs font-bold text-slate-700">
          {items.map((item) => (
            <li key={`ful-${item.id}`}>
              {item.productName || "배터리 상품"}:{" "}
              {item.fulfillment.method === "undecided"
                ? "수령 방식 미선택"
                : item.fulfillment.method === "delivery"
                  ? "택배 배송"
                  : item.fulfillment.method === "store_pickup"
                    ? `매장 방문${item.fulfillment.storeId ? ` (${item.fulfillment.storeId})` : ""}`
                    : "출장 교체"}
            </li>
          ))}
        </ul>
        <Link href={CART_PAGE} className="mt-3 inline-block text-[11px] font-bold text-blue-700 hover:underline">
          장바구니에서 수령 방식 수정 →
        </Link>
      </section>

      <CheckoutSafetyChecklist onAllRequiredCheckedChange={setChecklistComplete} />

      <CheckoutPolicyNotice />

      <section
        className={`${bm.card} ${bm.cardPad} fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl rounded-b-none border-x-0 border-b-0 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:static md:max-w-none md:rounded-[22px] md:border md:shadow-[var(--bm-shadow-sm)]`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={CART_PAGE} className={`${bm.btnTertiary} justify-center text-xs`}>
            장바구니로 돌아가기
          </Link>
          <Link href="/photo-check" className={`${bm.btnSecondary} justify-center text-xs`}>
            사진 확인 먼저 하기
          </Link>
          <Link
            href={ORDER_REQUEST_PAGE}
            className={`${bm.btnNavy} justify-center text-xs ring-2 ring-blue-200`}
          >
            {CHECKOUT_PAGE_COPY.consultCtaLabel}
          </Link>
          <Link
            href={ORDER_REQUEST_PAGE}
            className={`${bm.btnSecondary} justify-center text-xs ${
              !checklistComplete ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={!checklistComplete}
            tabIndex={checklistComplete ? 0 : -1}
            onClick={(e) => {
              if (!checklistComplete) e.preventDefault();
            }}
          >
            주문 요청하기
          </Link>
        </div>
        {hasReviewItems ? (
          <p className="mt-2 text-[10px] font-medium text-amber-800">
            확인 필요 항목이 있습니다. 주문 전 사진 확인 또는 상담을 권장합니다.
          </p>
        ) : null}
      </section>

    </div>
  );
}
