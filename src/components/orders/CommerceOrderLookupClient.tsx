"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CommerceOrderLookupResult } from "@/components/orders/CommerceOrderLookupResult";
import {
  COMMERCE_ORDER_LOOKUP_COPY,
  COMMERCE_ORDER_LOOKUP_CTAS,
} from "@/data/commerce-order-lookup-copy";
import { lookupCommerceOrderApi } from "@/lib/orders/commerce-order-lookup-client";
import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import { bm } from "@/lib/design-tokens";

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function CommerceOrderLookupClient() {
  const searchParams = useSearchParams();
  const [orderRef, setOrderRef] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState<CommerceOrderGuestLookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const on = searchParams.get("orderNumber") ?? searchParams.get("orderId");
    if (on) setOrderRef(on);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNotFound(false);
    setLookup(null);

    if (!orderRef.trim()) {
      setFormError("주문번호 또는 주문 ID를 입력해 주세요.");
      return;
    }
    if (!phone.trim()) {
      setFormError("휴대폰 번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    const res = await lookupCommerceOrderApi(orderRef, phone);
    setLoading(false);

    if (res.ok) {
      setLookup(res.lookup);
      return;
    }

    if (res.message.includes("입력")) {
      setNotFound(true);
      return;
    }
    setFormError(res.message);
  };

  return (
    <div className="commerce-order-lookup mx-auto max-w-2xl space-y-5" data-page="commerce-order-lookup">
      <section className={`${bm.card} ${bm.cardPad} border-slate-200`}>
        <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
          {COMMERCE_ORDER_LOOKUP_COPY.pageTitle}
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
          {COMMERCE_ORDER_LOOKUP_COPY.pageDescription}
        </p>
      </section>

      <form className={`${bm.card} ${bm.cardPad} space-y-4`} onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <h2 className="text-base font-black text-slate-900">
            {COMMERCE_ORDER_LOOKUP_COPY.formTitle}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {COMMERCE_ORDER_LOOKUP_COPY.formDescription}
          </p>
        </div>
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
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800">
            {COMMERCE_ORDER_LOOKUP_COPY.orderRefLabel}
            <input
              type="text"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-medium sm:text-sm"
              placeholder={COMMERCE_ORDER_LOOKUP_COPY.orderRefPlaceholder}
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
            />
          </label>
          <label className="block text-xs font-black text-slate-800">
            {COMMERCE_ORDER_LOOKUP_COPY.phoneLabel}
            <input
              type="tel"
              required
              autoComplete="tel"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-medium sm:text-sm"
              placeholder={COMMERCE_ORDER_LOOKUP_COPY.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            />
          </label>
        </div>
        <p className="text-[11px] font-medium text-slate-500">{COMMERCE_ORDER_LOOKUP_COPY.hint}</p>
        {formError ? (
          <p className="text-xs font-bold text-red-700" role="alert">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className={`${bm.btnNavy} w-full justify-center py-3 text-sm disabled:opacity-50 sm:w-auto`}
        >
          {loading ? COMMERCE_ORDER_LOOKUP_COPY.loading : COMMERCE_ORDER_LOOKUP_COPY.submitLabel}
        </button>
      </form>

      {notFound ? (
        <section className={`${bm.card} ${bm.cardPad} border-red-100 bg-red-50/40`} role="alert">
          <h2 className="text-sm font-black text-red-900">
            {COMMERCE_ORDER_LOOKUP_COPY.notFoundTitle}
          </h2>
          <p className="mt-1 text-sm font-medium text-red-800">
            {COMMERCE_ORDER_LOOKUP_COPY.notFoundBody}
          </p>
          <Link
            href={COMMERCE_ORDER_LOOKUP_CTAS.consultationLookup.href}
            className="mt-3 inline-block text-xs font-bold text-slate-700 underline"
          >
            상담 접수 조회로 이동
          </Link>
        </section>
      ) : null}

      {lookup ? <CommerceOrderLookupResult lookup={lookup} verifiedPhone={phone.replace(/\D/g, "")} /> : null}
    </div>
  );
}
