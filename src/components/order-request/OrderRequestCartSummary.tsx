"use client";

import {
  FITMENT_STATUS_LABELS,
  FULFILLMENT_METHOD_LABELS,
  USED_BATTERY_RETURN_LABELS,
} from "@/data/cart-flow-guide";
import {
  checkoutItemNeedsReview,
  formatCheckoutPrice,
  formatCheckoutTerminal,
  formatCheckoutVehicle,
} from "@/lib/checkout/checkout-review";
import type { BatteryCartItem } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

export function OrderRequestCartSummary({ items }: { items: BatteryCartItem[] }) {
  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-cart-summary">
      <h2 className="text-sm font-black text-slate-900">주문 상품 요약</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const needsReview = checkoutItemNeedsReview(item);
          const fit = FITMENT_STATUS_LABELS[item.fitmentStatus];
          const ub = USED_BATTERY_RETURN_LABELS[item.usedBatteryReturn.option];
          const fulfillment = FULFILLMENT_METHOD_LABELS[item.fulfillment.method];

          return (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {item.productName?.trim() || "배터리 상품"}
                  </p>
                  <p className="text-xs font-bold text-slate-600">
                    {item.brandName ? `${item.brandName} · ` : ""}
                    {item.batterySpec || "규격 확인 필요"} · 수량 {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-black text-blue-700">{formatCheckoutPrice(item)}</p>
              </div>
              <dl className="grid gap-1 text-[11px] font-medium text-slate-600 sm:grid-cols-2">
                <div>
                  <span className="font-bold text-slate-500">단자 </span>
                  {formatCheckoutTerminal(item.terminalDirection)}
                </div>
                <div>
                  <span className="font-bold text-slate-500">차량 </span>
                  {formatCheckoutVehicle(item)}
                </div>
                <div>
                  <span className="font-bold text-slate-500">폐전지 </span>
                  {ub.short}
                </div>
                <div>
                  <span className="font-bold text-slate-500">수령 </span>
                  {fulfillment}
                </div>
              </dl>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-700 ring-1 ring-slate-200">
                  {fit.badge}
                </span>
                {needsReview ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-900 ring-1 ring-amber-200">
                    확인 필요
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
