"use client";

import {
  FULFILLMENT_PRICE_LABELS,
  normalizeFulfillmentPriceType,
} from "@/lib/pricing/order-price";
import { BATTERY_RETURN_OPTIONS } from "@/lib/shop-order-types";
import { FULFILLMENT_METHOD_LABELS, USED_BATTERY_RETURN_LABELS } from "@/data/cart-flow-guide";
import type { BatteryCartItem, FulfillmentMethod, UsedBatteryReturnOption } from "@/types/cart";

const FULFILLMENT_OPTIONS: FulfillmentMethod[] = [
  "delivery",
  "visit_install",
  "store_install",
  "store_pickup_self",
];

type Props = {
  item: BatteryCartItem;
  onFulfillmentChange: (method: FulfillmentMethod) => void;
  onReturnChange: (option: UsedBatteryReturnOption) => void;
};

export function CartItemFulfillmentControls({
  item,
  onFulfillmentChange,
  onReturnChange,
}: Props) {
  const returnOpt = item.usedBatteryReturn.option;

  return (
    <div className="cart-item-controls space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div>
        <p className="text-[11px] font-black text-slate-700">수령/장착 방식</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {FULFILLMENT_OPTIONS.map((m) => {
            const active = item.fulfillment.method === m;
            const type = normalizeFulfillmentPriceType(m);
            const label =
              type !== "undecided" ? FULFILLMENT_PRICE_LABELS[type] : FULFILLMENT_METHOD_LABELS[m];
            return (
              <button
                key={m}
                type="button"
                onClick={() => onFulfillmentChange(m)}
                className={`min-h-[2.25rem] rounded-lg px-2.5 py-1.5 text-[10px] font-black ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-700">폐배터리 반납</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {BATTERY_RETURN_OPTIONS.map((opt) => {
            const mapped: UsedBatteryReturnOption =
              opt.id === "no-return" ? "no_return" : opt.id;
            const active = returnOpt === mapped;
            const label = USED_BATTERY_RETURN_LABELS[mapped]?.short ?? opt.label;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onReturnChange(mapped)}
                className={`min-h-[2.25rem] rounded-lg px-2.5 py-1.5 text-[10px] font-black ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
