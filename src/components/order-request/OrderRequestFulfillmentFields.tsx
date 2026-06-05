"use client";

import { FulfillmentMethodSelector } from "@/components/pricing/FulfillmentMethodSelector";
import { ORDER_REQUEST_USED_BATTERY_COPY } from "@/data/order-request-copy";
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
}: {
  values: OrderRequestFulfillment;
  onChange: (patch: Partial<OrderRequestFulfillment>) => void;
  compact?: boolean;
}) {
  return (
    <FulfillmentMethodSelector
      values={values}
      onChange={onChange}
      idPrefix="order-request-fulfillment"
    />
  );
}
