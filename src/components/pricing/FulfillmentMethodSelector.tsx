"use client";

import {
  FULFILLMENT_PRICE_DESCRIPTIONS,
  FULFILLMENT_PRICE_LABELS,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";
import type { OrderRequestFulfillment } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

const METHODS: {
  value: OrderRequestFulfillment["method"];
  priceType: Exclude<FulfillmentPriceType, "undecided">;
}[] = [
  { value: "delivery", priceType: "delivery" },
  { value: "visit_install", priceType: "onsite_install" },
  { value: "store_install", priceType: "store_install" },
  { value: "store_pickup_self", priceType: "store_pickup_self" },
];

type Props = {
  values: OrderRequestFulfillment;
  onChange: (patch: Partial<OrderRequestFulfillment>) => void;
  idPrefix?: string;
};

export function FulfillmentMethodSelector({ values, onChange, idPrefix = "fulfillment" }: Props) {
  const showStore =
    values.method === "store_install" || values.method === "store_pickup_self";
  const showDeliveryAddress = values.method === "delivery";
  const showVisit = values.method === "visit_install";

  const selectMethod = (method: OrderRequestFulfillment["method"]) => {
    const patch: Partial<OrderRequestFulfillment> = { method };
    if (
      (method === "store_install" || method === "store_pickup_self") &&
      (!values.storeId || values.storeId === "undecided")
    ) {
      patch.storeId = "deokcheon";
    }
    onChange(patch);
  };

  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id={`${idPrefix}-section`}>
      <h2 className="text-sm font-black text-slate-900">수령/장착 방식</h2>
      <p className="text-xs font-medium text-slate-600">
        선택한 방식에 따라 결제 예정금액이 달라집니다.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => {
          const label = FULFILLMENT_PRICE_LABELS[m.priceType];
          const desc = FULFILLMENT_PRICE_DESCRIPTIONS[m.priceType];
          const active = values.method === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => selectMethod(m.value)}
              className={`rounded-xl px-3 py-3 text-left ${
                active
                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                  : "bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="block text-xs font-black">{label}</span>
              <span
                className={`mt-1 block text-[10px] font-medium leading-relaxed ${
                  active ? "text-blue-50" : "text-slate-500"
                }`}
              >
                {desc}
              </span>
            </button>
          );
        })}
      </div>

      {showStore ? (
        <div className="space-y-2 rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-black text-slate-800">방문 지점</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "deokcheon" as const, label: "덕천점" },
                { value: "hakjang" as const, label: "학장점" },
              ] as const
            ).map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ storeId: s.value })}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${
                  values.storeId === s.value
                    ? "bg-emerald-600 text-white"
                    : "bg-white ring-1 ring-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showDeliveryAddress ? (
        <label className="block space-y-1 rounded-xl border border-slate-200 p-3">
          <span className="text-xs font-black text-slate-800">배송지 주소</span>
          <input
            type="text"
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.region ?? ""}
            onChange={(e) => onChange({ region: e.target.value })}
            placeholder="택배 수령 주소를 입력해 주세요"
          />
        </label>
      ) : null}

      {showVisit ? (
        <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/30 p-3">
          <label className="block">
            <span className="text-xs font-black text-slate-800">출장 주소 또는 지역</span>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
              value={values.region ?? ""}
              onChange={(e) => onChange({ region: e.target.value })}
              placeholder="예: 부산 북구 ○○로 00"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-800">희망 날짜/시간 (선택)</span>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
              value={values.preferredTime ?? ""}
              onChange={(e) => onChange({ preferredTime: e.target.value })}
              placeholder="예: 주말 오전"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
