"use client";

import {
  calculateCartItemPrice,
  computeBatteryReturnFee,
  computeLineAmountWithReturnFee,
  formatPriceWon,
  normalizeFulfillmentPriceType,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";
import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillmentMethod, OrderRequestUsedBatteryOption } from "@/types/order-request";

type PriceRow = {
  label: string;
  value: string;
  emphasis?: boolean;
  highlight?: boolean;
};

type Props = {
  item: BatteryCartItem;
  fulfillmentMethod?: OrderRequestFulfillmentMethod | BatteryCartItem["fulfillment"]["method"];
  compact?: boolean;
  returnBatteryOption?: OrderRequestUsedBatteryOption | null;
  allItems?: BatteryCartItem[];
  /** true: 상품상세·장바구니 미리보기 — 미반납 surcharge 즉시 반영 */
  includeBatteryReturnFee?: boolean;
  /** true: 주문서 — 다건 합산 미반납 fee */
  showOrderFees?: boolean;
};

function resolveReturnOption(
  item: BatteryCartItem,
  returnBatteryOption?: OrderRequestUsedBatteryOption | null,
  includeBatteryReturnFee?: boolean,
): OrderRequestUsedBatteryOption | null {
  if (returnBatteryOption) return returnBatteryOption;
  if (!includeBatteryReturnFee) return null;
  const opt = item.usedBatteryReturn.option;
  if (opt === "return" || opt === "no_return") return opt;
  return null;
}

function breakdownRows(
  type: FulfillmentPriceType,
  result: ReturnType<typeof calculateCartItemPrice>,
  lineAmount: ReturnType<typeof computeLineAmountWithReturnFee>,
  options: {
    returnOption: OrderRequestUsedBatteryOption | null;
    includeBatteryReturnFee?: boolean;
    showOrderFees?: boolean;
    allItems?: BatteryCartItem[];
    quantity?: number;
  },
): PriceRow[] {
  if (type === "undecided" || result.finalPrice == null) {
    return [{ label: CUSTOMER_PRICE_LABELS.finalAmount, value: "수령 방식 선택 후 표시", emphasis: true }];
  }

  const rows: PriceRow[] = [];
  const quantity = Math.max(1, options.quantity ?? 1);

  switch (type) {
    case "delivery":
      rows.push({
        label: CUSTOMER_PRICE_LABELS.productPurchase,
        value: formatPriceWon(result.basePrice != null ? result.basePrice * quantity : null),
      });
      rows.push({
        label: CUSTOMER_PRICE_LABELS.deliveryFee,
        value: `+${formatPriceWon(result.deliveryFee * quantity)}`,
      });
      break;
    case "onsite_install":
      rows.push({
        label: CUSTOMER_PRICE_LABELS.mobileInstall,
        value: formatPriceWon(result.basePrice != null ? result.basePrice * quantity : null),
      });
      break;
    case "store_install":
      rows.push({
        label: CUSTOMER_PRICE_LABELS.mobileInstall,
        value: formatPriceWon(result.basePrice != null ? result.basePrice * quantity : null),
      });
      if (result.storeInstallDiscount > 0) {
        rows.push({
          label: CUSTOMER_PRICE_LABELS.storeVisitDiscount,
          value: `-${formatPriceWon(result.storeInstallDiscount * quantity)}`,
        });
      }
      break;
    case "store_pickup_self":
      rows.push({
        label: CUSTOMER_PRICE_LABELS.productPurchase,
        value: formatPriceWon(result.basePrice != null ? result.basePrice * quantity : null),
      });
      break;
  }

  const showReturnLines = options.includeBatteryReturnFee || options.showOrderFees;
  if (
    showReturnLines &&
    options.returnOption === "no_return" &&
    lineAmount.usedBatteryReturnSurcharge > 0
  ) {
    rows.push({
      label: CUSTOMER_PRICE_LABELS.noReturnSurcharge,
      value: `+${formatPriceWon(lineAmount.usedBatteryReturnSurcharge)}`,
      highlight: true,
    });
  }

  if (options.showOrderFees && options.returnOption && options.allItems?.length) {
    const fee = computeBatteryReturnFee(options.returnOption, options.allItems);
    if (options.returnOption === "no_return" && fee > 0) {
      rows.push({
        label: CUSTOMER_PRICE_LABELS.noReturnFeeIfSelected,
        value: `+${formatPriceWon(fee)}`,
        highlight: true,
      });
    }
  }

  rows.push({
    label: options.showOrderFees ? CUSTOMER_PRICE_LABELS.total : CUSTOMER_PRICE_LABELS.finalAmount,
    value: formatPriceWon(
      showReturnLines && options.returnOption
        ? lineAmount.finalAmount
        : lineAmount.fulfillmentSubtotal ?? lineAmount.finalAmount,
    ),
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
  includeBatteryReturnFee = false,
  showOrderFees,
}: Props) {
  const method = fulfillmentMethod ?? item.fulfillment.method;
  const type = normalizeFulfillmentPriceType(method);
  const result = calculateCartItemPrice(item, method);
  const returnOption = resolveReturnOption(item, returnBatteryOption, includeBatteryReturnFee);
  const lineAmount = computeLineAmountWithReturnFee(
    item,
    method,
    returnBatteryOption ?? returnOption ?? undefined,
  );
  const rows = breakdownRows(type, result, lineAmount, {
    returnOption,
    includeBatteryReturnFee,
    showOrderFees,
    allItems: allItems ?? [item],
    quantity: item.quantity,
  });

  return (
    <div
      className={`order-price-breakdown rounded-xl border border-[#D8E1EC] bg-white shadow-sm ${
        compact ? "order-price-breakdown--compact" : ""
      }`}
    >
      <dl className="order-price-breakdown__rows">
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className={
              row.emphasis ? "order-price-breakdown__total" : "order-price-breakdown__row"
            }
          >
            <dt
              className={
                row.emphasis
                  ? "order-price-breakdown__total-label"
                  : row.highlight
                    ? "order-price-breakdown__row-label order-price-breakdown__row-label--highlight"
                    : "order-price-breakdown__row-label"
              }
            >
              {row.label}
            </dt>
            <dd
              className={
                row.emphasis
                  ? "order-price-breakdown__total-value"
                  : row.highlight
                    ? "order-price-breakdown__row-value order-price-breakdown__row-value--highlight"
                    : "order-price-breakdown__row-value"
              }
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
