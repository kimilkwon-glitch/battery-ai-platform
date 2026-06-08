"use client";

export type CustomerFormValues = {
  name: string;
  phone: string;
  /** 상담 주문 요청 폼 전용 — 결제 주문서에서는 미사용 */
  email?: string;
  orderMemo?: string;
};

export function OrderRequestCustomerFields({
  values,
  onChange,
}: {
  values: CustomerFormValues;
  onChange: (patch: Partial<CustomerFormValues>) => void;
}) {
  return (
    <section className="checkout-card space-y-3" id="order-request-customer">
      <h2 className="checkout-card__title">주문자 정보</h2>
      <p className="checkout-card__hint">주문 확인 및 안내 연락에 사용됩니다.</p>
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
        </label>
      </div>
    </section>
  );
}
