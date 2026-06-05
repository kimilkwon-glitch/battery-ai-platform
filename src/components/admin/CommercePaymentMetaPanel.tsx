import {
  COMMERCE_LIFECYCLE_LABELS,
  COMMERCE_PAYMENT_STATUS_LABELS,
} from "@/types/commerce-order";
import type { AdminCommercePaymentMeta } from "@/types/commerce-payment";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { bm } from "@/lib/design-tokens";

type Props = {
  meta: AdminCommercePaymentMeta;
};

export function CommercePaymentMetaPanel({ meta }: Props) {
  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3`} data-admin-commerce-payment>
      <h3 className="text-sm font-black text-slate-900">결제 정보</h3>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold text-slate-500">주문번호</dt>
          <dd className="font-mono font-black text-blue-800">{meta.orderNumber ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">결제 상태</dt>
          <dd className="font-black text-slate-900">
            {COMMERCE_PAYMENT_STATUS_LABELS[meta.paymentStatus]}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">주문 상태</dt>
          <dd className="font-black text-slate-900">
            {COMMERCE_LIFECYCLE_LABELS[meta.orderStatus]}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">결제 예정금액</dt>
          <dd className="font-black tabular-nums text-slate-900">
            {meta.estimatedAmount != null ? formatPriceWon(meta.estimatedAmount) : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">실제 결제금액</dt>
          <dd className="font-black tabular-nums text-slate-900">
            {meta.paidAmount != null ? formatPriceWon(meta.paidAmount) : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">결제수단</dt>
          <dd className="font-black text-slate-900">{meta.paymentMethod ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">PG 거래번호</dt>
          <dd className="font-mono text-[10px] text-slate-800">{meta.pgTransactionId ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">결제요청 ID</dt>
          <dd className="font-mono text-[10px] text-slate-800">{meta.paymentRequestId ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold text-slate-500">결제 실패 사유</dt>
          <dd className="font-medium text-slate-800">{meta.paymentFailReason ?? "—"}</dd>
        </div>
      </dl>

      {meta.statusHistory.length > 0 ? (
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <h4 className="text-xs font-black text-slate-800">주문 상태 변경 이력</h4>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-[10px]">
            {meta.statusHistory.map((ev, i) => (
              <li key={`${ev.at}-${i}`} className="rounded bg-slate-50 px-2 py-1.5">
                <span className="font-bold text-slate-600">
                  {new Date(ev.at).toLocaleString("ko-KR")}
                </span>
                {" · "}
                <span className="font-black text-slate-800">
                  {COMMERCE_LIFECYCLE_LABELS[ev.status]}
                </span>
                {ev.paymentStatus ? (
                  <span className="text-slate-600">
                    {" "}
                    ({COMMERCE_PAYMENT_STATUS_LABELS[ev.paymentStatus]})
                  </span>
                ) : null}
                {ev.note ? <span className="block text-slate-500">{ev.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
