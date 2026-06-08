"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { PaymentPrepareResponse } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

type Props = {
  prepare: PaymentPrepareResponse;
  onPayError?: (message: string) => void;
};

type TossPaymentsInstance = Awaited<ReturnType<typeof loadTossPayments>>;

export function TossPaymentWidget({ prepare, onPayError }: Props) {
  const [widgetReady, setWidgetReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [usePaymentWindow, setUsePaymentWindow] = useState(false);
  const widgetsRef = useRef<Awaited<ReturnType<TossPaymentsInstance["widgets"]>> | null>(null);
  const paymentRef = useRef<Awaited<ReturnType<TossPaymentsInstance["payment"]>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setInitError(null);
      setUsePaymentWindow(false);
      widgetsRef.current = null;
      paymentRef.current = null;

      try {
        const tossPayments = await loadTossPayments(prepare.clientKey);
        try {
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
          // TODO(live-open): 라이브 키·어드민 variantKey 적용 후 renderAgreement 정상 렌더 여부 수동 검수
          try {
            await widgets.renderAgreement({
              selector: "#toss-agreement",
              variantKey: "AGREEMENT",
            });
          } catch {
            // 테스트 키·미설정 variantKey — 결제수단 UI만으로 진행
          }
          if (!cancelled) {
            widgetsRef.current = widgets;
            setWidgetReady(true);
          }
        } catch {
          paymentRef.current = tossPayments.payment({ customerKey: ANONYMOUS });
          if (!cancelled) {
            setUsePaymentWindow(true);
            setWidgetReady(true);
          }
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
    if (paying) return;
    setPaying(true);

    try {
      if (usePaymentWindow && paymentRef.current) {
        await paymentRef.current.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: prepare.amount },
          orderId: prepare.orderId,
          orderName: prepare.orderName,
          successUrl: prepare.successUrl,
          failUrl: prepare.failUrl,
          customerEmail: prepare.customerEmail,
          customerName: prepare.customerName,
          customerMobilePhone: prepare.customerMobilePhone,
        });
        return;
      }

      if (!widgetsRef.current) {
        onPayError?.("결제 요청을 시작하지 못했습니다. 다시 시도해 주세요.");
        setPaying(false);
        return;
      }

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
  }, [prepare, paying, onPayError, usePaymentWindow]);

  if (initError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center" role="alert">
        <p className="text-sm font-medium text-amber-950">{initError}</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" data-toss-payment-widget data-toss-mode={usePaymentWindow ? "window" : "widget"}>
      {usePaymentWindow ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-700">
          카드 결제를 토스페이먼츠 보안 결제창에서 진행합니다.
        </p>
      ) : (
        <>
          <div
            id="toss-payment-method"
            className={`min-h-[120px] rounded-xl border border-slate-200 bg-white p-2 ${loading ? "animate-pulse" : ""}`}
          />
          <div id="toss-agreement" className="rounded-xl border border-slate-100 bg-slate-50/50 p-2" />
        </>
      )}
      <button
        type="button"
        disabled={!widgetReady || paying || loading}
        onClick={() => void handlePay()}
        className={`${bm.btnNavy} w-full justify-center text-sm font-black disabled:opacity-50`}
        data-toss-pay-button
      >
        {paying ? "결제 진행 중…" : loading ? "결제 수단 불러오는 중…" : "결제하기"}
      </button>
    </section>
  );
}
