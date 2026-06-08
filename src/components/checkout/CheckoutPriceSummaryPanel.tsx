"use client";



import { CheckoutBatteryReturnSummary } from "@/components/checkout/CheckoutBatteryReturnSummary";

import { OrderPriceBreakdown, OrderPriceTotalBar } from "@/components/pricing/OrderPriceBreakdown";

import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";

import {

  calculateCartItemPrice,

  formatPriceWon,

  resolveCartItemPrices,

} from "@/lib/pricing/order-price";

import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";

import { computeCheckoutTotal } from "@/lib/pricing/compute-checkout-total";

import type { UsedBatteryFormSelection } from "@/lib/order-request/order-request-form-helpers";

import type { BatteryCartItem } from "@/types/cart";

import type { OrderRequestFulfillment } from "@/types/order-request";



type Props = {

  items: BatteryCartItem[];

  fulfillment: OrderRequestFulfillment;

  usedBattery: UsedBatteryFormSelection;

  sticky?: boolean;

};



export function CheckoutPriceSummaryPanel({ items, fulfillment, usedBattery, sticky }: Props) {

  const method = fulfillment.method;

  const totals = computeCheckoutTotal(items, method, usedBattery ?? undefined);

  const fulfillmentLabel =

    method && method !== "undecided" ? FULFILLMENT_METHOD_LABELS[method] : null;

  const primary = items[0];



  return (

    <aside

      className={`checkout-price-summary space-y-3 ${sticky ? "lg:sticky lg:top-4" : ""}`}

      id="checkout-price-summary"

    >

      <div className="checkout-summary-card rounded-2xl p-4">

        <h2 className="text-sm font-black text-[#0F172A]">주문 요약</h2>

        <p className="mt-1 text-[11px] font-semibold text-[#475569]">

          선택한 수령/장착 방식과 반납 여부 기준입니다.

        </p>



        {primary ? (

          <dl className="mt-3 space-y-1.5 text-xs">

            <div className="flex justify-between gap-2">

              <dt className="font-bold text-[#64748B]">상품</dt>

              <dd className="text-right font-black text-[#0F172A]">

                {primary.productName}

                {primary.brandName ? ` · ${primary.brandName}` : ""}

              </dd>

            </div>

            <div className="flex justify-between gap-2">

              <dt className="font-bold text-[#64748B]">규격</dt>

              <dd className="font-black text-[#0F172A]">{primary.batterySpec}</dd>

            </div>

            {fulfillmentLabel ? (

              <div className="flex justify-between gap-2">

                <dt className="font-bold text-[#64748B]">수령/장착</dt>

                <dd className="font-black text-[#0F172A]">{fulfillmentLabel}</dd>

              </div>

            ) : null}

          </dl>

        ) : null}



        <div className="mt-3">

          <CheckoutBatteryReturnSummary value={usedBattery} />

        </div>



        <div className="mt-4 space-y-3">

          {items.map((item) => {

            const prices = resolveCartItemPrices(item);

            const result = calculateCartItemPrice(item, method);

            return (

              <div key={item.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0">

                <p className="text-[10px] font-bold text-slate-500">

                  {item.batterySpec} · 수량 {item.quantity}

                </p>

                <dl className="grid grid-cols-2 gap-1 text-[10px] font-medium text-slate-600">

                  <dt>{CUSTOMER_PRICE_LABELS.productPurchase}</dt>

                  <dd className="text-right tabular-nums">{formatPriceWon(prices.internetPrice)}</dd>

                  <dt>{CUSTOMER_PRICE_LABELS.mobileInstall}</dt>

                  <dd className="text-right tabular-nums">{formatPriceWon(prices.onsitePrice)}</dd>

                  <dt>상품금액</dt>

                  <dd className="text-right tabular-nums font-black text-slate-800">

                    {formatPriceWon(result.lineTotal)}

                  </dd>

                </dl>

              </div>

            );

          })}

        </div>



        <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs">

          <div className="flex justify-between gap-2 font-medium text-slate-600">

            <dt>{CUSTOMER_PRICE_LABELS.productAmount}</dt>

            <dd className="tabular-nums">{formatPriceWon(totals.productSubtotal)}</dd>

          </div>

          {totals.batteryReturnFee > 0 ? (

            <div className="flex justify-between gap-2 font-black text-red-600">

              <dt>미반납 추가금</dt>

              <dd className="tabular-nums">+{formatPriceWon(totals.batteryReturnFee)}</dd>

            </div>

          ) : usedBattery === "return" ? (

            <div className="flex justify-between gap-2 font-medium text-slate-600">

              <dt>폐배터리 반납</dt>

              <dd>추가금 없음</dd>

            </div>

          ) : null}

        </dl>



        <div className="mt-4">

          <OrderPriceTotalBar

            items={items}

            fulfillmentMethod={method}

            returnBatteryOption={usedBattery ?? undefined}

          />

        </div>

      </div>

    </aside>

  );

}


