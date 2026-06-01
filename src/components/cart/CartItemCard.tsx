"use client";

import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import {
  FITMENT_STATUS_LABELS,
  FULFILLMENT_METHOD_LABELS,
  USED_BATTERY_RETURN_CARD_MESSAGES,
} from "@/data/cart-flow-guide";
import { CUSTOMER_CENTER_USED_BATTERY } from "@/lib/customer-center-routes";
import type {
  BatteryCartItem,
  FulfillmentMethod,
  UsedBatteryReturnOption,
} from "@/types/cart";
import { bm } from "@/lib/design-tokens";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";

function fitmentTone(status: BatteryCartItem["fitmentStatus"]): string {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (status === "needs_photo_check") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "needs_customer_confirm") return "bg-blue-50 text-blue-900 ring-blue-200";
  return "bg-slate-100 text-slate-800 ring-slate-200";
}

function formatPrice(item: BatteryCartItem): string {
  const unit = item.finalPrice ?? item.basePrice;
  if (unit == null || Number.isNaN(unit)) return "상담 후 안내";
  return `${(unit * item.quantity).toLocaleString()}원`;
}

function terminalLabel(dir?: BatteryCartItem["terminalDirection"]): string {
  if (dir === "L") return "L (좌)";
  if (dir === "R") return "R (우)";
  return "확인 필요";
}

export function CartItemCard({ item }: { item: BatteryCartItem }) {
  const { updateItem, removeItem } = useBatteryCart();
  const fit = FITMENT_STATUS_LABELS[item.fitmentStatus];

  const setQty = (qty: number) => {
    if (qty < 1) {
      removeItem(item.id);
      return;
    }
    updateItem(item.id, { quantity: qty });
  };

  const setUsedBattery = (option: UsedBatteryReturnOption) => {
    const priceImpact =
      option === "return" ? -10000 : option === "no_return" ? 10000 : undefined;
    const base = item.basePrice;
    updateItem(item.id, {
      usedBatteryReturn: {
        ...item.usedBatteryReturn,
        option,
        priceImpact,
        guideRequired: option !== "no_return",
      },
      finalPrice: base != null && priceImpact != null ? base + priceImpact : item.finalPrice,
      warnings: item.warnings.filter((w) => !w.includes("폐전지 반납")),
    });
  };

  const setFulfillment = (method: FulfillmentMethod) => {
    updateItem(item.id, { fulfillment: { ...item.fulfillment, method } });
  };

  return (
    <article className={`${bm.card} ${bm.cardPad} space-y-3`} data-cart-item={item.id}>
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <div className="mx-auto w-full max-w-[120px] sm:mx-0">
          {item.imageSrc ? (
            <img
              src={item.imageSrc}
              alt=""
              className="aspect-[4/3] w-full rounded-xl bg-slate-50 object-contain"
            />
          ) : (
            <BatteryThumbnail
              code={item.batterySpec}
              role="main"
              ratio="4/3"
              className="rounded-xl"
            />
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-950">{item.productName}</h3>
              <p className="text-xs font-bold text-slate-600">
                {item.brandName ? `${item.brandName} · ` : ""}
                {item.batterySpec} · 단자 {terminalLabel(item.terminalDirection)}
              </p>
            </div>
            <p className="text-sm font-black text-blue-700 tabular-nums">{formatPrice(item)}</p>
          </div>

          {item.vehicle?.displayName ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
              {item.vehicle.displayName}
              {item.vehicle.generationName ? ` · ${item.vehicle.generationName}` : ""}
              {item.vehicle.year ? ` · ${item.vehicle.year}` : ""}
            </p>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-500">
              차량 정보 미입력
            </p>
          )}

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${fitmentTone(item.fitmentStatus)}`}
          >
            {fit.badge}
          </span>
          <p className="text-[11px] font-medium leading-relaxed text-slate-600">{fit.message}</p>

          {item.warnings.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-4 text-[11px] font-bold text-amber-900">
              {item.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
        <p className="text-xs font-black text-slate-900">폐전지 반납 여부</p>
        <p className="text-[11px] font-medium text-slate-600">
          {USED_BATTERY_RETURN_CARD_MESSAGES[item.usedBatteryReturn.option]}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["return", "반납"],
              ["no_return", "미반납"],
              ["undecided", "미선택"],
            ] as const
          ).map(([opt, label]) => (
            <button
              key={opt}
              type="button"
              onClick={() => setUsedBattery(opt)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-black ${
                item.usedBatteryReturn.option === opt
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link
          href={CUSTOMER_CENTER_USED_BATTERY}
          className="text-[10px] font-bold text-blue-700 hover:underline"
        >
          폐전지 반납 안내 보기 →
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <label className="text-xs font-black text-slate-900" htmlFor={`fulfillment-${item.id}`}>
          수령 방식
        </label>
        <select
          id={`fulfillment-${item.id}`}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-800"
          value={item.fulfillment.method}
          onChange={(e) => setFulfillment(e.target.value as FulfillmentMethod)}
        >
          {(
            Object.entries(FULFILLMENT_METHOD_LABELS) as [FulfillmentMethod, string][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="size-8 rounded-lg bg-slate-100 text-sm font-black text-slate-800"
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
            className="size-8 rounded-lg bg-slate-100 text-sm font-black text-slate-800"
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
