"use client";

import {
  BATTERY_NO_RETURN_FEE,
  calculateCartItemPrice,
  computeBatteryReturnFee,
  formatPriceWon,
  FULFILLMENT_PRICE_DESCRIPTIONS,
  normalizeFulfillmentPriceType,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";
import {
  CUSTOMER_FULFILLMENT_LABELS,
  CUSTOMER_PRICE_LABELS,
  type CustomerFulfillmentDisplayKey,
} from "@/lib/pricing/customer-price-labels";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillmentMethod, OrderRequestUsedBatteryOption } from "@/types/order-request";

type Props = {
  item: BatteryCartItem;
  fulfillmentMethod?: OrderRequestFulfillmentMethod | BatteryCartItem["fulfillment"]["method"];
  compact?: boolean;
  returnBatteryOption?: OrderRequestUsedBatteryOption | null;
  allItems?: BatteryCartItem[];
  showOrderFees?: boolean;
};

function fulfillmentBadge(type: FulfillmentPriceType): string | null {
  if (type === "undecided") return null;
  return CUSTOMER_FULFILLMENT_LABELS[type as CustomerFulfillmentDisplayKey];
}

function breakdownRows(
  type: FulfillmentPriceType,
  result: ReturnType<typeof calculateCartItemPrice>,
  returnBatteryOption?: OrderRequestUsedBatteryOption | null,
  allItems?: BatteryCartItem[],
  showOrderFees?: boolean,
): { label: string; value: string; emphasis?: boolean; highlight?: boolean }[] {
  if (type === "undecided" || result.finalPrice == null) {
    return [{ label: CUSTOMER_PRICE_LABELS.total, value: "수령 방식 선택 후 표시", emphasis: true }];
  }

  const rows: { label: string; value: string; emphasis?: boolean; highlight?: boolean }[] = [];

  switch (type) {
    case "delivery":
      rows.push({ label: CUSTOMER_PRICE_LABELS.productPurchase, value: formatPriceWon(result.basePrice) });
      rows.push({
        label: CUSTOMER_PRICE_LABELS.deliveryFee,
        value: `+${formatPriceWon(result.deliveryFee)}`,
      });
      break;
    case "onsite_install":
      rows.push({ label: CUSTOMER_PRICE_LABELS.mobileInstall, value: formatPriceWon(result.basePrice) });
      break;
    case "store_install":
      rows.push({ label: CUSTOMER_PRICE_LABELS.mobileInstall, value: formatPriceWon(result.basePrice) });
      rows.push({
        label: CUSTOMER_PRICE_LABELS.storeVisitDiscount,
        value: `-${formatPriceWon(result.storeInstallDiscount)}`,
      });
      break;
    case "store_pickup_self":
      rows.push({ label: CUSTOMER_PRICE_LABELS.productPurchase, value: formatPriceWon(result.basePrice) });
      rows.push({ label: CUSTOMER_PRICE_LABELS.deliveryFee, value: CUSTOMER_PRICE_LABELS.noDeliveryFee });
      break;
  }

  if (showOrderFees && returnBatteryOption && allItems?.length) {
    const fee = computeBatteryReturnFee(returnBatteryOption, allItems);
    if (returnBatteryOption === "no_return" && fee > 0) {
      rows.push({
        label: CUSTOMER_PRICE_LABELS.noReturnFeeIfSelected,
        value: `+${formatPriceWon(fee)}`,
        highlight: true,
      });
    } else if (returnBatteryOption === "return") {
      rows.push({
        label: CUSTOMER_PRICE_LABELS.batteryReturn,
        value: CUSTOMER_PRICE_LABELS.batteryReturnFree,
      });
    }
  }

  const returnFee =
    showOrderFees && returnBatteryOption && allItems?.length
      ? computeBatteryReturnFee(returnBatteryOption, allItems)
      : 0;
  const total = result.lineTotal != null ? result.lineTotal + returnFee : null;

  rows.push({
    label: showOrderFees ? CUSTOMER_PRICE_LABELS.total : CUSTOMER_PRICE_LABELS.subtotal,
    value: formatPriceWon(showOrderFees ? total : result.lineTotal),
    emphasis: true,
  });
  return rows;
}

