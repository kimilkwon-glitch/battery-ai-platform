"use client";

import { useMemo } from "react";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import {
  computeLineAmountWithReturnFee,
  formatPriceWon,
} from "@/lib/pricing/order-price";
import { FULFILLMENT_METHOD_CARD_META } from "@/lib/pricing/fulfillment-method-card-meta";
import { FulfillmentMethodCardButton } from "@/components/pricing/FulfillmentMethodCardButton";
import { OrderPriceBreakdown } from "@/components/pricing/OrderPriceBreakdown";
import type { FulfillmentMethod } from "@/types/cart";
import {
  mapShopReturnOptionToUsedBattery,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";

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

  const selectedLine = useMemo(
    () => computeLineAmountWithReturnFee(previewItem, method, usedBatteryOption),
    [previewItem, method, usedBatteryOption],
  );

  const selectedFinalAmount =
    selectedLine.finalAmount ?? selectedLine.fulfillmentSubtotal ?? null;
  const methodLabel =
    method !== "undecided"
      ? FULFILLMENT_METHOD_LABELS[method]
      : "수령 방식 선택";

  const selectMethod = (next: FulfillmentMethod) => {
    onFulfillmentChange?.(next);
  };

  return (
    <div className="product-fulfillment-panel mt-4 space-y-3" data-product-fulfillment>
      <p className="text-sm font-black text-slate-800">수령/장착 방식</p>
      <div className="product-fulfillment-panel__grid checkout-fulfillment-grid grid gap-2 sm:grid-cols-2">
        {FULFILLMENT_METHOD_CARD_META.map((m) => {
          const value = m.value as FulfillmentMethod;
          const active = method === value;
          return (
            <FulfillmentMethodCardButton
              key={m.value}
              meta={m}
              active={active}
              onSelect={() => selectMethod(value)}
            />
          );
        })}
      </div>

      <div className="product-detail-price-summary space-y-2">
        <div className="product-detail-price-summary__hero rounded-xl border border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/40 px-4 py-3">
          <p className="text-[11px] font-bold text-slate-500">현재 선택 기준 최종가</p>
          <p className="product-detail-price-summary__amount mt-0.5 text-2xl font-black tabular-nums text-slate-950 sm:text-[1.625rem]">
            {selectedFinalAmount != null ? formatPriceWon(selectedFinalAmount) : "수령 방식 선택 후 표시"}
          </p>
          <p className="mt-1 text-xs font-bold text-blue-800">{methodLabel}</p>
        </div>
        <OrderPriceBreakdown
          item={previewItem}
          fulfillmentMethod={method}
          includeBatteryReturnFee
        />
      </div>
    </div>
  );
}
