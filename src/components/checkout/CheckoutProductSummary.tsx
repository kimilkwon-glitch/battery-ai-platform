"use client";

import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { batteryImageSetForCode } from "@/lib/battery-image";
import {
  formatCheckoutPrice,
  formatCheckoutTerminal,
  formatCheckoutVehicle,
} from "@/lib/checkout/checkout-review";
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
  const fulfillmentLabel =
    method && method !== "undecided"
      ? FULFILLMENT_METHOD_LABELS[method as keyof typeof FULFILLMENT_METHOD_LABELS]
      : null;

  const imageSet = code ? batteryImageSetForCode(code) : undefined;

  return (
    <section className={`checkout-product-summary ${bm.card} ${bm.cardPad}`} id="checkout-product-summary">
      <h2 className="text-sm font-black text-slate-900">주문 상품</h2>

      {primary ? (
        <div className="checkout-product-summary__body mt-3 flex gap-3">
          {code && imageSet?.main ? (
            <div className="checkout-product-summary__thumb h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100 sm:h-[5rem] sm:w-[5rem]">
              <BatteryThumbnail
                code={code}
                imageSet={imageSet}
                role="main"
                fit="contain"
                overlayLabel={false}
                surface="transparent"
                className="h-full w-full"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-black text-slate-950 sm:text-base">
              {primary.brandName ? `${primary.brandName} ` : ""}
              {primary.batterySpec || "배터리"}
            </p>
            <p className="text-xs font-semibold text-slate-600">
              {primary.productName?.trim() || "차량용 배터리"}
            </p>
            <dl className="checkout-product-summary__meta space-y-1 text-xs text-slate-600">
              {fulfillmentLabel ? (
                <div className="flex justify-between gap-2">
                  <dt className="font-bold text-slate-500">수령/장착</dt>
                  <dd className="font-black text-slate-800">{fulfillmentLabel}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-2">
                <dt className="font-bold text-slate-500">단자</dt>
                <dd>{formatCheckoutTerminal(primary.terminalDirection)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-bold text-slate-500">차량</dt>
                <dd className="text-right">{formatCheckoutVehicle(primary)}</dd>
              </div>
            </dl>
            <p className="hidden text-sm font-black tabular-nums text-slate-950 sm:block">
              결제금액: {formatCheckoutPrice(primary, method)}
            </p>
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
