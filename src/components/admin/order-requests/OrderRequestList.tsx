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
    <div className="admin-panel admin-order-requests__list">
      <ul className="m-0 list-none p-0">
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
                className={`admin-inquiries__list-item${active ? " admin-inquiries__list-item--active" : ""}`}
              >
                <div className="admin-inquiries__list-badges">
                  <span className="admin-table__mono font-bold text-blue-800">
                    {row.requestNumber ?? row.id.slice(0, 12)}
                  </span>
                  <OrderRequestWorkflowBadge status={workflow as OrderRequestWorkflowStatus} />
                  {hasReviewFlags ? (
                    <span className="admin-badge rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-900">
                      확인 필요
                    </span>
                  ) : null}
                </div>
                <p className="admin-inquiries__list-name">
                  {row.customer.name || "(이름 없음)"}
                  <span className="admin-inquiries__list-contact">{phoneDisplay}</span>
                </p>
                <p className="admin-inquiries__list-vehicle">
                  {vehicle}
                  {row.vehicle?.year ? ` · ${row.vehicle.year}` : ""}
                </p>
                <p className="admin-inquiries__list-message">
                  {battery} · {USED_BATTERY_SHORT[row.usedBatteryReturnOption]} ·{" "}
                  {FULFILLMENT_METHOD_LABELS[row.fulfillment.method]}
                </p>
                <p className="admin-inquiries__list-date">
                  {new Date(row.createdAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
