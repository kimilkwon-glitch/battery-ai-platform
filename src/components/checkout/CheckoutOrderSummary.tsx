"use client";

import Link from "next/link";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { UsedBatteryFormSelection } from "@/lib/order-request/order-request-form-helpers";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillment } from "@/types/order-request";

type Props = {
  items: BatteryCartItem[];
  fulfillment: OrderRequestFulfillment;
  usedBattery: UsedBatteryFormSelection;
  totalAmount: number | null;
  optionsComplete: boolean;
  isBuyNow: boolean;
};

function resolveChangeOptionsHref(items: BatteryCartItem[], isBuyNow: boolean): string {
  const primary = items[0];
  if (!primary) return isBuyNow ? "/" : CART_PAGE;
  const code = primary.batterySpec?.trim();
  if (code) {
    const href = batteryDetailHref(code);
    if (href) return href;
    return `/batteries/${encodeURIComponent(code)}`;
  }
  return isBuyNow ? "/" : CART_PAGE;
}

export function CheckoutOrderSummary({
  items,
  fulfillment,
  usedBattery,
  totalAmount,
  optionsComplete,
  isBuyNow,
}: Props) {
  const primary = items[0];
  const changeHref = resolveChangeOptionsHref(items, isBuyNow);
  const fulfillmentLabel =
    fulfillment.method && fulfillment.method !== "undecided"
      ? FULFILLMENT_METHOD_LABELS[fulfillment.method]
      : null;
  const returnLabel =
    usedBattery === "return" ? "반납" : usedBattery === "no_return" ? "미반납" : null;

  return (
    <section className="checkout-order-summary rounded-2xl border border-slate-200 bg-white p-4" data-checkout-section="order-summary">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-black text-slate-900">주문 요약</h2>
        <Link
          href={changeHref}
          className="shrink-0 text-xs font-black text-blue-700 underline underline-offset-2"
        >
          옵션 변경하기
        </Link>
      </div>

      {!optionsComplete ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 ring-1 ring-amber-100">
          선택 정보 확인 필요 — 이전 단계에서 수령 방식과 폐배터리 반납을 선택해 주세요.
        </p>
      ) : null}

      {primary ? (
        <dl className="checkout-order-summary__rows mt-3 space-y-2 text-sm">
          <div className="checkout-order-summary__row flex items-start justify-between gap-3">
            <dt className="shrink-0 font-bold text-slate-500">상품</dt>
            <dd className="min-w-0 text-right font-black text-slate-900">
              {primary.brandName ? `${primary.brandName} ` : ""}
              {primary.batterySpec || primary.productName}
            </dd>
          </div>
          <div className="checkout-order-summary__row flex items-start justify-between gap-3">
            <dt className="shrink-0 font-bold text-slate-500">수령/장착</dt>
            <dd className="min-w-0 text-right font-black text-slate-900">
              {fulfillmentLabel ?? "—"}
            </dd>
          </div>
          <div className="checkout-order-summary__row flex items-start justify-between gap-3">
            <dt className="shrink-0 font-bold text-slate-500">폐배터리</dt>
            <dd className="min-w-0 text-right font-black text-slate-900">
              {returnLabel ?? "—"}
            </dd>
          </div>
          <div className="checkout-order-summary__row flex items-start justify-between gap-3 border-t border-slate-100 pt-2">
            <dt className="shrink-0 font-bold text-slate-700">총 결제금액</dt>
            <dd className="min-w-0 text-right text-base font-black tabular-nums text-slate-950">
              {totalAmount != null ? formatPriceWon(totalAmount) : "—"}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
