"use client";

import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { UsedBatteryFormSelection } from "@/lib/order-request/order-request-form-helpers";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestFulfillmentMethod, OrderRequestVehicle } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

function itemBatteryCode(item: BatteryCartItem): string | null {
  const spec = item.batterySpec?.trim();
  if (spec) return spec;
  const fromName = item.productName?.match(/\b[A-Z]{1,4}\d{2,3}[A-Z]{0,3}\b/i);
  return fromName?.[0]?.toUpperCase() ?? null;
}

function resolveChangeOptionsHref(items: BatteryCartItem[], isBuyNow: boolean): string {
  const primary = items[0];
  if (!primary) return isBuyNow ? "/" : CART_PAGE;
  const code = primary.batterySpec?.trim();
  if (code) {
    const href = batteryDetailHref(code);
    if (href) return href;
    return `/batteries/${encodeURIComponent(code)}`;
  }
  return isBuyNow ? "/" : CART_PAGE;
}

function formatVehicleLabel(vehicle: OrderRequestVehicle | undefined, item: BatteryCartItem): string {
  const name = vehicle?.name?.trim() || item.vehicle?.displayName?.trim();
  if (!name) return "미입력";
  const parts = [name, vehicle?.year || item.vehicle?.year].filter(Boolean);
  return parts.join(" · ");
}

function usedBatteryLabel(value: UsedBatteryFormSelection): string | null {
  if (value === "return") return "반납";
  if (value === "no_return") return "미반납";
  return null;
}

type Props = {
  items: BatteryCartItem[];
  fulfillmentMethod?: OrderRequestFulfillmentMethod;
  usedBattery?: UsedBatteryFormSelection;
  totalAmount?: number | null;
  vehicle?: OrderRequestVehicle;
  optionsComplete?: boolean;
  isBuyNow?: boolean;
};

export function CheckoutProductSummary({
  items,
  fulfillmentMethod,
  usedBattery,
  totalAmount,
  vehicle,
  optionsComplete = true,
  isBuyNow = false,
}: Props) {
  const method = fulfillmentMethod ?? items[0]?.fulfillment.method;
  const primary = items[0];
  const code = primary ? itemBatteryCode(primary) : null;
  const fulfillmentLabel =
    method && method !== "undecided"
      ? FULFILLMENT_METHOD_LABELS[method as keyof typeof FULFILLMENT_METHOD_LABELS]
      : null;
  const returnLabel = usedBatteryLabel(usedBattery ?? null);
  const changeHref = resolveChangeOptionsHref(items, isBuyNow);
  const imageSet = code ? batteryImageSetForCode(code) : undefined;
  const specLabel = code ? `${code} 배터리` : primary?.productName?.trim() || "배터리";

  return (
    <section
      className={`checkout-product-summary ${bm.card} ${bm.cardPad}`}
      id="checkout-product-summary"
      data-checkout-section="order-product"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-black text-slate-900">주문 상품</h2>
        <Link
          href={changeHref}
          className="shrink-0 text-xs font-black text-blue-700 underline underline-offset-2"
        >
          옵션 변경하기
        </Link>
      </div>

      {!optionsComplete ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 ring-1 ring-amber-100">
          선택 정보 확인 필요 — 이전 단계에서 수령 방식과 폐배터리 반납을 선택해 주세요.
        </p>
      ) : null}

      {primary ? (
        <div className="checkout-product-summary__body mt-3 flex gap-3">
          {code && imageSet?.main ? (
            <div className="checkout-product-summary__thumb h-[4rem] w-[4rem] shrink-0 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100 sm:h-[4.5rem] sm:w-[4.5rem]">
              <BatteryThumbnail
                code={code}
                imageSet={imageSet}
                role="main"
                fit="contain"
                overlayLabel={false}
                surface="transparent"
                className="h-full w-full"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-950">
              {primary.brandName ? `${primary.brandName} ` : ""}
              {primary.batterySpec || primary.productName || "배터리"}
            </p>
            <p className="text-xs font-semibold text-slate-600">{specLabel}</p>

            <dl className="checkout-product-summary__meta mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 sm:text-xs">
              <div>
                <dt className="font-bold text-slate-500">수량</dt>
                <dd className="font-black text-slate-800">{primary.quantity}</dd>
              </div>
              {fulfillmentLabel ? (
                <div>
                  <dt className="font-bold text-slate-500">수령/장착</dt>
                  <dd className="font-black text-slate-800">{fulfillmentLabel}</dd>
                </div>
              ) : null}
              {returnLabel ? (
                <div>
                  <dt className="font-bold text-slate-500">폐배터리</dt>
                  <dd className="font-black text-slate-800">{returnLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-bold text-slate-500">차량</dt>
                <dd className="font-semibold text-slate-800">{formatVehicleLabel(vehicle, primary)}</dd>
              </div>
            </dl>

            {totalAmount != null ? (
              <p className="checkout-product-summary__amount mt-2 text-xs font-bold tabular-nums text-slate-600">
                결제금액 {formatPriceWon(totalAmount)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {items.length > 1 ? (
        <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          {items.slice(1).map((item) => (
            <li key={item.id} className="text-[11px] font-bold text-slate-700">
              {item.brandName ? `${item.brandName} ` : ""}
              {item.batterySpec || item.productName} · 수량 {item.quantity}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
