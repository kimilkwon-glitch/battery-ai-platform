"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetchOrderSummary } from "@/lib/payment/commerce-order-client";
import { CHECKOUT_PAGE } from "@/lib/payment/payment-routes";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import {
  COMMERCE_LIFECYCLE_LABELS,
  COMMERCE_PAYMENT_STATUS_LABELS,
} from "@/types/commerce-order";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { bm } from "@/lib/design-tokens";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const paymentRequestId = searchParams.get("paymentRequestId")?.trim() ?? "";
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof apiFetchOrderSummary>> | null>(null);

  useEffect(() => {
    if (!orderId || !paymentRequestId) {
      setLoading(false);
      return;
    }

    void apiFetchOrderSummary(orderId, paymentRequestId).then((res) => {
      setOrder(res);
      if (res.ok && res.order.paymentStatus === "completed") {
        setConfirmed(true);
      }
      setLoading(false);
    });
  }, [orderId, paymentRequestId]);

  if (loading) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
        <p className="text-sm font-bold text-slate-800">결제 결과를 확인하는 중입니다</p>
      </div>
    );
  }

  if (!confirmed || !order?.ok) {
    return (
      <div className="payment-success space-y-5" data-page="payment-success" data-state="unknown">
        <section className={`${bm.card} ${bm.cardPad} space-y-3 text-center`}>
          <h1 className="text-lg font-black text-slate-950">결제 결과를 확인할 수 없습니다</h1>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            결제가 완료되지 않았거나, 확인에 필요한 정보가 없습니다.
            주문서에서 내용을 다시 확인해 주세요.
          </p>
          <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
            주문서로 돌아가기
          </Link>
        </section>
      </div>
    );
  }

  const o = order.order;
  const fulfillmentLabel =
    FULFILLMENT_METHOD_LABELS[o.fulfillmentType] ?? o.fulfillmentType;

  return (
    <div className="payment-success space-y-5" data-page="payment-success" data-state="completed">
      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h1 className="text-lg font-black text-emerald-950">결제가 완료되었습니다</h1>
        <p className="text-sm font-medium text-slate-600">
          주문이 정상적으로 접수되었습니다. 담당자가 확인 후 안내드리겠습니다.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-bold text-slate-500">주문번호</dt>
            <dd className="font-mono font-black text-blue-800">{o.orderNumber}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">결제금액</dt>
            <dd className="font-black tabular-nums text-blue-700">
              {o.finalAmount != null ? formatPriceWon(o.finalAmount) : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-bold text-slate-500">주문 상품</dt>
            <dd className="font-black text-slate-900">
              {o.productName}
              {o.brand ? ` · ${o.brand}` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">고객명</dt>
            <dd className="font-black text-slate-900">{o.customerName}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">수령/장착</dt>
            <dd className="font-black text-slate-900">{fulfillmentLabel}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">주문 상태</dt>
            <dd className="font-black text-slate-900">
              {COMMERCE_LIFECYCLE_LABELS[o.orderStatus]}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">결제 상태</dt>
            <dd className="font-black text-slate-900">
              {COMMERCE_PAYMENT_STATUS_LABELS[o.paymentStatus]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
          <p className="text-sm font-bold text-slate-800">불러오는 중…</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
