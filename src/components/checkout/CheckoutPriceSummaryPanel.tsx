"use client";

import { CheckoutBatteryReturnSummary } from "@/components/checkout/CheckoutBatteryReturnSummary";
import { OrderPriceBreakdown, OrderPriceTotalBar } from "@/components/pricing/OrderPriceBreakdown";
import { CHECKOUT_PAGE_COPY, CHECKOUT_PRICE_POLICY_HINTS } from "@/data/checkout-checklist";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { formatPriceWon } from "@/lib/pricing/order-price";
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
  /** 감사·레이아웃 — PC aside / 모바일 인라인 구분 */
  panelPlacement?: "aside" | "inline";
};

function policyHint(method: OrderRequestFulfillment["method"]): string | null {
  if (method === "delivery") return CHECKOUT_PRICE_POLICY_HINTS.delivery;
  if (method === "store_pickup_self") return CHECKOUT_PRICE_POLICY_HINTS.store_pickup_self;
  if (method === "store_install") return CHECKOUT_PRICE_POLICY_HINTS.store_install;
  if (method === "visit_install") return CHECKOUT_PRICE_POLICY_HINTS.visit_install;
  return null;
}

export function CheckoutPriceSummaryPanel({
  items,
  fulfillment,
  usedBattery,
  sticky,
  panelPlacement = "aside",
}: Props) {
  const method = fulfillment.method;
  const totals = computeCheckoutTotal(items, method, usedBattery ?? undefined);
  const fulfillmentLabel =
    method && method !== "undecided" ? FULFILLMENT_METHOD_LABELS[method] : null;
  const primary = items[0];
  const hint = policyHint(method);
  const totalDeliveryFee = totals.priceLines.reduce((sum, line) => sum + (line.deliveryFee ?? 0), 0);
  const totalStoreDiscount = totals.priceLines.reduce(
    (sum, line) => sum + (line.storeInstallDiscount ?? 0),
    0,
  );

  return (
    <aside
      className={`checkout-price-summary space-y-3 ${sticky ? "lg:sticky lg:top-4" : ""}`}
      id={panelPlacement === "inline" ? "checkout-price-summary-mobile" : "checkout-price-summary"}
      data-checkout-section="price-summary"
      data-checkout-panel={panelPlacement === "inline" ? "price-inline" : "price-aside"}
    >
      <div className="checkout-summary-card rounded-2xl p-4">
        <h2 className="text-sm font-black text-[#0F172A]">가격 요약</h2>
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
          {items.map((item) => (
            <div key={item.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0">
              <p className="text-[10px] font-bold text-slate-500">
                {item.batterySpec} · 수량 {item.quantity}
              </p>
              <OrderPriceBreakdown
                item={item}
                fulfillmentMethod={method}
                compact
                includeBatteryReturnFee
                returnBatteryOption={usedBattery ?? undefined}
              />
            </div>
          ))}
        </div>

        <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs">
          <div className="flex justify-between gap-2 font-medium text-slate-600">
            <dt>{CUSTOMER_PRICE_LABELS.productAmount}</dt>
            <dd className="tabular-nums">{formatPriceWon(totals.productSubtotal)}</dd>
          </div>
          {totalDeliveryFee > 0 ? (
            <div className="flex justify-between gap-2 font-medium text-slate-600">
              <dt>{CUSTOMER_PRICE_LABELS.deliveryFee}</dt>
              <dd className="tabular-nums">+{formatPriceWon(totalDeliveryFee)}</dd>
            </div>
          ) : null}
          {totalStoreDiscount > 0 ? (
            <div className="flex justify-between gap-2 font-bold text-emerald-700">
              <dt>{CUSTOMER_PRICE_LABELS.storeVisitDiscount}</dt>
              <dd className="tabular-nums">-{formatPriceWon(totalStoreDiscount)}</dd>
            </div>
          ) : null}
          {totals.batteryReturnFee > 0 ? (
            <div className="flex justify-between gap-2 font-black text-red-600">
              <dt>{CUSTOMER_PRICE_LABELS.noReturnFee}</dt>
              <dd className="tabular-nums">+{formatPriceWon(totals.batteryReturnFee)}</dd>
            </div>
          ) : usedBattery === "return" ? (
            <div className="flex justify-between gap-2 font-medium text-slate-600">
              <dt>{CUSTOMER_PRICE_LABELS.batteryReturn}</dt>
              <dd>{CUSTOMER_PRICE_LABELS.batteryReturnFree}</dd>
            </div>
          ) : null}
        </dl>

        {hint ? (
          <p className="mt-3 rounded-lg bg-blue-50/80 px-2.5 py-2 text-[11px] font-semibold leading-relaxed text-blue-900 ring-1 ring-blue-100">
            {hint}
          </p>
        ) : null}

        <p className="mt-2 text-[10px] font-medium leading-relaxed text-slate-500">
          {CHECKOUT_PAGE_COPY.firstOrderPromoHint}
        </p>

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
