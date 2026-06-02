"use client";

import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { FITMENT_STATUS_LABELS } from "@/data/cart-flow-guide";
import type { BatteryCartItem } from "@/types/cart";
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
