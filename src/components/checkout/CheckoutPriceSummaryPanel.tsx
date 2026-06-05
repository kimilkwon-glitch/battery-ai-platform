"use client";

import { OrderPriceBreakdown, OrderPriceTotalBar } from "@/components/pricing/OrderPriceBreakdown";
import {
  calculateCartItemPrice,
  formatPriceWon,
  resolveCartItemPrices,
} from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillment } from "@/types/order-request";

type Props = {
  items: BatteryCartItem[];
  fulfillment: OrderRequestFulfillment;
  sticky?: boolean;
};

export function CheckoutPriceSummaryPanel({ items, fulfillment, sticky }: Props) {
  const method = fulfillment.method;

  return (
    <aside
      className={`checkout-price-summary space-y-3 ${sticky ? "lg:sticky lg:top-4" : ""}`}
      id="checkout-price-summary"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black text-slate-900">결제 예정금액 요약</h2>
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          선택한 수령/장착 방식 기준으로 계산됩니다.
        </p>
        <div className="mt-3 space-y-3">
          {items.map((item) => {
            const prices = resolveCartItemPrices(item);
            const result = calculateCartItemPrice(item, method);
            return (
              <div key={item.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0">
                <p className="text-xs font-black text-slate-800">
                  {item.productName}
                  {item.brandName ? ` · ${item.brandName}` : ""}
                </p>
                <p className="text-[10px] font-bold text-slate-500">
                  {item.batterySpec} · 수량 {item.quantity}
                </p>
                <dl className="grid grid-cols-2 gap-1 text-[10px] font-medium text-slate-600">
                  <dt>인터넷가</dt>
                  <dd className="text-right tabular-nums">{formatPriceWon(prices.internetPrice)}</dd>
                  <dt>출장가</dt>
                  <dd className="text-right tabular-nums">{formatPriceWon(prices.onsitePrice)}</dd>
                </dl>
                <OrderPriceBreakdown item={item} fulfillmentMethod={method} compact />
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <OrderPriceTotalBar items={items} fulfillmentMethod={method} />
        </div>
      </div>
    </aside>
  );
}
