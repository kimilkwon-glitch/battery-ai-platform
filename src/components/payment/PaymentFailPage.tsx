"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { apiRecordPaymentFail } from "@/lib/payment/commerce-order-client";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { CHECKOUT_PAGE, CHECKOUT_REVIEW_PAGE } from "@/lib/payment/payment-routes";
import { loadCheckoutOrderMeta } from "@/lib/payment/checkout-session-storage";
import { bm } from "@/lib/design-tokens";

const FAIL_REASONS: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제가 취소되었습니다.",
  USER_CANCEL: "결제가 취소되었습니다.",
  TIMEOUT: "결제 시간이 초과되었습니다.",
  NETWORK: "통신 오류가 발생했습니다.",
};

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const code = searchParams.get("code")?.trim() ?? "";
  const message = searchParams.get("message")?.trim() ?? "";
  const [retryHref, setRetryHref] = useState<string>(CHECKOUT_PAGE);
  const recorded = useRef(false);

  useEffect(() => {
    const meta = loadCheckoutOrderMeta();
    if (orderId && meta?.paymentRequestId) {
      setRetryHref(CHECKOUT_REVIEW_PAGE);
    }
  }, [orderId]);

  useEffect(() => {
    if (recorded.current || !orderId) return;
    recorded.current = true;
    void apiRecordPaymentFail({
      orderId,
      errorCode: code || undefined,
      errorMessage: message || FAIL_REASONS[code] || undefined,
    });
  }, [orderId, code, message]);

  const reason =
    (code && FAIL_REASONS[code]) ||
    (message && message.length < 120 ? message : null) ||
    "결제 진행 중 문제가 발생했습니다. 주문 정보를 다시 확인한 뒤 시도해 주세요.";

  return (
    <div className="payment-fail space-y-5" data-page="payment-fail">
      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h1 className="text-lg font-black text-red-950">결제를 완료하지 못했습니다</h1>
        <p className="text-sm font-medium leading-relaxed text-slate-700">{reason}</p>
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          주문 정보를 다시 확인한 뒤 시도해 주세요.
        </p>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={CHECKOUT_PAGE} className={`${bm.btnTertiary} justify-center text-sm`}>
          주문서로 돌아가기
        </Link>
        <Link
          href={retryHref}
          className={`${bm.btnNavy} justify-center text-sm font-black`}
          data-payment-retry
        >
          다시 결제하기
        </Link>
        <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnTertiary} justify-center text-sm`}>
          고객센터 문의
        </Link>
      </div>
    </div>
  );
}

export function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
          <p className="text-sm font-bold text-slate-800">불러오는 중…</p>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
