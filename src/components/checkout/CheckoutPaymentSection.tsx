"use client";

import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";
import type { PaymentPrepareResponse } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

type Props = {
  prepare: PaymentPrepareResponse | null;
  preparing?: boolean;
  onStartPayment?: () => void;
  canStartPayment?: boolean;
  payError?: string | null;
  onPayError?: (message: string) => void;
};

export function CheckoutSecurityNotice({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50/80 ${compact ? "p-3" : "p-4"} space-y-1.5`}
    >
      <p className={`font-bold text-slate-800 ${compact ? "text-[11px]" : "text-xs"}`}>
        안전한 결제 안내
      </p>
      <ul
        className={`list-inside list-disc space-y-0.5 font-medium text-slate-600 ${compact ? "text-[10px]" : "text-[11px]"}`}
      >
        <li>카드정보는 배터리매니저에 저장되지 않습니다.</li>
        <li>결제는 보안 결제창에서 처리됩니다.</li>
      </ul>
    </div>
  );
}

export function CheckoutPaymentSection({
  prepare,
  preparing,
  onStartPayment,
  canStartPayment,
  payError,
  onPayError,
}: Props) {
  return (
    <section className="checkout-payment-section space-y-3" id="checkout-payment-section">
      <div>
        <h2 className="text-sm font-black text-slate-900">결제 수단</h2>
        <p className="mt-1 text-xs font-medium text-slate-600">
          보안 결제창을 통해 안전하게 결제됩니다.
        </p>
      </div>

      {payError ? (
        <p className="text-xs font-bold text-red-600" role="alert">
          {payError}
        </p>
      ) : null}

      {prepare ? (
        <TossPaymentWidget prepare={prepare} onPayError={onPayError} />
      ) : (
        <div className="space-y-3">
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs font-medium text-slate-600">
            주문 내용을 확인하신 뒤 결제하기를 눌러 주세요.
          </p>
          {onStartPayment ? (
            <button
              type="button"
              disabled={!canStartPayment || preparing}
              onClick={onStartPayment}
              className={`${bm.btnNavy} w-full justify-center text-sm font-black disabled:cursor-not-allowed disabled:opacity-50`}
              data-checkout-start-payment
            >
              {preparing ? "주문 확인 중…" : "결제하기"}
            </button>
          ) : null}
        </div>
      )}

      <CheckoutSecurityNotice compact />
    </section>
  );
}
