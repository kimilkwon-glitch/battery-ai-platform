"use client";

export type CustomerFormValues = {
  name: string;
  phone: string;
  /** 상담 주문 요청 폼 전용 — 결제 주문서에서는 미사용 */
  email?: string;
  orderMemo?: string;
};

export type CustomerFieldsVariant = "orderer" | "visitor";

const COPY: Record<
  CustomerFieldsVariant,
  { title: string; hint: string; phoneHint: string }
> = {
  orderer: {
    title: "주문자 정보",
    hint: "제품 수령 안내를 위해 이름과 연락처를 입력해 주세요.",
    phoneHint: "수령 안내를 위해 필요합니다.",
  },
  visitor: {
    title: "방문자 정보",
    hint: "매장 방문 일정을 안내받을 연락처를 입력해 주세요.",
    phoneHint: "방문 일정 안내를 위해 필요합니다.",
  },
};

export function OrderRequestCustomerFields({
  values,
  onChange,
  variant = "orderer",
}: {
  values: CustomerFormValues;
  onChange: (patch: Partial<CustomerFormValues>) => void;
  variant?: CustomerFieldsVariant;
}) {
  const copy = COPY[variant];

  return (
    <section
      className="checkout-card space-y-3"
      id="order-request-customer"
      data-checkout-info-section={variant === "visitor" ? "store_install_customer" : "store_pickup_customer"}
    >
      <h2 className="checkout-card__title">{copy.title}</h2>
      <p className="checkout-card__hint">{copy.hint}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-black text-slate-800">
            이름 <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            autoComplete="name"
            className="checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="홍길동"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black text-slate-800">
            연락처 <span className="text-red-600">*</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            required
            className="checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium"
            value={values.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="010-0000-0000"
          />
          <span className="mt-1 block text-[10px] font-medium text-slate-500">
            {copy.phoneHint}
          </span>
        </label>
      </div>
    </section>
  );
}
