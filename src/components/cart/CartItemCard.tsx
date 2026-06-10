"use client";

import Link from "next/link";
import { resolveCartItemBrandKey, resolveCartItemImageSrc } from "@/lib/cart/cart-item-brand";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { CartItemFulfillmentControls } from "@/components/cart/CartItemFulfillmentControls";
import { OrderPriceBreakdown } from "@/components/pricing/OrderPriceBreakdown";
import {
  FITMENT_STATUS_LABELS,
  FULFILLMENT_METHOD_LABELS,
  USED_BATTERY_RETURN_CARD_MESSAGES,
} from "@/data/cart-flow-guide";
import { applyPricingToCartItem, formatPriceWon, resolveCartItemPrices } from "@/lib/pricing/order-price";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import type { BatteryCartItem, FulfillmentMethod, UsedBatteryReturnOption } from "@/types/cart";
import { bm } from "@/lib/design-tokens";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";

function fitmentTone(status: BatteryCartItem["fitmentStatus"]): string {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (status === "needs_photo_check") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "needs_customer_confirm") return "bg-blue-50 text-blue-900 ring-blue-200";
  return "bg-slate-100 text-slate-800 ring-slate-200";
}

function terminalLabel(dir?: BatteryCartItem["terminalDirection"]): string {
  if (dir === "L") return "L (좌)";
  if (dir === "R") return "R (우)";
  return "확인 필요";
}

function vehicleInfoValue(item: BatteryCartItem): string {
  if (item.vehicle?.displayName) return item.vehicle.displayName;
  return item.customerMemo?.trim() ?? "";
}

function returnPriceImpact(option: UsedBatteryReturnOption): number | undefined {
  if (option === "return") return 0;
  if (option === "no_return") return 25_000;
  return undefined;
}

export function CartItemCard({ item }: { item: BatteryCartItem }) {
  const { updateItem, removeItem } = useBatteryCart();
  const fit = FITMENT_STATUS_LABELS[item.fitmentStatus];
  const vehicleText = vehicleInfoValue(item);
  const prices = resolveCartItemPrices(item);
  const fulfillmentLabel =
    item.fulfillment.method === "undecided"
      ? "미선택"
      : FULFILLMENT_METHOD_LABELS[item.fulfillment.method];
  const detailHref = batteryDetailHref(item.batterySpec);
  const returnMessage = USED_BATTERY_RETURN_CARD_MESSAGES[item.usedBatteryReturn.option];
  const brandKey = resolveCartItemBrandKey({
    brandName: item.brandName,
    batteryCode: item.batterySpec,
  });
  const imageSrc = resolveCartItemImageSrc(item);
  const imageSet = batteryImageSetForCode(item.batterySpec, brandKey);

  const setVehicleInfo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      updateItem(item.id, { vehicle: undefined, customerMemo: undefined });
      return;
    }
    updateItem(item.id, {
      vehicle: { displayName: trimmed },
      customerMemo: trimmed,
    });
  };

  const setQty = (qty: number) => {
    if (qty < 1) {
      removeItem(item.id);
      return;
    }
    updateItem(item.id, { quantity: qty });
  };

  const onFulfillmentChange = (method: FulfillmentMethod) => {
    const next = applyPricingToCartItem(item, method);
    updateItem(item.id, {
      fulfillment: next.fulfillment,
      finalPrice: next.finalPrice,
    });
  };

  const onReturnChange = (option: UsedBatteryReturnOption) => {
    updateItem(item.id, {
      usedBatteryReturn: {
        ...item.usedBatteryReturn,
        option,
        priceImpact: returnPriceImpact(option),
        guideRequired: option !== "no_return",
      },
    });
  };

  return (
    <article className={`cart-item-card ${bm.card} ${bm.cardPad}`} data-cart-item={item.id}>
      <div className="cart-item-card__top grid gap-3 sm:grid-cols-[100px_1fr]">
        <div className="cart-item-card__media mx-auto w-full max-w-[100px] sm:mx-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="aspect-[4/3] w-full rounded-xl bg-slate-50 object-contain"
            />
          ) : (
            <BatteryThumbnail
              code={item.batterySpec}
              imageSet={imageSet}
              role="main"
              ratio="4/3"
              className="rounded-xl"
            />
          )}
        </div>

        <div className="cart-item-card__info min-w-0 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-950">{item.productName}</h3>
              <p className="text-xs font-bold text-slate-600">
                {item.brandName ? `${item.brandName} · ` : ""}
                {item.batterySpec} · 단자 {terminalLabel(item.terminalDirection)}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${fitmentTone(item.fitmentStatus)}`}
            >
              {fit.badge}
            </span>
          </div>

          <dl className="cart-item-card__prices grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] font-bold text-slate-600">
            <dt>제품 구매가</dt>
            <dd className="text-right tabular-nums text-slate-900">{formatPriceWon(prices.internetPrice)}</dd>
            <dt>출장 교체가</dt>
            <dd className="text-right tabular-nums text-slate-900">{formatPriceWon(prices.onsitePrice)}</dd>
            <dt>수령/장착</dt>
            <dd className="text-right">{fulfillmentLabel}</dd>
          </dl>

          <p className="text-[10px] font-medium leading-relaxed text-slate-500">{returnMessage}</p>

          <OrderPriceBreakdown item={item} compact includeBatteryReturnFee />

          {detailHref ? (
            <Link href={detailHref} className="text-[11px] font-bold text-blue-700 hover:underline">
              상품 상세 보기
            </Link>
          ) : null}
        </div>
      </div>

      <label className="cart-item-card__vehicle block">
        <span className="text-[11px] font-black text-slate-700">차량명·연식·연료</span>
        <textarea
          rows={2}
          value={vehicleText}
          onChange={(e) => setVehicleInfo(e.target.value)}
          placeholder="차량명·연식·연료 (선택)"
          className="checkout-input mt-1 w-full resize-y rounded-lg border px-3 py-2 text-xs font-medium leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <CartItemFulfillmentControls
        item={item}
        onFulfillmentChange={onFulfillmentChange}
        onReturnChange={onReturnChange}
      />

      {item.warnings.length > 0 ? (
        <p className="line-clamp-2 text-[11px] font-bold text-amber-900">{item.warnings[0]}</p>
      ) : null}

      <div className="cart-item-card__footer flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="size-9 rounded-lg bg-slate-100 text-sm font-black text-slate-800"
            onClick={() => setQty(item.quantity - 1)}
            aria-label="수량 줄이기"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-black tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            className="size-9 rounded-lg bg-slate-100 text-sm font-black text-slate-800"
            onClick={() => setQty(item.quantity + 1)}
            aria-label="수량 늘리기"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="text-xs font-black text-red-600 hover:underline"
          onClick={() => removeItem(item.id)}
        >
          삭제
        </button>
      </div>
    </article>
  );
}
