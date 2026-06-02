"use client";

import { ORDER_REQUEST_FULFILLMENT_COPY, ORDER_REQUEST_USED_BATTERY_COPY } from "@/data/order-request-copy";
import type { OrderRequestFulfillment, OrderRequestUsedBatteryOption } from "@/types/order-request";
import type { UsedBatteryFormSelection } from "@/lib/order-request/order-request-form-helpers";
import { bm } from "@/lib/design-tokens";

export function OrderRequestUsedBatteryFields({
  value,
  onChange,
}: {
  value: UsedBatteryFormSelection;
  onChange: (v: OrderRequestUsedBatteryOption) => void;
  compact?: boolean;
}) {
  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-used-battery">
      <h2 className="text-sm font-black text-slate-900">
        {ORDER_REQUEST_USED_BATTERY_COPY.sectionTitle}
      </h2>
      <p className="text-xs font-medium text-slate-600">{ORDER_REQUEST_USED_BATTERY_COPY.hint}</p>
      <div className="flex flex-wrap gap-2">
        {ORDER_REQUEST_USED_BATTERY_COPY.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-xl px-4 py-2.5 text-xs font-black ${
              value === opt.value
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function OrderRequestFulfillmentFields({
  values,
  onChange,
  compact = false,
}: {
  values: OrderRequestFulfillment;
  onChange: (patch: Partial<OrderRequestFulfillment>) => void;
  compact?: boolean;
}) {
  const showStore = values.method === "store_pickup";
  const showVisit = values.method === "visit_install";

  const selectMethod = (method: OrderRequestFulfillment["method"]) => {
    const patch: Partial<OrderRequestFulfillment> = { method };
    if (method === "store_pickup" && (!values.storeId || values.storeId === "undecided")) {
      patch.storeId = "deokcheon";
    }
    onChange(patch);
  };

  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-fulfillment">
      <h2 className="text-sm font-black text-slate-900">
        {ORDER_REQUEST_FULFILLMENT_COPY.sectionTitle}
      </h2>
      <p className="text-xs font-medium text-slate-600">
        {ORDER_REQUEST_FULFILLMENT_COPY.sectionHint}
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {ORDER_REQUEST_FULFILLMENT_COPY.methods.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => selectMethod(m.value)}
            className={`rounded-xl px-3 py-2.5 text-left text-xs font-black ${
              values.method === m.value
                ? "bg-blue-600 text-white"
                : "bg-slate-50 text-slate-800 ring-1 ring-slate-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {showStore ? (
        <div className="space-y-2 rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-black text-slate-800">매장</p>
          <div className="flex flex-wrap gap-2">
            {ORDER_REQUEST_FULFILLMENT_COPY.stores.map((s) => (
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

      {showVisit ? (
        <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/30 p-3">
          <p className="text-[11px] font-medium text-violet-900">
            {ORDER_REQUEST_FULFILLMENT_COPY.visitHint}
          </p>
          <label className="block">
            <span className="text-xs font-black text-slate-800">지역</span>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
              value={values.region ?? ""}
              onChange={(e) => onChange({ region: e.target.value })}
              placeholder="예: 부산 북구"
            />
          </label>
          {!compact ? (
            <label className="block">
              <span className="text-xs font-black text-slate-800">희망 날짜/시간</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
                value={values.preferredTime ?? ""}
                onChange={(e) => onChange({ preferredTime: e.target.value })}
                placeholder="예: 주말 오전"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
