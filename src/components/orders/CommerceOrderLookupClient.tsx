"use client";

import Link from "next/link";
import { useState } from "react";
import { CommerceOrderLookupList } from "@/components/orders/CommerceOrderLookupList";
import { CommerceOrderLookupResult } from "@/components/orders/CommerceOrderLookupResult";
import {
  COMMERCE_ORDER_LOOKUP_COPY,
  COMMERCE_ORDER_LOOKUP_CTAS,
} from "@/data/commerce-order-lookup-copy";
import { lookupCommerceOrdersByIdentityApi } from "@/lib/orders/commerce-order-lookup-client";
import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import { bm } from "@/lib/design-tokens";

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function CommerceOrderLookupClient() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<CommerceOrderGuestLookupResult[] | null>(null);
  const [selected, setSelected] = useState<CommerceOrderGuestLookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetLookup = () => {
    setOrders(null);
    setSelected(null);
    setNotFound(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNotFound(false);
    setOrders(null);
    setSelected(null);

    if (!customerName.trim()) {
      setFormError("주문자명을 입력해 주세요.");
      return;
    }
    if (!phone.trim()) {
      setFormError("연락처를 입력해 주세요.");
      return;
    }

    setLoading(true);
    const res = await lookupCommerceOrdersByIdentityApi(customerName, phone);
    setLoading(false);

    if (res.ok) {
      setOrders(res.orders);
      if (res.orders.length === 1) {
        setSelected(res.orders[0] ?? null);
      }
      return;
    }

    if (res.message.includes("일치")) {
      setNotFound(true);
      return;
    }
    setFormError(res.message);
  };

  if (selected) {
    return (
      <div className="commerce-order-lookup mx-auto max-w-2xl space-y-4" data-page="commerce-order-lookup">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h1 className="text-lg font-black text-slate-950">주문 상세</h1>
          <button
            type="button"
            onClick={() => {
              if (orders && orders.length > 1) {
                setSelected(null);
              } else {
                resetLookup();
              }
            }}
            className="shrink-0 text-xs font-bold text-blue-700 underline"
          >
            {orders && orders.length > 1 ? "목록으로" : COMMERCE_ORDER_LOOKUP_COPY.anotherLookup}
          </button>
        </div>
        <CommerceOrderLookupResult lookup={selected} verifiedPhone={phone.replace(/\D/g, "")} />
      </div>
    );
  }

  if (orders && orders.length > 0) {
    return (
      <div className="commerce-order-lookup mx-auto max-w-2xl space-y-4" data-page="commerce-order-lookup">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h1 className="text-lg font-black text-slate-950">{COMMERCE_ORDER_LOOKUP_COPY.listTitle}</h1>
          <button
            type="button"
            onClick={resetLookup}
            className="shrink-0 text-xs font-bold text-blue-700 underline"
          >
            {COMMERCE_ORDER_LOOKUP_COPY.anotherLookup}
          </button>
        </div>
        <CommerceOrderLookupList orders={orders} onSelect={setSelected} />
      </div>
    );
  }

  return (
    <div className="commerce-order-lookup mx-auto max-w-2xl space-y-4" data-page="commerce-order-lookup">
      <header className="px-0.5 pt-1">
        <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
          {COMMERCE_ORDER_LOOKUP_COPY.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{COMMERCE_ORDER_LOOKUP_COPY.pageDescription}</p>
      </header>

      <form
        className={`${bm.card} ${bm.cardPad} space-y-3 !py-4 sm:!py-5`}
        onSubmit={(e) => void handleSubmit(e)}
      >
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <div className="grid gap-3">
          <label className="block text-sm font-bold text-slate-800">
            {COMMERCE_ORDER_LOOKUP_COPY.nameLabel}
            <input
              type="text"
              required
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base font-medium sm:text-sm"
              placeholder={COMMERCE_ORDER_LOOKUP_COPY.namePlaceholder}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-bold text-slate-800">
            {COMMERCE_ORDER_LOOKUP_COPY.phoneLabel}
            <input
              type="tel"
              required
              autoComplete="tel"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base font-medium sm:text-sm"
              placeholder={COMMERCE_ORDER_LOOKUP_COPY.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            />
          </label>
        </div>
        {formError ? (
          <p className="text-sm font-bold text-red-700" role="alert">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className={`${bm.btnNavy} w-full justify-center py-2.5 text-sm disabled:opacity-50`}
        >
          {loading ? COMMERCE_ORDER_LOOKUP_COPY.loading : COMMERCE_ORDER_LOOKUP_COPY.submitLabel}
        </button>
        <p className="text-center text-xs text-slate-500">{COMMERCE_ORDER_LOOKUP_COPY.hint}</p>
      </form>

      {notFound ? (
        <section className={`${bm.card} ${bm.cardPad} border-red-100 bg-red-50/40`} role="alert">
          <h2 className="text-sm font-black text-red-900">{COMMERCE_ORDER_LOOKUP_COPY.notFoundTitle}</h2>
          <p className="mt-1 text-sm text-red-800">{COMMERCE_ORDER_LOOKUP_COPY.notFoundBody}</p>
          <Link
            href={COMMERCE_ORDER_LOOKUP_CTAS.consultationLookup.href}
            className="mt-2 inline-block text-xs font-bold text-slate-600 underline"
          >
            상담 접수 조회
          </Link>
        </section>
      ) : null}
    </div>
  );
}
