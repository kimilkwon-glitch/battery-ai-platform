"use client";

import { CheckoutAddressPurposeBanner } from "@/components/checkout/CheckoutAddressPurposeBanner";
import { CHECKOUT_ADDRESS_PURPOSE } from "@/data/checkout-address-copy";
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
  const isPickup = values.method === "store_pickup_self";
  const copy = isPickup
    ? CHECKOUT_ADDRESS_PURPOSE.store_pickup_self
    : CHECKOUT_ADDRESS_PURPOSE.store_install;

  return (
    <section
      className="checkout-card space-y-4"
      id="checkout-store"
      data-checkout-info-section={isPickup ? "store_pickup_self" : "store_install"}
    >
      <CheckoutAddressPurposeBanner title={copy.title} description={copy.description} />

      <div>
        <h2 className="checkout-card__title">방문 지점</h2>
        <p className="checkout-card__hint">
          {isPickup ? "제품을 수령할 매장을 선택해 주세요." : "교체를 받을 매장을 선택해 주세요."}
        </p>
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
        <span className="checkout-label">희망 방문 시간 (선택)</span>
        <input
          type="text"
          className={inputClass}
          value={values.preferredTime ?? ""}
          onChange={(e) => onChange({ preferredTime: e.target.value })}
          placeholder="예: 평일 오후 2시 이후"
        />
      </label>

      <label className="block">
        <span className="checkout-label">{isPickup ? "요청사항" : "방문 요청사항"}</span>
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
