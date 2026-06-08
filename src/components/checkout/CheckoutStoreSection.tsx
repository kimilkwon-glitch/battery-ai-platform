"use client";

import type { OrderRequestFulfillment } from "@/types/order-request";

const STORES = [
  { value: "deokcheon" as const, label: "덕천점" },
  { value: "hakjang" as const, label: "학장점" },
];

const inputClass =
  "checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium";

type Props = {
  values: OrderRequestFulfillment;
  onChange: (patch: Partial<OrderRequestFulfillment>) => void;
};

export function CheckoutStoreSection({ values, onChange }: Props) {
  return (
    <section className="checkout-card space-y-4" id="checkout-store">
      <div>
        <h2 className="checkout-card__title">방문 지점</h2>
        <p className="checkout-card__hint">매장을 선택해 주세요.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STORES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ storeId: s.value })}
            className={`min-h-[2.75rem] rounded-xl px-5 py-2 text-sm font-black ${
              values.storeId === s.value
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "checkout-btn-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="checkout-label">매장 전달사항</span>
        <textarea
          rows={3}
          className={inputClass}
          value={values.storeMessage ?? ""}
          onChange={(e) => onChange({ storeMessage: e.target.value })}
          placeholder="예: 방문 전 연락 부탁드립니다. 차량정보는 현장에서 확인하겠습니다."
        />
      </label>
    </section>
  );
}
