"use client";

import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import { COMMERCE_ORDER_LOOKUP_COPY } from "@/data/commerce-order-lookup-copy";
import { bm } from "@/lib/design-tokens";

function formatAmount(amount: number | null): string {
  if (amount == null) return "금액 확인 중";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function CommerceOrderLookupList({
  orders,
  onSelect,
}: {
  orders: CommerceOrderGuestLookupResult[];
  onSelect: (order: CommerceOrderGuestLookupResult) => void;
}) {
  return (
    <section className="commerce-order-lookup-list space-y-3" aria-label="조회된 주문 목록">
      <header className="flex items-baseline justify-between gap-2 px-0.5">
        <h2 className="text-base font-black text-slate-950">{COMMERCE_ORDER_LOOKUP_COPY.listTitle}</h2>
        <span className="text-xs font-bold text-slate-500">
          {COMMERCE_ORDER_LOOKUP_COPY.listCount(orders.length)}
        </span>
      </header>
      <ol className="space-y-3">
        {orders.map((order) => (
          <li key={order.orderId}>
            <article
              className={`${bm.card} ${bm.cardPad} flex flex-col gap-3 !py-4 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-slate-500">{formatDate(order.createdAt)}</p>
                <p className="font-mono text-sm font-black text-slate-900">{order.orderNumber}</p>
                <p className="truncate text-sm font-bold text-slate-800">
                  {order.productName}
                  {order.batteryCode ? (
                    <span className="ml-1 font-medium text-slate-500">({order.batteryCode})</span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-600">
                  {order.fulfillmentLabel} · {order.orderStatusLabel} · {order.paymentStatusLabel}
                </p>
                <p className="text-sm font-black text-slate-950">{formatAmount(order.finalAmount)}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelect(order)}
                className={`${bm.btnNavy} shrink-0 justify-center px-4 py-2.5 text-sm`}
              >
                {COMMERCE_ORDER_LOOKUP_COPY.viewDetail}
              </button>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
