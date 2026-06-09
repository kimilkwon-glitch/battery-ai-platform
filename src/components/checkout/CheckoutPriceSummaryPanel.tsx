"use client";

import { buildCheckoutPriceSummaryRows } from "@/lib/checkout/checkout-price-summary-rows";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import { computeCheckoutTotal } from "@/lib/pricing/compute-checkout-total";
import type { UsedBatteryFormSelection } from "@/lib/order-request/order-request-form-helpers";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillment } from "@/types/order-request";

type PromotionDiscountLine = {
  title: string;
  amount: number;
};

type Props = {
  items: BatteryCartItem[];
  fulfillment: OrderRequestFulfillment;
  usedBattery: UsedBatteryFormSelection;
  sticky?: boolean;
  /** 감사·레이아웃 — PC aside / 모바일 인라인 구분 */
  panelPlacement?: "aside" | "inline";
  /** 쿠폰·프로모션 반영 최종금액 (review 단계) */
  finalAmountOverride?: number | null;
  promotionDiscounts?: PromotionDiscountLine[];
};

export function CheckoutPriceSummaryPanel({
  items,
  fulfillment,
  usedBattery,
  sticky,
  panelPlacement = "aside",
  finalAmountOverride,
  promotionDiscounts,
}: Props) {
  const method = fulfillment.method;
  const totals = computeCheckoutTotal(items, method, usedBattery ?? undefined);
  const summaryRows = buildCheckoutPriceSummaryRows(
    totals.priceLines,
    method,
    totals.batteryReturnFee,
  );
  const displayTotal = finalAmountOverride ?? totals.finalAmount;

  return (
    <aside
      className={`checkout-price-summary space-y-3 ${sticky ? "lg:sticky lg:top-4" : ""}`}
      id={panelPlacement === "inline" ? "checkout-price-summary-mobile" : "checkout-price-summary"}
      data-checkout-section="price-summary"
      data-checkout-panel={panelPlacement === "inline" ? "price-inline" : "price-aside"}
    >
      <div className="checkout-summary-card rounded-2xl p-4">
        <h2 className="text-sm font-black text-[#0F172A]">결제금액 요약</h2>

        <dl className="checkout-price-summary__rows mt-4 space-y-2 text-xs">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className={`flex justify-between gap-2 ${
                row.highlight ? "font-black text-red-600" : "font-medium text-slate-600"
              }`}
            >
              <dt>{row.label}</dt>
              <dd className="tabular-nums">
                {row.amount == null
                  ? "—"
                  : row.prefix
                    ? `${row.prefix}${formatPriceWon(row.amount)}`
                    : formatPriceWon(row.amount)}
              </dd>
            </div>
          ))}
        </dl>

        {promotionDiscounts?.map((promo) => (
          <div
            key={promo.title}
            className="mt-2 flex justify-between gap-2 text-xs font-black text-red-600"
          >
            <span>{promo.title}</span>
            <span className="tabular-nums">-{formatPriceWon(promo.amount)}</span>
          </div>
        ))}

        <div className="checkout-price-summary__divider my-3 border-t border-slate-200" />

        <div className="checkout-summary-total flex items-center justify-between rounded-xl px-4 py-3.5 text-white shadow-md">
          <span className="text-sm font-bold">{CUSTOMER_PRICE_LABELS.total}</span>
          <span className="checkout-summary-total__amount tabular-nums">
            {displayTotal != null ? formatPriceWon(displayTotal) : "—"}
          </span>
        </div>
      </div>
    </aside>
  );
}
