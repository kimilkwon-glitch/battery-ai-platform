"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderRequestLookupResult } from "@/components/order-request/OrderRequestLookupResult";
import {
  ORDER_REQUEST_LOOKUP_COPY,
  ORDER_REQUEST_LOOKUP_CTAS,
} from "@/data/order-request-lookup-copy";
import { lookupOrderRequestApi } from "@/lib/order-request/order-request-lookup-client";
import type { CustomerOrderRequestLookup } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

export function OrderRequestLookupClient() {
  const searchParams = useSearchParams();
  const [requestNumber, setRequestNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState<CustomerOrderRequestLookup | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const rn = searchParams.get("requestNumber");
    if (rn) setRequestNumber(rn);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNotFound(false);
    setLookup(null);
    setLoading(true);

    const res = await lookupOrderRequestApi(requestNumber.trim(), phone.trim());
    setLoading(false);

    if (res.ok) {
      setLookup(res.lookup);
      return;
    }

    if (res.errors?.length) {
      setFormError(res.errors.join(" "));
      return;
    }

    setNotFound(true);
  };

  return (
    <div className="order-request-lookup mx-auto max-w-2xl space-y-5" data-page="order-request-lookup">
      <section className={`${bm.card} ${bm.cardPad} border-slate-200`}>
        <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
          {ORDER_REQUEST_LOOKUP_COPY.pageTitle}
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
          {ORDER_REQUEST_LOOKUP_COPY.pageDescription}
        </p>
      </section>

      <form className={`${bm.card} ${bm.cardPad} space-y-4`} onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <h2 className="text-base font-black text-slate-900">
            {ORDER_REQUEST_LOOKUP_COPY.formTitle}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {ORDER_REQUEST_LOOKUP_COPY.formDescription}
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
            {ORDER_REQUEST_LOOKUP_COPY.orderNumberLabel}
            <input
              type="text"
              required
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-medium sm:text-sm"
              placeholder={ORDER_REQUEST_LOOKUP_COPY.requestNumberPlaceholder}
              value={requestNumber}
              onChange={(e) => setRequestNumber(e.target.value)}
            />
          </label>
          <label className="block text-xs font-black text-slate-800">
            {ORDER_REQUEST_LOOKUP_COPY.phoneLabel}
            <input
              type="tel"
              required
              autoComplete="tel"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-medium sm:text-sm"
              placeholder={ORDER_REQUEST_LOOKUP_COPY.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </div>
        <p className="text-[11px] font-medium text-slate-500">{ORDER_REQUEST_LOOKUP_COPY.hint}</p>
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
          {loading ? ORDER_REQUEST_LOOKUP_COPY.loading : ORDER_REQUEST_LOOKUP_COPY.submitLabel}
        </button>
      </form>

      {notFound ? (
        <section className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}>
          <h2 className="text-lg font-black text-slate-950">
            {ORDER_REQUEST_LOOKUP_COPY.notFoundTitle}
          </h2>
          <p className="text-sm font-medium text-slate-600">
            {ORDER_REQUEST_LOOKUP_COPY.notFoundBody}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={ORDER_REQUEST_LOOKUP_CTAS.customerHub.href} className={`${bm.btnNavy} text-sm`}>
              {ORDER_REQUEST_LOOKUP_CTAS.customerHub.label}
            </Link>
            <Link href={ORDER_REQUEST_LOOKUP_CTAS.home.href} className={`${bm.btnTertiary} text-sm`}>
              {ORDER_REQUEST_LOOKUP_CTAS.home.label}
            </Link>
          </div>
        </section>
      ) : null}

      {lookup ? <OrderRequestLookupResult lookup={lookup} /> : null}
    </div>
  );
}