export function OrderPriceBreakdown({
  item,
  fulfillmentMethod,
  compact,
  returnBatteryOption,
  allItems,
  showOrderFees,
}: Props) {
  const method = fulfillmentMethod ?? item.fulfillment.method;
  const type = normalizeFulfillmentPriceType(method);
  const result = calculateCartItemPrice(item, method);
  const items = allItems ?? [item];
  const rows = breakdownRows(type, result, returnBatteryOption, items, showOrderFees);
  const desc = type !== "undecided" ? FULFILLMENT_PRICE_DESCRIPTIONS[type] : null;
  const badge = fulfillmentBadge(type);

  return (
    <div
      className={`order-price-breakdown rounded-xl border border-[#D8E1EC] bg-white shadow-sm ${compact ? "p-2.5" : "p-3"} space-y-2`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[#64748B]">{CUSTOMER_PRICE_LABELS.priceBasis}</span>
        {badge ? (
          <span className="rounded-full bg-[#0F1B33] px-2.5 py-0.5 text-[10px] font-black text-white">
            {badge}
          </span>
        ) : (
          <span className="font-black text-slate-800">{result.priceBasisLabel}</span>
        )}
      </div>
      {desc && !compact ? (
        <p className="text-[11px] font-medium leading-relaxed text-[#475569]">{desc}</p>
      ) : null}
      <dl className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-2 text-xs ${
              row.emphasis ? "border-t border-slate-100 pt-2 font-black" : "font-medium"
            }`}
          >
            <dt
              className={
                row.emphasis
                  ? "text-[#0F172A]"
                  : row.highlight
                    ? "checkout-summary-fee--highlight"
                    : "text-[#64748B]"
              }
            >
              {row.label}
            </dt>
            <dd
              className={`tabular-nums ${
                row.emphasis
                  ? "text-base font-black text-[#0F172A] sm:text-lg"
                  : row.highlight
                    ? "checkout-summary-fee--highlight"
                    : "font-bold text-[#0F172A]"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function OrderPriceTotalBar({
  items,
  fulfillmentMethod,
  returnBatteryOption,
}: {
  items: BatteryCartItem[];
  fulfillmentMethod?: OrderRequestFulfillmentMethod | BatteryCartItem["fulfillment"]["method"];
  returnBatteryOption?: OrderRequestUsedBatteryOption | null;
}) {
  const method = fulfillmentMethod ?? items[0]?.fulfillment.method ?? "undecided";
  let total = 0;
  let hasTotal = false;
  for (const item of items) {
    const r = calculateCartItemPrice(item, method);
    if (r.lineTotal != null) {
      total += r.lineTotal;
      hasTotal = true;
    }
  }
  const returnFee = computeBatteryReturnFee(returnBatteryOption, items);
  if (hasTotal) total += returnFee;

  return (
    <div className="checkout-summary-total flex items-center justify-between rounded-xl px-4 py-3.5 text-white shadow-md">
      <span className="text-sm font-bold">{CUSTOMER_PRICE_LABELS.total}</span>
      <span className="checkout-summary-total__amount tabular-nums">
        {hasTotal ? formatPriceWon(total) : "수령 방식 선택 후 표시"}
      </span>
    </div>
  );
}

export function BatteryReturnFeeHint({
  option,
}: {
  option?: OrderRequestUsedBatteryOption | null;
}) {
  if (option === "no_return") {
    return (
      <p className="text-[11px] font-bold text-red-600">
        {CUSTOMER_PRICE_LABELS.noReturnFeeIfSelected} +{formatPriceWon(BATTERY_NO_RETURN_FEE)} (수량별 합산)
      </p>
    );
  }
  if (option === "return") {
    return (
      <p className="text-[11px] font-bold text-slate-600">
        {CUSTOMER_PRICE_LABELS.batteryReturn} · {CUSTOMER_PRICE_LABELS.batteryReturnFree}
      </p>
    );
  }
  return null;
}
