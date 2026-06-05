"use client";

import {
  calculateCartItemPrice,
  formatPriceWon,
  FULFILLMENT_PRICE_DESCRIPTIONS,
  normalizeFulfillmentPriceType,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

type Props = {
  item: BatteryCartItem;
  fulfillmentMethod?: OrderRequestFulfillmentMethod | BatteryCartItem["fulfillment"]["method"];
  compact?: boolean;
};

function breakdownRows(
  type: FulfillmentPriceType,
  result: ReturnType<typeof calculateCartItemPrice>,
): { label: string; value: string; emphasis?: boolean }[] {
  if (type === "undecided" || result.finalPrice == null) {
    return [{ label: "결제 예정금액", value: "수령 방식 선택 후 표시", emphasis: true }];
  }

  const rows: { label: string; value: string; emphasis?: boolean }[] = [];

  switch (type) {
    case "delivery":
      rows.push({ label: "상품 인터넷가", value: formatPriceWon(result.basePrice) });
      rows.push({ label: "택배비", value: `+${formatPriceWon(result.deliveryFee)}` });
      break;
    case "onsite_install":
      rows.push({ label: "출장교체가", value: formatPriceWon(result.basePrice) });
      break;
    case "store_install":
      rows.push({ label: "출장교체가", value: formatPriceWon(result.basePrice) });
      rows.push({
        label: "내방교체 차감",
        value: `-${formatPriceWon(result.storeInstallDiscount)}`,
      });
      break;
    case "store_pickup_self":
      rows.push({ label: "상품 인터넷가", value: formatPriceWon(result.basePrice) });
      rows.push({ label: "택배비", value: "0원" });
      break;
  }

  rows.push({
    label: "결제 예정금액",
    value: formatPriceWon(result.lineTotal),
    emphasis: true,
  });
  return rows;
}

export function OrderPriceBreakdown({ item, fulfillmentMethod, compact }: Props) {
  const method = fulfillmentMethod ?? item.fulfillment.method;
  const type = normalizeFulfillmentPriceType(method);
  const result = calculateCartItemPrice(item, method);
  const rows = breakdownRows(type, result);
  const desc =
    type !== "undecided" ? FULFILLMENT_PRICE_DESCRIPTIONS[type] : null;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-2.5" : "p-3"} space-y-2`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-500">가격 기준</span>
        <span className="font-black text-slate-800">{result.priceBasisLabel}</span>
      </div>
      {desc && !compact ? (
        <p className="text-[11px] font-medium leading-relaxed text-slate-600">{desc}</p>
      ) : null}
      <dl className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-2 text-xs ${
              row.emphasis ? "border-t border-slate-100 pt-2 font-black" : "font-medium"
            }`}
          >
            <dt className={row.emphasis ? "text-slate-900" : "text-slate-500"}>{row.label}</dt>
            <dd
              className={`tabular-nums ${
                row.emphasis ? "text-base text-blue-700" : "text-slate-800"
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
}: {
  items: BatteryCartItem[];
  fulfillmentMethod?: OrderRequestFulfillmentMethod | BatteryCartItem["fulfillment"]["method"];
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

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
      <span className="text-sm font-bold">결제 예정금액</span>
      <span className="text-lg font-black tabular-nums">
        {hasTotal ? formatPriceWon(total) : "수령 방식 선택 후 표시"}
      </span>
    </div>
  );
}
