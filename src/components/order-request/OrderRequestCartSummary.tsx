"use client";

import { BatteryGallery } from "@/components/BatteryGallery";
import { OrderPriceBreakdown } from "@/components/pricing/OrderPriceBreakdown";
import { batteryImageSetForCode } from "@/lib/battery-image";
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
import { formatPriceWon, resolveCartItemPrices } from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

function itemBatteryCode(item: BatteryCartItem): string | null {
  const spec = item.batterySpec?.trim();
  if (spec) return spec;
  const fromName = item.productName?.match(/\b[A-Z]{1,4}\d{2,3}[A-Z]{0,3}\b/i);
  return fromName?.[0]?.toUpperCase() ?? null;
}

type Props = {
  items: BatteryCartItem[];
  fulfillmentMethod?: OrderRequestFulfillmentMethod;
};

export function OrderRequestCartSummary({ items, fulfillmentMethod }: Props) {
  const showGallery = items.length === 1;
  const singleCode = showGallery ? itemBatteryCode(items[0]!) : null;
  const method = fulfillmentMethod ?? items[0]?.fulfillment.method;

  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-cart-summary">
      <h2 className="text-sm font-black text-slate-900">주문 상품</h2>

      {showGallery && singleCode ? (
        <BatteryGallery
          code={singleCode}
          imageSet={batteryImageSetForCode(singleCode)}
          minHeightClass="min-h-[200px] sm:min-h-[240px]"
        />
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const needsReview = checkoutItemNeedsReview(item);
          const fit = FITMENT_STATUS_LABELS[item.fitmentStatus];
          const ub =
            item.usedBatteryReturn.option === "undecided"
              ? null
              : USED_BATTERY_RETURN_LABELS[item.usedBatteryReturn.option];
          const fulfillment =
            method === "undecided"
              ? null
              : FULFILLMENT_METHOD_LABELS[method as keyof typeof FULFILLMENT_METHOD_LABELS];
          const prices = resolveCartItemPrices(item);

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
                <p className="text-xs font-black text-blue-700">
                  {formatCheckoutPrice(item, method)}
                </p>
              </div>
              <dl className="grid gap-1 text-[11px] font-medium text-slate-600 sm:grid-cols-2">
                <div>
                  <span className="font-bold text-slate-500">인터넷가 </span>
                  {formatPriceWon(prices.internetPrice)}
                </div>
                <div>
                  <span className="font-bold text-slate-500">출장가 </span>
                  {formatPriceWon(prices.onsitePrice)}
                </div>
                <div>
                  <span className="font-bold text-slate-500">단자 </span>
                  {formatCheckoutTerminal(item.terminalDirection)}
                </div>
                <div>
                  <span className="font-bold text-slate-500">차량 </span>
                  {formatCheckoutVehicle(item)}
                </div>
                {ub ? (
                  <div>
                    <span className="font-bold text-slate-500">폐전지 </span>
                    {ub.short}
                  </div>
                ) : null}
                {fulfillment ? (
                  <div>
                    <span className="font-bold text-slate-500">수령 </span>
                    {fulfillment}
                  </div>
                ) : null}
              </dl>
              {method && method !== "undecided" ? (
                <OrderPriceBreakdown item={item} fulfillmentMethod={method} compact />
              ) : null}
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
