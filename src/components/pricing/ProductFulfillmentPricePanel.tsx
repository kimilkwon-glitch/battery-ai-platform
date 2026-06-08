"use client";

import { useMemo } from "react";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import {
  computeLineAmountWithReturnFee,
  formatPriceWon,
  FULFILLMENT_PRICE_DESCRIPTIONS,
  FULFILLMENT_PRICE_LABELS,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";
import { OrderPriceBreakdown } from "@/components/pricing/OrderPriceBreakdown";
import type { FulfillmentMethod } from "@/types/cart";
import {
  mapShopReturnOptionToUsedBattery,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";

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
  fulfillmentMethod?: FulfillmentMethod;
  onFulfillmentChange?: (method: FulfillmentMethod) => void;
};

export function ProductFulfillmentPricePanel({
  batteryCode,
  brandName,
  returnOption,
  fulfillmentMethod: controlledMethod,
  onFulfillmentChange,
}: Props) {
  const method = controlledMethod ?? "delivery";

  const previewItem = useMemo(
    () =>
      createCartItemFromBattery({
        batteryCode,
        brandName,
        usedBatteryReturnOption: returnOption,
        fulfillmentMethod: method,
        source: "battery_detail",
        quantity: 1,
      }),
    [batteryCode, brandName, returnOption, method],
  );

  const usedBatteryOption = mapShopReturnOptionToUsedBattery(returnOption);

  const methodPrices = useMemo(() => {
    const map = new Map<FulfillmentMethod, ReturnType<typeof computeLineAmountWithReturnFee>>();
    for (const m of METHODS) {
      map.set(m.value, computeLineAmountWithReturnFee(previewItem, m.value, usedBatteryOption));
    }
    return map;
  }, [previewItem, usedBatteryOption]);

  const selectMethod = (next: FulfillmentMethod) => {
    onFulfillmentChange?.(next);
  };

  const formatMethodPrice = (fulfillmentMethod: FulfillmentMethod): string => {
    const line = methodPrices.get(fulfillmentMethod);
    if (line?.fulfillmentSubtotal == null && line?.finalAmount == null) return "가격 문의";
    const amount = line?.finalAmount ?? line?.fulfillmentSubtotal;
    return formatPriceWon(amount ?? null);
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
          const priceLabel = formatMethodPrice(m.value);
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => selectMethod(m.value)}
              className={`min-h-[3.25rem] rounded-xl px-3 py-2.5 text-left transition-colors ${
                active
                  ? "bg-[#0F1B33] text-white ring-2 ring-blue-400 shadow-sm"
                  : "bg-white text-[#0F172A] ring-1 ring-[#D8E1EC] hover:ring-slate-300"
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-black">{label}</span>
                <span
                  className={`shrink-0 text-xs font-black tabular-nums ${
                    active ? "text-blue-100" : "text-[#1E3A8A]"
                  }`}
                >
                  {priceLabel}
                </span>
              </span>
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
      <OrderPriceBreakdown
        item={previewItem}
        fulfillmentMethod={method}
        includeBatteryReturnFee
      />
      <p className="text-[10px] font-medium text-slate-500">
        배송지·방문 지점은 주문서 작성 단계에서 입력합니다.
      </p>
    </div>
  );
}
