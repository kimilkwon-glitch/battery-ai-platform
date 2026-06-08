"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { apiConfirmCommercePayment } from "@/lib/payment/commerce-order-client";
import { CHECKOUT_PAGE } from "@/lib/payment/payment-routes";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import {
  COMMERCE_LIFECYCLE_LABELS,
  COMMERCE_PAYMENT_STATUS_LABELS,
} from "@/types/commerce-order";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { PaymentConfirmResponse } from "@/types/commerce-payment";
import { CONTACT } from "@/lib/contact-info";
import { bm } from "@/lib/design-tokens";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { COMMERCE_ORDER_LOOKUP_PAGE } from "@/lib/customer-center-routes";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

function PaymentSuccessContent() {
  const { isLoggedIn, ready: authReady } = useCustomerAuth();
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey")?.trim() ?? "";
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const amountRaw = searchParams.get("amount")?.trim() ?? "";
  const paymentRequestId = searchParams.get("paymentRequestId")?.trim() ?? "";
  const amount = amountRaw ? Number(amountRaw) : NaN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentConfirmResponse | null>(null);
  const confirmStarted = useRef(false);

  useEffect(() => {
    if (confirmStarted.current) return;
    if (!paymentKey || !orderId || Number.isNaN(amount)) {
      setLoading(false);
      return;
    }
    confirmStarted.current = true;

    void apiConfirmCommercePayment({
      paymentKey,
      orderId,
      amount,
      paymentRequestId: paymentRequestId || undefined,
    }).then((res) => {
      if (!res.ok) {
        setError(res.message);
        setLoading(false);
        return;
      }
      setResult(res.data);
      setLoading(false);
    });
  }, [paymentKey, orderId, amount, paymentRequestId]);

  if (loading) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
        <p className="text-sm font-bold text-slate-800">결제 결과를 확인하는 중입니다</p>
        <p className="mt-1 text-xs font-medium text-slate-500">잠시만 기다려 주세요.</p>
      </div>
    );
  }

  if (!result || error) {
    return (
      <div className="payment-success space-y-5" data-page="payment-success" data-state="unknown">
        <section className={`${bm.card} ${bm.cardPad} space-y-3 text-center`}>
          <h1 className="text-lg font-black text-slate-950">결제 결과를 확인할 수 없습니다</h1>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            {error ??
              "결제가 완료되지 않았거나, 확인에 필요한 정보가 없습니다. 주문서에서 내용을 다시 확인해 주세요."}
          </p>
          <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
            주문서로 돌아가기
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="payment-success space-y-5" data-page="payment-success" data-state="completed">
      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h1 className="text-lg font-black text-emerald-950">결제가 완료되었습니다</h1>
        <p className="text-sm font-medium text-slate-600">
          주문이 접수되었습니다. 배송·장착 일정은 주문 상태에서 확인하실 수 있습니다.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-bold text-slate-500">주문번호</dt>
            <dd className="font-mono font-black text-blue-800">{result.orderNumber}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">결제금액</dt>
            <dd className="font-black tabular-nums text-blue-700">
              {formatPriceWon(result.amount)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-bold text-slate-500">주문 상품</dt>
            <dd className="font-black text-slate-900">
              {result.productName ?? "배터리 상품"}
              {result.brand ? ` · ${result.brand}` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">고객명</dt>
            <dd className="font-black text-slate-900">{result.customerName ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">차량명</dt>
            <dd className="font-black text-slate-900">{result.vehicleName ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">수령/장착</dt>
            <dd className="font-black text-slate-900">
              {result.fulfillmentType
                ? FULFILLMENT_METHOD_LABELS[result.fulfillmentType] ?? result.fulfillmentType
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">주문 상태</dt>
            <dd className="font-black text-slate-900">
              {COMMERCE_LIFECYCLE_LABELS[result.orderStatus]}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500">결제 상태</dt>
            <dd className="font-black text-slate-900">
              {COMMERCE_PAYMENT_STATUS_LABELS[result.paymentStatus]}
            </dd>
          </div>
        </dl>
        <p className="text-[11px] font-medium text-slate-500">
          수령·장착 일정은 문자 또는 고객센터({CONTACT.customerCenter.phone})로 안내드립니다.
        </p>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/" className={`${bm.btnNavy} justify-center text-sm`}>
          홈으로
        </Link>
        <Link
          href={authReady && isLoggedIn ? `${CUSTOMER_MYPAGE}#orders` : COMMERCE_ORDER_LOOKUP_PAGE}
          className={`${bm.btnTertiary} justify-center text-sm`}
        >
          {authReady && isLoggedIn ? "주문 내역 보기" : "주문 조회"}
        </Link>
      </div>
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
