"use client";

import { useMemo, useState } from "react";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import {
  FULFILLMENT_PRICE_DESCRIPTIONS,
  FULFILLMENT_PRICE_LABELS,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";
import { OrderPriceBreakdown } from "@/components/pricing/OrderPriceBreakdown";
import type { FulfillmentMethod } from "@/types/cart";
import type { BatteryReturnOption } from "@/lib/shop-order-types";

const METHODS: {
  value: FulfillmentMethod;
  priceType: Exclude<FulfillmentPriceType, "undecided">;
}[] = [
  { value: "delivery", priceType: "delivery" },
  { value: "visit_install", priceType: "onsite_install" },
  { value: "store_install", priceType: "store_install" },
  { value: "store_pickup_self", priceType: "store_pickup_self" },
];

type Props = {
  batteryCode: string;
  brandName?: string;
  returnOption: BatteryReturnOption;
  onFulfillmentChange?: (method: FulfillmentMethod) => void;
};

export function ProductFulfillmentPricePanel({
  batteryCode,
  brandName,
  returnOption,
  onFulfillmentChange,
}: Props) {
  const [method, setMethod] = useState<FulfillmentMethod>("delivery");

  const previewItem = useMemo(
    () =>
      createCartItemFromBattery({
        batteryCode,
        brandName,
        usedBatteryReturnOption: returnOption,
        source: "battery_detail",
        quantity: 1,
      }),
    [batteryCode, brandName, returnOption],
  );

  const selectMethod = (next: FulfillmentMethod) => {
    setMethod(next);
    onFulfillmentChange?.(next);
  };

  return (
    <div className="product-fulfillment-panel mt-4 space-y-3" data-product-fulfillment>
      <div>
        <p className="text-sm font-black text-slate-800">수령/장착 방식</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          선택에 따라 결제 예정금액이 즉시 반영됩니다.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => {
          const active = method === m.value;
          const label = FULFILLMENT_PRICE_LABELS[m.priceType];
          const desc = FULFILLMENT_PRICE_DESCRIPTIONS[m.priceType];
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => selectMethod(m.value)}
              className={`min-h-[3.25rem] rounded-xl px-3 py-2.5 text-left transition-colors ${
                active
                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                  : "bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="block text-xs font-black">{label}</span>
              <span
                className={`mt-0.5 block text-[10px] font-medium leading-snug ${
                  active ? "text-blue-50" : "text-slate-500"
                }`}
              >
                {desc}
              </span>
            </button>
          );
        })}
      </div>
      <OrderPriceBreakdown item={previewItem} fulfillmentMethod={method} />
      <p className="text-[10px] font-medium text-slate-500">
        배송지·방문 지점은 주문서 작성 단계에서 입력합니다.
      </p>
    </div>
  );
}
