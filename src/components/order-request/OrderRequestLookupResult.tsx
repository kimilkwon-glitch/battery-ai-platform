"use client";

import Link from "next/link";
import { CUSTOMER_ORDER_REQUEST_STATUS } from "@/lib/order-request/order-request-customer-status";
import {
  ORDER_REQUEST_LOOKUP_COPY,
  ORDER_REQUEST_LOOKUP_CTAS,
} from "@/data/order-request-lookup-copy";
import type { CustomerOrderRequestLookup } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

export function OrderRequestLookupResult({ lookup }: { lookup: CustomerOrderRequestLookup }) {
  const badge = CUSTOMER_ORDER_REQUEST_STATUS[lookup.status];

  return (
    <div className="order-request-lookup-result space-y-5" data-page="order-request-lookup-result">
      <section
        className={`${bm.card} ${bm.cardPad} border-blue-100/80 bg-gradient-to-br from-white to-blue-50/20`}
      >
        <p className="text-[10px] font-black uppercase tracking-wide text-blue-800">
          상담 접수 상태
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${badge.badgeClass}`}
          >
            {lookup.statusLabel}
          </span>
          <span className="text-xs font-medium text-slate-600">{lookup.statusDescription}</span>
        </div>
        <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-100">
            <dt className="font-bold text-slate-500">접수번호</dt>
            <dd className="font-mono font-black text-slate-900">{lookup.requestNumber}</dd>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-100">
            <dt className="font-bold text-slate-500">접수일</dt>
            <dd className="font-black text-slate-900">
              {new Date(lookup.createdAt).toLocaleString("ko-KR")}
            </dd>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-100 sm:col-span-2">
            <dt className="font-bold text-slate-500">최근 업데이트</dt>
            <dd className="font-black text-slate-900">
              {new Date(lookup.updatedAt).toLocaleString("ko-KR")}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[10px] font-bold text-slate-500">
          실제 결제·배송 주문조회가 아닌 상담 접수 상태 조회입니다.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">차량·상품 정보</h2>
        <dl className="grid gap-2 text-xs font-medium text-slate-700">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">신청 고객</dt>
            <dd className="font-black">{lookup.customerNameMasked}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">차량</dt>
            <dd className="font-black">
              {[lookup.vehicleName, lookup.vehicleYear].filter(Boolean).join(" · ") ||
                "차량 정보 확인 중"}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="font-bold text-slate-500">배터리 규격</dt>
            <dd className="font-black">{lookup.batterySpecSummary || "규격 확인 중"}</dd>
          </div>
          {lookup.productSummaries.length > 0 ? (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="font-bold text-slate-500">상담 상품</dt>
              <dd className="font-black">{lookup.productSummaries.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">폐전지 반납</h2>
        <p className="text-sm font-black text-slate-800">{lookup.usedBatteryReturnLabel}</p>
        <p className="text-xs font-medium text-slate-600">
          {ORDER_REQUEST_LOOKUP_COPY.usedBatteryNote}
        </p>
        <Link href={ORDER_REQUEST_LOOKUP_CTAS.usedBattery.href} className={`${bm.btnTertiary} text-xs`}>
          {ORDER_REQUEST_LOOKUP_CTAS.usedBattery.label}
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">수령·설치 방식</h2>
        <p className="text-sm font-black text-slate-800">{lookup.fulfillmentLabel}</p>
        {lookup.storeLabel ? (
          <p className="text-xs text-slate-600">매장: {lookup.storeLabel}</p>
        ) : null}
        {lookup.requestedRegion ? (
          <p className="text-xs text-slate-600">출장 지역: {lookup.requestedRegion}</p>
        ) : null}
        {lookup.preferredTime ? (
          <p className="text-xs text-slate-600">희망 시간: {lookup.preferredTime}</p>
        ) : null}
      </section>

      {lookup.customerMemo ? (
        <section className={`${bm.card} ${bm.cardPad} text-xs`}>
          <h2 className="font-black text-slate-900">요청하신 내용</h2>
          <p className="mt-2 whitespace-pre-wrap font-medium text-slate-700">
            {lookup.customerMemo}
          </p>
        </section>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad} border-dashed border-blue-200 bg-blue-50/30`}>
        <h2 className="text-sm font-black text-slate-900">
          {ORDER_REQUEST_LOOKUP_COPY.nextGuideTitle}
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
          {lookup.customerGuide}
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <div className="flex flex-wrap gap-2">
          <Link href={ORDER_REQUEST_LOOKUP_CTAS.customerHub.href} className={`${bm.btnNavy} text-xs`}>
            {ORDER_REQUEST_LOOKUP_CTAS.customerHub.label}
          </Link>
          <Link href={ORDER_REQUEST_LOOKUP_CTAS.photoCheck.href} className={`${bm.btnSecondary} text-xs`}>
            {ORDER_REQUEST_LOOKUP_CTAS.photoCheck.label}
          </Link>
          <Link href={ORDER_REQUEST_LOOKUP_CTAS.orderGuide.href} className={`${bm.btnTertiary} text-xs`}>
            {ORDER_REQUEST_LOOKUP_CTAS.orderGuide.label}
          </Link>
        </div>
      </section>
    </div>
  );
}
