"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminOrderOperationalBadges } from "@/components/admin/AdminOrderOperationalBadges";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { deriveOrderOperationalBadges } from "@/lib/admin/order-operational-badges";
import type { OrderRelatedCustomerActivity } from "@/lib/admin/order-related-customer-activity";
import type { CommerceOrderAdminMeta } from "@/lib/admin/commerce-order-admin-meta-store";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

type Props = {
  order: CommerceOrderRecord;
  adminMeta?: CommerceOrderAdminMeta | null;
};

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function kindBadgeClass(kind: string): string {
  switch (kind) {
    case "battery_talk":
      return "bg-violet-100 text-violet-900";
    case "claim":
      return "bg-amber-100 text-amber-950";
    case "inquiry_product":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export function AdminOrderRelatedActivityPanel({ order, adminMeta }: Props) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<OrderRelatedCustomerActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = order.orderId;
  const customerPhone = order.customerPhone;
  const orderNumber = order.orderNumber;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/commerce-orders/${encodeURIComponent(orderId)}/related-activity`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "관련 활동을 불러오지 못했습니다.");
        setActivity(null);
        return;
      }
      setActivity(data.activity as OrderRelatedCustomerActivity);
    } catch {
      setError("관련 활동을 불러오지 못했습니다.");
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalCount =
    (activity?.counts.inquiries ?? 0) +
    (activity?.counts.productQna ?? 0) +
    (activity?.counts.batteryTalk ?? 0) +
    (activity?.counts.claims ?? 0);

  const phoneQuery = encodeURIComponent(customerPhone);
  const orderQuery = encodeURIComponent(orderNumber);
  const operationalBadges = deriveOrderOperationalBadges(order, activity, adminMeta);

  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <h3 className="text-xs font-black text-slate-900">관련 고객 활동</h3>
        <span className="text-[10px] font-bold text-slate-500">{open ? "접기" : "펼치기"}</span>
      </button>

      <p className="text-[10px] leading-relaxed text-slate-500">
        {order.customerName} · {customerPhone}
        {orderNumber ? ` · ${orderNumber}` : ""} 기준 연결
      </p>

      <AdminOrderOperationalBadges badges={operationalBadges} />

      {loading ? (
        <p className="text-[11px] font-medium text-slate-500">관련 활동 불러오는 중…</p>
      ) : error ? (
        <p className="text-[11px] font-bold text-red-700">{error}</p>
      ) : activity && totalCount === 0 ? (
        <p className="text-[11px] font-medium text-slate-500">관련 문의/클레임 없음</p>
      ) : activity ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            {activity.counts.inquiryTotal > 0 ? (
              <Link
                href={`${ADMIN_ROUTES.inquiries}?query=${phoneQuery}`}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 hover:bg-slate-200"
              >
                문의 {activity.counts.inquiryTotal}
              </Link>
            ) : null}
            {activity.counts.batteryTalk > 0 ? (
              <Link
                href={`${ADMIN_ROUTES.inquiries}?type=consultation&query=${phoneQuery}`}
                className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900 hover:bg-violet-200"
              >
                배터리톡 {activity.counts.batteryTalk}
              </Link>
            ) : null}
            {activity.counts.claims > 0 ? (
              <Link
                href={`${ADMIN_ROUTES.commerceClaims}?orderId=${encodeURIComponent(orderId)}&query=${orderQuery}`}
                className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-950 hover:bg-amber-200"
              >
                클레임 {activity.counts.claims}
              </Link>
            ) : null}
          </div>

          {open ? (
            <ul className="space-y-2 border-t border-slate-100 pt-2">
              {activity.recent.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="block rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2 hover:border-slate-200 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${kindBadgeClass(item.kind)}`}
                      >
                        {item.kindLabel}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">{formatDt(item.updatedAt)}</span>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                        {item.statusLabel}
                      </span>
                      {item.matchReason === "both" ? (
                        <span className="text-[10px] font-bold text-emerald-700">주문·전화 일치</span>
                      ) : item.matchReason === "order_number" ? (
                        <span className="text-[10px] font-bold text-blue-700">주문번호 연결</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-slate-800">{item.summary}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {item.customerName} · {item.customerPhone}
                      {item.orderNumber ? ` · ${item.orderNumber}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
