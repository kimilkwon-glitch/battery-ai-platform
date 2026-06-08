"use client";

import Link from "next/link";
import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import {
  COMMERCE_ORDER_LOOKUP_COPY,
  COMMERCE_ORDER_LOOKUP_CTAS,
} from "@/data/commerce-order-lookup-copy";
import { bm } from "@/lib/design-tokens";

function statusBadgeClass(orderStatus: string, paymentStatus: string): string {
  if (paymentStatus === "failed" || orderStatus === "payment_failed") {
    return "bg-red-50 text-red-800 ring-red-200";
  }
  if (orderStatus === "canceled" || paymentStatus === "canceled") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }
  if (paymentStatus === "completed" || orderStatus === "payment_completed" || orderStatus === "completed") {
    return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  }
  if (orderStatus === "preparing" || orderStatus === "shipping") {
    return "bg-violet-50 text-violet-900 ring-violet-200";
  }
  return "bg-amber-50 text-amber-900 ring-amber-200";
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "금액 확인 중";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function CommerceOrderLookupResult({
  lookup,
}: {
  lookup: CommerceOrderGuestLookupResult;
}) {
  const badgeClass = statusBadgeClass(lookup.orderStatus, lookup.paymentStatus);

  return (
    <div className="commerce-order-lookup-result space-y-5" data-page="commerce-order-lookup-result">
      <section
        className={`${bm.card} ${bm.cardPad} border-slate-200 bg-gradient-to-br from-white to-slate-50/60`}
      >
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">주문 상태</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${badgeClass}`}
          >
            {lookup.orderStatusLabel}
          </span>
          <span className="text-xs font-semibold text-slate-600">{lookup.paymentStatusLabel}</span>
        </div>
        <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
            <dt className="font-bold text-slate-500">주문번호</dt>
            <dd className="font-mono text-sm font-black text-slate-900">{lookup.orderNumber}</dd>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
            <dt className="font-bold text-slate-500">주문일</dt>
            <dd className="font-black text-slate-900">{formatDate(lookup.createdAt)}</dd>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-violet-100 sm:col-span-2">
            <dt className="font-bold text-slate-500">최종금액</dt>
            <dd className="text-base font-black tabular-nums text-violet-800">
              {formatAmount(lookup.finalAmount)}
            </dd>
          </div>
        </dl>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">상품·수령 정보</h2>
        <dl className="grid gap-2 text-xs">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">상품명</dt>
            <dd className="font-black text-slate-900">
              {lookup.productName}
              {lookup.brand ? (
                <span className="ml-1 font-medium text-slate-500">({lookup.brand})</span>
              ) : null}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">배터리 규격</dt>
            <dd className="font-black text-slate-900">{lookup.batteryCode}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">수령/장착방식</dt>
            <dd className="font-black text-slate-900">{lookup.fulfillmentLabel}</dd>
          </div>
          {lookup.selectedStoreLabel ? (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="font-bold text-slate-500">선택 지점</dt>
              <dd className="font-black text-slate-900">{lookup.selectedStoreLabel}</dd>
            </div>
          ) : null}
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">폐배터리</dt>
            <dd className="font-black text-slate-900">
              {lookup.returnBatteryLabel}
              {lookup.batteryReturnFee != null && lookup.batteryReturnFee > 0
                ? ` · 미반납 추가 ${lookup.batteryReturnFee.toLocaleString("ko-KR")}원`
                : null}
            </dd>
          </div>
        </dl>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">고객 정보</h2>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">고객명</dt>
            <dd className="font-black text-slate-900">{lookup.customerNameMasked}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">연락처</dt>
            <dd className="font-black text-slate-900">{lookup.customerPhoneMasked}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 sm:col-span-2">
            <dt className="font-bold text-slate-500">주소</dt>
            <dd className="font-medium text-slate-800">{lookup.addressSummary}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href={COMMERCE_ORDER_LOOKUP_CTAS.customerHub.href}
          className={`${bm.btnNavy} text-xs no-underline`}
        >
          {COMMERCE_ORDER_LOOKUP_CTAS.customerHub.label}
        </Link>
        <Link
          href={COMMERCE_ORDER_LOOKUP_CTAS.consultationLookup.href}
          className={`${bm.btnTertiary} text-xs no-underline`}
        >
          {COMMERCE_ORDER_LOOKUP_CTAS.consultationLookup.label}
        </Link>
      </div>

      <p className="text-[11px] font-medium text-slate-500">
        {COMMERCE_ORDER_LOOKUP_COPY.consultationNote}
      </p>
    </div>
  );
}
