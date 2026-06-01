import clsx from "clsx";
import {
  BANK_TRANSFER_POLICY,
  BANK_TRANSFER_STATUS_LABELS,
  type BankTransferPaymentStatus,
} from "@/data/bank-transfer-policy";
import { PaymentDeadlineBadge } from "@/components/order/PaymentDeadlineBadge";
import { bm } from "@/lib/design-tokens";

export type BankTransferStatusCardProps = {
  orderNumber: string;
  paymentMethod: string;
  depositDeadline: string;
  depositAmount?: string;
  bankName?: string;
  bankAccount?: string;
  status: BankTransferPaymentStatus;
  showDemoNote?: boolean;
};

const toneRing: Record<
  (typeof BANK_TRANSFER_STATUS_LABELS)[BankTransferPaymentStatus]["tone"],
  string
> = {
  amber: "bg-amber-50 text-amber-900 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  orange: "bg-orange-50 text-orange-900 ring-orange-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function BankTransferStatusCard({
  orderNumber,
  paymentMethod,
  depositDeadline,
  depositAmount,
  bankName,
  bankAccount,
  status,
  showDemoNote = false,
}: BankTransferStatusCardProps) {
  const statusMeta = BANK_TRANSFER_STATUS_LABELS[status];

  return (
    <article
      className={`${bm.card} ${bm.cardPad} space-y-4`}
      data-component="bank-transfer-status-card"
      data-payment-status={status}
    >
      {showDemoNote ? (
        <p className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[11px] font-bold leading-relaxed text-blue-900">
          정책 안내 예시 화면입니다. 실제 주문·입금 상태는 주문 시스템 연동 후 표시됩니다.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-black text-slate-950">주문 접수 완료</h3>
        <span
          className={clsx(
            "rounded-full px-2.5 py-0.5 text-[10px] font-black ring-1",
            toneRing[statusMeta.tone],
          )}
        >
          {statusMeta.label}
        </span>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex flex-wrap justify-between gap-1 border-b border-slate-100 pb-2">
          <dt className="font-bold text-slate-500">주문번호</dt>
          <dd className="font-black text-slate-900">{orderNumber}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-1 border-b border-slate-100 pb-2">
          <dt className="font-bold text-slate-500">결제수단</dt>
          <dd className="font-bold text-slate-800">{paymentMethod}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-1 border-b border-slate-100 pb-2">
          <dt className="font-bold text-slate-500">입금기한</dt>
          <dd className="font-bold text-slate-800">{depositDeadline}</dd>
        </div>
        {depositAmount ? (
          <div className="flex flex-wrap justify-between gap-1 border-b border-slate-100 pb-2">
            <dt className="font-bold text-slate-500">입금금액</dt>
            <dd className="font-black text-slate-900">{depositAmount}</dd>
          </div>
        ) : null}
        {bankName && bankAccount ? (
          <div className="flex flex-wrap justify-between gap-1">
            <dt className="font-bold text-slate-500">입금계좌</dt>
            <dd className="text-right font-bold text-slate-800">
              {bankName} {bankAccount}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <PaymentDeadlineBadge />
      </div>

      <p className="text-xs font-medium leading-relaxed text-slate-600">
        {BANK_TRANSFER_POLICY.cancellationRule}
      </p>
      <p className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs font-bold text-amber-950">
        {BANK_TRANSFER_POLICY.caution[0]}
      </p>

      {status === "awaiting_deposit" || status === "cancel_scheduled" ? (
        <p className="text-xs font-semibold text-slate-500">
          입금 확인 후 상품 준비·배송 안내가 순차적으로 진행됩니다.
        </p>
      ) : null}
    </article>
  );
}
