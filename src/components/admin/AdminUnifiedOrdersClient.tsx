"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminCommerceOrderOpsPanel } from "@/components/admin/AdminCommerceOrderOpsPanel";
import { OrderRequestDetailPanel } from "@/components/admin/order-requests/OrderRequestDetailPanel";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  matchesOrderStatusFilter,
  type OrderListStatusFilter,
  type UnifiedAdminOrderRow,
} from "@/lib/admin/unified-orders";
import { persistedToOrderRequestRecord } from "@/lib/order-request/order-request-mapper";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { OrderRequestRecord } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

const STATUS_TABS: { id: OrderListStatusFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "payment_completed", label: "결제 완료" },
  { id: "order_created", label: "발주확인 대기" },
  { id: "preparing", label: "상품 준비" },
  { id: "in_progress", label: "배송/출장" },
  { id: "completed", label: "완료" },
  { id: "canceled", label: "취소/환불" },
];

type Props = {
  rows: UnifiedAdminOrderRow[];
  dbReady: boolean;
};

export function AdminUnifiedOrdersClient({ rows, dbReady }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = (searchParams.get("status") as OrderListStatusFilter) || "all";
  const guestOnly = searchParams.get("guest") === "1";
  const channelFilter = searchParams.get("channel") ?? "all";
  const selectedCommerceId = searchParams.get("orderId")?.trim() ?? "";
  const selectedConsultId = searchParams.get("id")?.trim() ?? "";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [consultDetail, setConsultDetail] = useState<OrderRequestRecord | null>(null);
  const [consultLoading, setConsultLoading] = useState(false);

  const setParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") p.delete(k);
      else p.set(k, v);
    }
    router.replace(`${ADMIN_ROUTES.orders}?${p.toString()}`);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesOrderStatusFilter(row, statusFilter)) return false;
      if (guestOnly && row.customerType !== "guest") return false;
      if (channelFilter === "commerce" && row.channel !== "commerce") return false;
      if (channelFilter === "consultation" && row.channel !== "consultation") return false;
      if (!q) return true;
      const hay = [
        row.orderNumber,
        row.customerName,
        row.customerPhone,
        row.productName,
        row.batteryCode,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, statusFilter, guestOnly, channelFilter, query]);

  const loadConsult = useCallback(async (id: string) => {
    setConsultLoading(true);
    const res = await fetch(`/api/admin/order-requests/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    const data = await res.json();
    setConsultLoading(false);
    if (res.ok && data.ok && data.record) {
      setConsultDetail(persistedToOrderRequestRecord(data.record));
    } else {
      setConsultDetail(null);
    }
  }, []);

  useEffect(() => {
    if (selectedConsultId) void loadConsult(selectedConsultId);
    else setConsultDetail(null);
  }, [selectedConsultId, loadConsult]);

  const selectRow = (row: UnifiedAdminOrderRow) => {
    if (row.channel === "commerce") {
      setParams({ orderId: row.id, id: null });
    } else {
      setParams({ id: row.id, orderId: null });
    }
  };

  return (
    <div className="space-y-4">
      {!dbReady ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-950">
          자사몰 결제 주문 DB가 연결되지 않았습니다. 상담 주문만 표시됩니다. DATABASE_URL 설정 후
          자사몰 주문이 함께 표시됩니다.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setParams({ status: tab.id === "all" ? null : tab.id })}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              statusFilter === tab.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "전체 주문" },
          { id: "commerce", label: "자사몰 결제" },
          { id: "consultation", label: "상담 주문" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setParams({ channel: c.id === "all" ? null : c.id })}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
              channelFilter === c.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setParams({ guest: guestOnly ? null : "1" })}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
            guestOnly ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          비회원만
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="주문번호·고객명·연락처·상품·규격 검색"
          className="min-w-[12rem] flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="admin-data-table__wrap overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="admin-table w-full min-w-[960px] text-sm">
            <thead>
              <tr>
                <th>주문일</th>
                <th>주문번호</th>
                <th>고객</th>
                <th>유형</th>
                <th>상품</th>
                <th>수령방식</th>
                <th>결제금액</th>
                <th>결제</th>
                <th>주문상태</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="admin-table__empty py-10 text-center">
                    아직 접수된 주문이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const selected =
                    (row.channel === "commerce" && row.id === selectedCommerceId) ||
                    (row.channel === "consultation" && row.id === selectedConsultId);
                  return (
                    <tr
                      key={`${row.channel}-${row.id}`}
                      className={selected ? "bg-blue-50/60" : "cursor-pointer hover:bg-slate-50"}
                      onClick={() => selectRow(row)}
                    >
                      <td className="whitespace-nowrap text-xs text-slate-600">
                        {new Date(row.createdAt).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="font-mono text-xs font-bold">{row.orderNumber}</td>
                      <td>
                        <p className="font-bold">{row.customerName}</p>
                        <p className="text-[11px] text-slate-500">{row.customerPhone}</p>
                        {row.customerType === "guest" ? (
                          <Badge variant="outline" className="mt-0.5 text-[10px]">
                            비회원
                          </Badge>
                        ) : null}
                      </td>
                      <td>
                        <Badge
                          className={`text-[10px] ${
                            row.channel === "commerce"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {row.orderTypeLabel}
                        </Badge>
                      </td>
                      <td>
                        <p className="font-semibold">{row.productName}</p>
                        <p className="text-[11px] text-slate-500">{row.batteryCode}</p>
                      </td>
                      <td className="text-xs">{row.fulfillmentLabel}</td>
                      <td className="tabular-nums font-bold">
                        {row.finalAmount != null ? formatPriceWon(row.finalAmount) : "—"}
                      </td>
                      <td className="text-xs">{row.paymentStatusLabel}</td>
                      <td className="text-xs font-bold">{row.orderStatusLabel}</td>
                      <td>
                        <button
                          type="button"
                          className={`${bm.btnSecondary} text-[11px]`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectRow(row);
                          }}
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <aside className="xl:sticky xl:top-4">
          {selectedCommerceId ? (
            <AdminCommerceOrderOpsPanel orderId={selectedCommerceId} />
          ) : selectedConsultId && consultDetail ? (
            <div className={`${bm.card} ${bm.cardPad}`}>
              <OrderRequestDetailPanel
                record={consultDetail}
                detailLoading={consultLoading}
                onRecordChange={setConsultDetail}
              />
            </div>
          ) : selectedConsultId && consultLoading ? (
            <p className={`${bm.card} ${bm.cardPad} text-xs text-slate-500`}>상담 주문 불러오는 중…</p>
          ) : (
            <p className={`${bm.card} ${bm.cardPad} text-xs font-medium text-slate-500`}>
              목록에서 주문을 선택하면 상세·처리 패널이 표시됩니다.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
