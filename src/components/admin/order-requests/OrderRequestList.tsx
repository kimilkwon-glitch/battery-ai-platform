"use client";

import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
import { maskPhone } from "@/lib/order-request/order-request-summary";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import type { OrderRequestRecord, OrderRequestWorkflowStatus } from "@/types/order-request";

const USED_BATTERY_SHORT = {
  return: "반납",
  no_return: "미반납",
  unknown: "미정",
} as const;

export function OrderRequestList({
  records,
  selectedId,
  onSelect,
  apiMode = true,
}: {
  records: OrderRequestRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  apiMode?: boolean;
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2">
      {records.map((row) => {
        const active = row.id === selectedId;
        const workflow = row.workflowStatus ?? "pending_review";
        const hasReviewFlags =
          (row.reviewFlagKeys?.length ?? 0) > 0 || row.staffSummary.reviewFlags.length > 0;
        const vehicle =
          row.vehicle?.name ||
          row.staffSummary.vehicleLine ||
          row.items[0]?.vehicle?.displayName ||
          "차량 미입력";
        const battery =
          row.staffSummary.batteryLine ||
          row.items.map((i) => i.batterySpec).filter(Boolean).join(", ") ||
          "규격 미입력";
        const phoneDisplay = apiMode
          ? row.customer.phone.includes("*")
            ? row.customer.phone
            : maskPhone(row.customer.phone)
          : maskPhone(row.customer.phone);

        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                active
                  ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-blue-800">
                  {row.requestNumber ?? row.id.slice(0, 12)}
                </span>
                <OrderRequestWorkflowBadge status={workflow as OrderRequestWorkflowStatus} />
              </div>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                {new Date(row.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {row.customer.name || "(이름 없음)"} · {phoneDisplay}
              </p>
              <p className="text-xs font-bold text-slate-600">
                {vehicle}
                {row.vehicle?.year ? ` · ${row.vehicle.year}` : ""}
              </p>
              <p className="text-xs text-slate-600">
                {battery} · {USED_BATTERY_SHORT[row.usedBatteryReturnOption]} ·{" "}
                {FULFILLMENT_METHOD_LABELS[row.fulfillment.method]}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {hasReviewFlags ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-900">
                    확인 필요
                  </span>
                ) : null}
                {row.staffNotes && row.staffNotes !== "(메모 있음)" ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
                    메모 있음
                  </span>
                ) : row.staffNotes === "(메모 있음)" ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
                    메모 있음
                  </span>
                ) : null}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
