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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-900">결제 정보</h3>
        {meta.testMode ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-900 ring-1 ring-amber-200">
            토스 테스트 모드
          </span>
        ) : null}
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold text-slate-500">주문번호</dt>
          <dd className="font-mono font-black text-blue-800">{meta.orderNumber ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">결제사</dt>
          <dd className="font-black text-slate-900">
            {meta.paymentProvider === "toss" ? "토스페이먼츠" : "—"}
          </dd>
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
          <dt className="font-bold text-slate-500">승인일시</dt>
          <dd className="font-black text-slate-900">
            {meta.approvedAt ? new Date(meta.approvedAt).toLocaleString("ko-KR") : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold text-slate-500">paymentKey</dt>
          <dd className="break-all font-mono text-[10px] text-slate-800">{meta.paymentKey ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">결제요청 ID</dt>
          <dd className="font-mono text-[10px] text-slate-800">{meta.paymentRequestId ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">영수증</dt>
          <dd className="font-black text-slate-900">
            {meta.receiptUrl ? (
              <a
                href={meta.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                영수증 보기
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">실패 코드</dt>
          <dd className="font-mono text-[10px] text-slate-800">{meta.paymentFailCode ?? "—"}</dd>
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
