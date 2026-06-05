"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetchOrderSummary } from "@/lib/payment/commerce-order-client";
import { CHECKOUT_PAGE, paymentFailUrl } from "@/lib/payment/payment-routes";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { OrderSummaryResponse } from "@/lib/payment/commerce-order-client";
import { bm } from "@/lib/design-tokens";

function PaymentReadyContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const paymentRequestId = searchParams.get("paymentRequestId")?.trim() ?? "";
  const [order, setOrder] = useState<OrderSummaryResponse["order"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !paymentRequestId) {
      setLoading(false);
      setError("주문 정보를 확인할 수 없습니다.");
      return;
    }

    void apiFetchOrderSummary(orderId, paymentRequestId).then((res) => {
      if (!res.ok) {
        setError(res.message);
        setLoading(false);
        return;
      }
      setOrder(res.order);
      setLoading(false);
    });
  }, [orderId, paymentRequestId]);

  if (loading) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
        <p className="text-sm font-bold text-slate-800">결제 정보를 불러오는 중입니다</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}>
        <h2 className="text-base font-black text-slate-900">결제 정보를 확인할 수 없습니다</h2>
        <p className="text-sm font-medium text-slate-600">
          {error ?? "주문서를 다시 확인해 주세요."}
        </p>
        <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
          주문서로 돌아가기
        </Link>
      </div>
    );
  }

  const fulfillmentLabel =
    FULFILLMENT_METHOD_LABELS[order.fulfillmentType] ?? order.fulfillmentType;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const successUrl = `${origin}/payment/success?orderId=${encodeURIComponent(order.orderId)}&paymentRequestId=${encodeURIComponent(paymentRequestId)}`;
  const failUrl = `${origin}${paymentFailUrl(order.orderId)}`;
  const returnUrl = `${origin}/payment/ready?orderId=${encodeURIComponent(order.orderId)}&paymentRequestId=${encodeURIComponent(paymentRequestId)}`;

  return (
    <div className="payment-ready space-y-5" data-page="payment-ready">
      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h1 className="text-lg font-black text-slate-950">결제 준비</h1>
        <p className="text-sm font-medium leading-relaxed text-slate-700">
          자사몰 결제 시스템을 준비 중입니다.
        </p>
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          현재는 결제 예정금액 확인 단계이며, 실제 결제는 아직 실행되지 않습니다.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h2 className="text-sm font-black text-slate-900">주문 요약</h2>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-bold text-slate-500">주문번호</dt>
            <dd className="font-mono font-black text-blue-800">{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">고객명</dt>
            <dd className="font-black text-slate-900">{order.customerName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-bold text-slate-500">주문 상품</dt>
            <dd className="font-black text-slate-900">
              {order.productName}
              {order.brand ? ` · ${order.brand}` : ""} ({order.batteryCode})
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">수령/장착</dt>
            <dd className="font-black text-slate-900">{fulfillmentLabel}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">결제 예정금액</dt>
            <dd className="text-base font-black tabular-nums text-blue-700">
              {order.finalAmount != null ? formatPriceWon(order.finalAmount) : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center"
        data-pg-widget-mount
        data-order-id={order.orderId}
        data-payment-request-id={paymentRequestId}
        data-amount={order.finalAmount ?? ""}
        data-order-name={`${order.productName} (${order.batteryCode})`}
        data-customer-name={order.customerName}
        data-customer-phone={order.customerPhone}
        data-fulfillment-type={order.fulfillmentType}
        data-return-url={returnUrl}
        data-success-url={successUrl}
        data-fail-url={failUrl}
        aria-hidden="false"
      >
        <p className="text-sm font-bold text-slate-700">
          결제 수단 선택 영역
        </p>
        <p className="mt-2 text-xs font-medium text-slate-500">
          실제 결제 기능은 곧 제공될 예정입니다.
        </p>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={CHECKOUT_PAGE} className={`${bm.btnTertiary} justify-center text-sm`}>
          주문서로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export function PaymentReadyPage() {
  return (
    <Suspense
      fallback={
        <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
          <p className="text-sm font-bold text-slate-800">불러오는 중…</p>
        </div>
      }
    >
      <PaymentReadyContent />
    </Suspense>
  );
}
