"use client";

import { BatteryGallery } from "@/components/BatteryGallery";
import { OrderPriceBreakdown } from "@/components/pricing/OrderPriceBreakdown";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { batteryImageSetForCode } from "@/lib/battery-image";
import {
  formatCheckoutPrice,
  formatCheckoutTerminal,
  formatCheckoutVehicle,
} from "@/lib/checkout/checkout-review";
import { formatPriceWon, resolveCartItemPrices } from "@/lib/pricing/order-price";
import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
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

export function CheckoutProductSummary({ items, fulfillmentMethod }: Props) {
  const method = fulfillmentMethod ?? items[0]?.fulfillment.method;
  const primary = items[0];
  const code = primary ? itemBatteryCode(primary) : null;
  const prices = primary ? resolveCartItemPrices(primary) : null;
  const fulfillmentLabel =
    method && method !== "undecided"
      ? FULFILLMENT_METHOD_LABELS[method as keyof typeof FULFILLMENT_METHOD_LABELS]
      : null;

  return (
    <section className={`${bm.card} ${bm.cardPad}`} id="checkout-product-summary">
      <h2 className="text-sm font-black text-slate-900">주문 상품</h2>

      {primary ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          {code ? (
            <div className="mx-auto w-full shrink-0 sm:mx-0 sm:w-[140px] lg:w-[160px]">
              <BatteryGallery
                code={code}
                imageSet={batteryImageSetForCode(code)}
                minHeightClass="min-h-[120px] sm:min-h-[140px]"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-base font-black text-slate-950 lg:text-lg">
                {primary.brandName ? `${primary.brandName} ` : ""}
                {primary.batterySpec || "배터리"}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">
                {primary.productName?.trim() || "차량용 배터리"}
                {primary.batterySpec ? ` · ${primary.batterySpec}` : ""}
              </p>
            </div>

            <dl className="grid gap-1.5 text-xs font-medium text-slate-600 sm:grid-cols-2">
              {prices ? (
                <div>
                  <dt className="font-bold text-slate-500">대표 제원</dt>
                  <dd className="font-black text-slate-800">
                    {CUSTOMER_PRICE_LABELS.productPurchase} {formatPriceWon(prices.internetPrice)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="font-bold text-slate-500">단자</dt>
                <dd>{formatCheckoutTerminal(primary.terminalDirection)}</dd>
              </div>
              {fulfillmentLabel ? (
                <div>
                  <dt className="font-bold text-slate-500">수령 방식</dt>
                  <dd className="font-black text-slate-900">{fulfillmentLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-bold text-slate-500">차량</dt>
                <dd>{formatCheckoutVehicle(primary)}</dd>
              </div>
            </dl>

            <p className="text-lg font-black tabular-nums text-slate-950">
              결제금액: {formatCheckoutPrice(primary, method)}
            </p>

            {method && method !== "undecided" ? (
              <OrderPriceBreakdown item={primary} fulfillmentMethod={method} compact />
            ) : null}
          </div>
        </div>
      ) : null}

      {items.length > 1 ? (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {items.slice(1).map((item) => (
            <li key={item.id} className="text-xs font-bold text-slate-700">
              {item.productName} · {item.batterySpec} · 수량 {item.quantity}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
