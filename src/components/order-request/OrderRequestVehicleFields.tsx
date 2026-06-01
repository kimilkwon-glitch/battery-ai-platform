"use client";

import Link from "next/link";
import { ORDER_REQUEST_VEHICLE_COPY } from "@/data/order-request-copy";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestVehicle } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

export function OrderRequestVehicleFields({
  cartItems,
  values,
  onChange,
}: {
  cartItems: BatteryCartItem[];
  values: OrderRequestVehicle;
  onChange: (patch: Partial<OrderRequestVehicle>) => void;
}) {
  const fromCart = cartItems.find((i) => i.vehicle?.displayName)?.vehicle;

  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-vehicle">
      <h2 className="text-sm font-black text-slate-900">{ORDER_REQUEST_VEHICLE_COPY.sectionTitle}</h2>
      <p className="text-xs font-medium leading-relaxed text-slate-600">
        {ORDER_REQUEST_VEHICLE_COPY.hint}
      </p>
      {fromCart?.displayName ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
          장바구니: {fromCart.displayName}
          {fromCart.generationName ? ` · ${fromCart.generationName}` : ""}
          {fromCart.year ? ` · ${fromCart.year}` : ""}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-black text-slate-800">차량명</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.name ?? ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={fromCart?.displayName ?? "예: 쏘렌토 MQ4"}
          />
        </label>
        <label className="block">
          <span className="text-xs font-black text-slate-800">연식</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.year ?? ""}
            onChange={(e) => onChange({ year: e.target.value })}
            placeholder="2021"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black text-slate-800">연료 타입</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.fuelType ?? ""}
            onChange={(e) => onChange({ fuelType: e.target.value })}
            placeholder="가솔린 / 디젤 / HEV"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-black text-slate-800">현재 장착 배터리 규격</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.currentBatterySpec ?? ""}
            onChange={(e) => onChange({ currentBatterySpec: e.target.value })}
            placeholder="예: AGM80L"
          />
        </label>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3">
        <input
          type="checkbox"
          className="mt-0.5 size-5 accent-blue-600"
          checked={!!values.photoCheckNeeded}
          onChange={(e) => onChange({ photoCheckNeeded: e.target.checked })}
        />
        <span className="text-xs font-bold text-slate-700">사진 확인이 필요합니다</span>
      </label>
      <Link href="/photo-check" className={`${bm.btnTertiary} inline-flex text-xs`}>
        사진 확인 먼저 하기 →
      </Link>
    </section>
  );
}
