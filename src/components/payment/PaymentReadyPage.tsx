"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PaymentPreparingNotice } from "@/components/checkout/PaymentPreparingNotice";
import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";
import { isCommercePaymentLive } from "@/lib/payment/commerce-checkout-mode";
import {
  apiFetchOrderSummary,
  apiPrepareCommercePayment,
} from "@/lib/payment/commerce-order-client";
import { CHECKOUT_PAGE } from "@/lib/payment/payment-routes";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { OrderSummaryResponse } from "@/lib/payment/commerce-order-client";
import type { PaymentPrepareResponse } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

function PaymentReadyContent() {
  const paymentLive = isCommercePaymentLive();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const paymentRequestId = searchParams.get("paymentRequestId")?.trim() ?? "";
  const [order, setOrder] = useState<OrderSummaryResponse["order"] | null>(null);
  const [prepare, setPrepare] = useState<PaymentPrepareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentLive) {
      setLoading(false);
      return;
    }
    if (!orderId || !paymentRequestId) {
      setLoading(false);
      setError("주문 정보를 확인할 수 없습니다.");
      return;
    }

    void (async () => {
      const summary = await apiFetchOrderSummary(orderId, paymentRequestId);
      if (!summary.ok) {
        setError(summary.message);
        setLoading(false);
        return;
      }
      setOrder(summary.order);

      const prep = await apiPrepareCommercePayment({
        orderId,
        paymentRequestId,
        clientAmount: summary.order.finalAmount,
      });
      if (!prep.ok) {
        setError(prep.message);
        setLoading(false);
        return;
      }
      setPrepare(prep.data);
      setLoading(false);
    })();
  }, [orderId, paymentRequestId, paymentLive]);

  if (!paymentLive) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4`}>
        <PaymentPreparingNotice />
        <p className="text-sm font-medium text-slate-600">
          결제 기능이 준비되는 대로 이 화면에서 안전하게 결제하실 수 있습니다.
        </p>
        <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
          주문서로 돌아가기
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
        <p className="text-sm font-bold text-slate-800">결제 정보를 불러오는 중입니다</p>
      </div>
    );
  }

  if (error || !order || !prepare) {
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

  return (
    <div className="payment-ready space-y-5" data-page="payment-ready">
      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h1 className="text-lg font-black text-slate-950">결제</h1>
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          주문 내용을 확인한 뒤 결제 수단을 선택해 주세요.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h2 className="text-sm font-black text-slate-900">주문 정보</h2>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-bold text-slate-500">주문번호</dt>
            <dd className="font-mono font-black text-blue-800">{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">고객명</dt>
            <dd className="font-black text-slate-900">{order.customerName}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">연락처</dt>
            <dd className="font-black text-slate-900">{order.customerPhone}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">차량명</dt>
            <dd className="font-black text-slate-900">{order.vehicleName ?? "—"}</dd>
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
            <dt className="font-bold text-slate-500">결제 금액</dt>
            <dd className="text-base font-black tabular-nums text-blue-700">
              {formatPriceWon(prepare.amount)}
            </dd>
          </div>
        </dl>
      </section>

      {payError ? (
        <p className="text-xs font-bold text-red-600" role="alert">
          {payError}
        </p>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="mb-3 text-sm font-black text-slate-900">결제 수단</h2>
        <TossPaymentWidget prepare={prepare} onPayError={setPayError} />
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
