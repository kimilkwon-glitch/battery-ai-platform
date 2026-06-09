"use client";

import { useMemo } from "react";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import { computeLineAmountWithReturnFee, formatPriceWon } from "@/lib/pricing/order-price";
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

  const methodPrices = useMemo(() => {
    const map = new Map<FulfillmentMethod, ReturnType<typeof computeLineAmountWithReturnFee>>();
    for (const m of FULFILLMENT_METHOD_CARD_META) {
      map.set(
        m.value as FulfillmentMethod,
        computeLineAmountWithReturnFee(previewItem, m.value as FulfillmentMethod, usedBatteryOption),
      );
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
              priceLabel={formatMethodPrice(value)}
              onSelect={() => selectMethod(value)}
            />
          );
        })}
      </div>
      <OrderPriceBreakdown
        item={previewItem}
        fulfillmentMethod={method}
        includeBatteryReturnFee
      />
    </div>
  );
}
