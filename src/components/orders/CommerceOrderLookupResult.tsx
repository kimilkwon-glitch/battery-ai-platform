"use client";

import Link from "next/link";
import { DeliveryTrackingPanel } from "@/components/delivery/DeliveryTrackingPanel";
import { OrderClaimActions } from "@/components/orders/OrderClaimActions";
import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import { COMMERCE_ORDER_LOOKUP_CTAS } from "@/data/commerce-order-lookup-copy";
import { bm } from "@/lib/design-tokens";

function orderStatusBadgeClass(orderStatus: string): string {
  if (orderStatus === "payment_failed") return "bg-red-50 text-red-800 ring-red-200";
  if (orderStatus === "canceled") return "bg-slate-100 text-slate-700 ring-slate-200";
  if (["shipping", "shipped", "in_transit", "delivered"].includes(orderStatus)) {
    return "bg-blue-50 text-blue-900 ring-blue-200";
  }
  if (["preparing", "order_confirmed", "shipping_prep"].includes(orderStatus)) {
    return "bg-violet-50 text-violet-900 ring-violet-200";
  }
  if (["payment_completed", "completed", "work_completed", "picked_up"].includes(orderStatus)) {
    return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  }
  return "bg-amber-50 text-amber-900 ring-amber-200";
}

function paymentStatusBadgeClass(paymentStatus: string): string {
  if (paymentStatus === "failed") return "bg-red-50 text-red-800 ring-red-200";
  if (paymentStatus === "canceled" || paymentStatus === "refunded") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }
  if (paymentStatus === "completed") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
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
  verifiedPhone,
}: {
  lookup: CommerceOrderGuestLookupResult;
  verifiedPhone?: string;
}) {
  return (
    <div className="commerce-order-lookup-result space-y-4" data-page="commerce-order-lookup-result">
      {/* 1. 주문 요약 */}
      <section
        className={`${bm.card} ${bm.cardPad} border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/80 !py-4 sm:!py-5`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500">주문번호</p>
            <p className="mt-0.5 break-all font-mono text-lg font-black leading-snug text-slate-950 sm:text-xl">
              {lookup.orderNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${orderStatusBadgeClass(lookup.orderStatus)}`}
            >
              {lookup.orderStatusLabel}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${paymentStatusBadgeClass(lookup.paymentStatus)}`}
            >
              {lookup.paymentStatusLabel}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-sm sm:grid-cols-2">
          <p>
            <span className="font-bold text-slate-500">주문일 </span>
            <span className="font-semibold text-slate-900">{formatDate(lookup.createdAt)}</span>
          </p>
          <p className="sm:text-right">
            <span className="font-bold text-slate-500">결제금액 </span>
            <span className="text-lg font-black tabular-nums text-violet-800">
              {formatAmount(lookup.finalAmount)}
            </span>
          </p>
        </div>
      </section>

      {/* 2. 배송조회 */}
      {lookup.shipping ? (
        <DeliveryTrackingPanel
          courierCode={lookup.shipping.courierCode}
          courierName={lookup.shipping.courierName}
          invoiceNumber={lookup.shipping.invoiceNumber}
          trackButtonLabel="배송조회하기"
          variant="customer"
          idleStatusLabel={lookup.orderStatusLabel}
          className="shadow-md ring-1 ring-blue-100/90"
        />
      ) : null}

      {/* 3. 상품·수령 */}
      <section className={`${bm.card} ${bm.cardPad} !py-4`}>
        <h2 className="text-sm font-black text-slate-900">상품·수령</h2>
        <p className="mt-2 text-base font-black leading-snug text-slate-950">
          {lookup.productName}
          {lookup.brand ? (
            <span className="ml-1 text-sm font-semibold text-slate-500">({lookup.brand})</span>
          ) : null}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          <dt className="font-bold text-slate-500">배터리 규격</dt>
          <dd className="font-black text-slate-900">{lookup.batteryCode}</dd>
          <dt className="font-bold text-slate-500">수령/장착</dt>
          <dd className="font-semibold text-slate-900">{lookup.fulfillmentLabel}</dd>
          {lookup.selectedStoreLabel ? (
            <>
              <dt className="font-bold text-slate-500">선택 지점</dt>
              <dd className="font-semibold text-slate-900">{lookup.selectedStoreLabel}</dd>
            </>
          ) : null}
          <dt className="font-bold text-slate-500">폐배터리</dt>
          <dd className="font-semibold text-slate-900">
            {lookup.returnBatteryLabel}
            {lookup.batteryReturnFee != null && lookup.batteryReturnFee > 0
              ? ` (+${lookup.batteryReturnFee.toLocaleString("ko-KR")}원)`
              : null}
          </dd>
        </dl>
      </section>

      {/* 4. 고객 정보 */}
      <section className={`${bm.card} ${bm.cardPad} !py-4`}>
        <h2 className="text-sm font-black text-slate-900">고객 정보</h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="w-14 shrink-0 font-bold text-slate-500">고객명</dt>
            <dd className="font-semibold text-slate-900">{lookup.customerNameMasked}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="w-14 shrink-0 font-bold text-slate-500">연락처</dt>
            <dd className="font-semibold text-slate-900">{lookup.customerPhoneMasked}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="w-14 shrink-0 font-bold text-slate-500">주소</dt>
            <dd className="min-w-0 flex-1 break-words font-medium leading-relaxed text-slate-800">
              {lookup.addressSummary}
            </dd>
          </div>
        </dl>
      </section>

      <OrderClaimActions
        order={{
          orderId: lookup.orderId,
          orderNumber: lookup.orderNumber,
          orderStatus: lookup.orderStatus,
          customerName: "고객",
          customerPhone: verifiedPhone ?? "",
          finalAmount: lookup.finalAmount,
          deliveryFee: undefined,
          returnBatteryOption: lookup.batteryReturnType,
          batteryReturnFee: lookup.batteryReturnFee,
        }}
      />

      {/* 5. 하단 버튼 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => window.print()}
          className={`${bm.btnTertiary} w-full justify-center text-sm sm:w-auto`}
        >
          주문서 출력하기
        </button>
        <Link
          href={COMMERCE_ORDER_LOOKUP_CTAS.customerHub.href}
          className={`${bm.btnTertiary} w-full justify-center text-sm no-underline sm:w-auto`}
        >
          {COMMERCE_ORDER_LOOKUP_CTAS.customerHub.label}
        </Link>
        <Link
          href={COMMERCE_ORDER_LOOKUP_CTAS.consultationLookup.href}
          className={`${bm.btnTertiary} w-full justify-center text-sm no-underline sm:w-auto`}
        >
          {COMMERCE_ORDER_LOOKUP_CTAS.consultationLookup.label}
        </Link>
        {["completed", "payment_completed", "shipping"].includes(lookup.orderStatus) ? (
          <Link
            href={`/reviews/write?orderNumber=${encodeURIComponent(lookup.orderNumber)}&battery=${encodeURIComponent(lookup.batteryCode)}`}
            className={`${bm.btnNavy} w-full justify-center text-sm no-underline sm:ml-auto sm:w-auto`}
          >
            후기 작성
          </Link>
        ) : null}
      </div>
    </div>
  );
}
