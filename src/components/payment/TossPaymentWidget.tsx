"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { PaymentPrepareResponse } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

type Props = {
  prepare: PaymentPrepareResponse;
  onPayError?: (message: string) => void;
};

export function TossPaymentWidget({ prepare, onPayError }: Props) {
  const [widgetReady, setWidgetReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const widgetsRef = useRef<Awaited<ReturnType<Awaited<ReturnType<typeof loadTossPayments>>["widgets"]>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setInitError(null);
      try {
        const tossPayments = await loadTossPayments(prepare.clientKey);
        const widgets = tossPayments.widgets({
          customerKey: ANONYMOUS,
        });
        await widgets.setAmount({
          currency: "KRW",
          value: prepare.amount,
        });
        await widgets.renderPaymentMethods({
          selector: "#toss-payment-method",
          variantKey: "DEFAULT",
        });
        await widgets.renderAgreement({
          selector: "#toss-agreement",
          variantKey: "AGREEMENT",
        });
        if (!cancelled) {
          widgetsRef.current = widgets;
          setWidgetReady(true);
        }
      } catch {
        if (!cancelled) {
          setInitError(
            "결제 화면을 불러오지 못했습니다. 잠시 후 다시 시도하거나 고객센터로 문의해 주세요.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [prepare.clientKey, prepare.amount, prepare.paymentRequestId]);

  const handlePay = useCallback(async () => {
    if (!widgetsRef.current || paying) return;
    setPaying(true);

    try {
      await widgetsRef.current.requestPayment({
        orderId: prepare.orderId,
        orderName: prepare.orderName,
        successUrl: prepare.successUrl,
        failUrl: prepare.failUrl,
        customerEmail: prepare.customerEmail,
        customerName: prepare.customerName,
        customerMobilePhone: prepare.customerMobilePhone,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "결제 요청을 시작하지 못했습니다. 다시 시도해 주세요.";
      onPayError?.(message);
      setPaying(false);
    }
  }, [prepare, paying, onPayError]);

  if (initError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center" role="alert">
        <p className="text-sm font-medium text-amber-950">{initError}</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" data-toss-payment-widget>
      <div
        id="toss-payment-method"
        className={`min-h-[120px] rounded-xl border border-slate-200 bg-white p-2 ${loading ? "animate-pulse" : ""}`}
      />
      <div id="toss-agreement" className="rounded-xl border border-slate-100 bg-slate-50/50 p-2" />
      <button
        type="button"
        disabled={!widgetReady || paying || loading}
        onClick={() => void handlePay()}
        className={`${bm.btnNavy} w-full justify-center text-sm font-black disabled:opacity-50`}
        data-toss-pay-button
      >
        {paying ? "결제 진행 중…" : loading ? "결제 화면 준비 중…" : "결제하기"}
      </button>
    </section>
  );
}
