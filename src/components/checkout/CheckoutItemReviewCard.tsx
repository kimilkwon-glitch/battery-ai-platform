"use client";

import {
  FULFILLMENT_METHOD_LABELS,
  USED_BATTERY_RETURN_LABELS,
} from "@/data/cart-flow-guide";
import {
  formatCheckoutPrice,
  formatCheckoutTerminal,
  formatCheckoutVehicle,
} from "@/lib/checkout/checkout-review";
import type { BatteryCartItem } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

export function CheckoutItemReviewCard({ item }: { item: BatteryCartItem }) {
  const ub = USED_BATTERY_RETURN_LABELS[item.usedBatteryReturn.option];
  const fulfillment = FULFILLMENT_METHOD_LABELS[item.fulfillment.method];

  const productName = item.productName?.trim() || "배터리 상품";
  const spec = item.batterySpec?.trim() || "규격 확인 필요";

  return (
    <article
      className={`${bm.card} ${bm.cardPad} space-y-3`}
      data-checkout-item={item.id}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-950">{productName}</h3>
          <p className="text-xs font-bold text-slate-600">
            {item.brandName ? `${item.brandName} · ` : ""}
            {spec} · 수량 {item.quantity}
          </p>
        </div>
        <p className="shrink-0 text-sm font-black text-blue-700 tabular-nums">
          {formatCheckoutPrice(item)}
        </p>
      </div>

      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="font-bold text-slate-500">단자 방향</dt>
          <dd className="font-black text-slate-800">{formatCheckoutTerminal(item.terminalDirection)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="font-bold text-slate-500">차량</dt>
          <dd className="font-black text-slate-800">{formatCheckoutVehicle(item)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="font-bold text-slate-500">폐전지</dt>
          <dd className="font-black text-slate-800">{ub.short}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="font-bold text-slate-500">수령 방식</dt>
          <dd className="font-black text-slate-800">{fulfillment}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-900 ring-1 ring-violet-200">
          {ub.badge}
        </span>
      </div>
    </article>
  );
}
