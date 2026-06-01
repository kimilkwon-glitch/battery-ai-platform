import type { OrderRequestStaffSummary } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

export function OrderRequestReviewCard({ summary }: { summary: OrderRequestStaffSummary }) {
  return (
    <section
      className={`${bm.card} ${bm.cardPad} border-slate-300 bg-slate-50/80`}
      data-component="order-request-staff-summary"
    >
      <h2 className="text-sm font-black text-slate-900">직원 확인용 요약</h2>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
          <dt className="font-bold text-slate-500">고객</dt>
          <dd className="mt-0.5 font-black text-slate-900">{summary.customerLine}</dd>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
          <dt className="font-bold text-slate-500">차량</dt>
          <dd className="mt-0.5 font-black text-slate-900">{summary.vehicleLine}</dd>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
          <dt className="font-bold text-slate-500">희망 규격</dt>
          <dd className="mt-0.5 font-black text-slate-900">{summary.batteryLine}</dd>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
          <dt className="font-bold text-slate-500">폐전지</dt>
          <dd className="mt-0.5 font-black text-slate-900">{summary.usedBatteryLine}</dd>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
          <dt className="font-bold text-slate-500">수령·설치</dt>
          <dd className="mt-0.5 font-black text-slate-900">{summary.fulfillmentLine}</dd>
          {summary.storeOrRegionLine ? (
            <dd className="mt-1 font-medium text-slate-600">{summary.storeOrRegionLine}</dd>
          ) : null}
        </div>
        {summary.reviewFlags.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
            <dt className="font-bold text-amber-900">확인 필요 사항</dt>
            <dd className="mt-1">
              <ul className="list-disc pl-4 font-bold text-amber-950">
                {summary.reviewFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {summary.customerMemo ? (
          <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
            <dt className="font-bold text-slate-500">고객 메모</dt>
            <dd className="mt-0.5 whitespace-pre-wrap font-medium text-slate-800">
              {summary.customerMemo}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
