"use client";

import { bm } from "@/lib/design-tokens";

export type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
  orderMemo: string;
};

export function OrderRequestCustomerFields({
  values,
  onChange,
}: {
  values: CustomerFormValues;
  onChange: (patch: Partial<CustomerFormValues>) => void;
}) {
  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-customer">
      <h2 className="text-sm font-black text-slate-900">고객 정보</h2>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-black text-slate-800">
            이름 <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
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
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="010-0000-0000"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black text-slate-800">
            이메일 <span className="text-slate-400">(선택)</span>
          </span>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="example@email.com"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black text-slate-800">
            주문자 메모 <span className="text-slate-400">(선택)</span>
          </span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            value={values.orderMemo}
            onChange={(e) => onChange({ orderMemo: e.target.value })}
            placeholder="연락 가능 시간 등"
          />
        </label>
      </div>
    </section>
  );
}
