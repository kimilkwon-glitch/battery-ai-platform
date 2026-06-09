"use client";

import { useMemo } from "react";
import { Package, Car, Wrench, ShoppingBag } from "lucide-react";
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
  icon: typeof Package;
  cardClass: string;
  recommended?: boolean;
}[] = [
  {
    value: "delivery",
    priceType: "delivery",
    icon: Package,
    cardClass: "product-fulfillment-card--delivery",
    recommended: true,
  },
  {
    value: "visit_install",
    priceType: "onsite_install",
    icon: Car,
    cardClass: "product-fulfillment-card--visit",
  },
  {
    value: "store_install",
    priceType: "store_install",
    icon: Wrench,
    cardClass: "product-fulfillment-card--store-install",
  },
  {
    value: "store_pickup_self",
    priceType: "store_pickup_self",
    icon: ShoppingBag,
    cardClass: "product-fulfillment-card--pickup",
  },
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
      <div className="product-fulfillment-panel__grid grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => {
          const active = method === m.value;
          const label = FULFILLMENT_PRICE_LABELS[m.priceType];
          const desc = FULFILLMENT_PRICE_DESCRIPTIONS[m.priceType];
          const priceLabel = formatMethodPrice(m.value);
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => selectMethod(m.value)}
              className={`product-fulfillment-card ${m.cardClass}${
                active ? " product-fulfillment-card--active" : ""
              }`}
            >
              <span className="product-fulfillment-card__head">
                <span className="product-fulfillment-card__title-row">
                  <span className="product-fulfillment-card__icon" aria-hidden>
                    <Icon className="size-4" />
                  </span>
                  <span className="product-fulfillment-card__label">{label}</span>
                  {m.recommended ? (
                    <span className="product-fulfillment-card__badge">추천</span>
                  ) : null}
                </span>
                <span className="product-fulfillment-card__price">{priceLabel}</span>
              </span>
              <span className="product-fulfillment-card__desc">{desc}</span>
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
