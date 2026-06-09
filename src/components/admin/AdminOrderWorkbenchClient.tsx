"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminCommerceOrderOpsPanel } from "@/components/admin/AdminCommerceOrderOpsPanel";
import { OrderRequestDetailPanel } from "@/components/admin/order-requests/OrderRequestDetailPanel";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  canBulkAction,
  SHIPPING_CARRIERS,
  WORKBENCH_STATUS_BAR,
  type OrderBulkAction,
  type OrderWorkbenchView,
} from "@/lib/admin/order-workbench";
import {
  countWorkbenchView,
  matchesWorkbenchView,
  parseWorkbenchView,
  type UnifiedAdminOrderRow,
} from "@/lib/admin/unified-orders";
import { persistedToOrderRequestRecord } from "@/lib/order-request/order-request-mapper";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { OrderRequestRecord } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

type Props = {
  rows: UnifiedAdminOrderRow[];
  dbReady: boolean;
};

function statusBadgeClass(status: string): string {
  if (["canceled", "refunded", "payment_failed"].includes(status)) {
    return "bg-red-100 text-red-800";
  }
  if (["work_completed", "delivered", "picked_up", "completed", "closed"].includes(status)) {
    return "bg-emerald-100 text-emerald-800";
  }
  if (["shipping", "shipped", "in_transit", "visit_scheduled", "store_visit_scheduled"].includes(status)) {
    return "bg-blue-100 text-blue-800";
  }
  if (["order_confirmed", "preparing", "shipping_prep"].includes(status)) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-slate-100 text-slate-700";
}

export function AdminOrderWorkbenchClient({ rows: initialRows, dbReady }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = parseWorkbenchView(searchParams.get("view"), searchParams.get("status"));
  const customerTypeFilter =
    searchParams.get("customerType") ?? (searchParams.get("guest") === "1" ? "guest" : "all");
  const orderTypeFilter =
    searchParams.get("orderType") ??
    (searchParams.get("channel") === "consultation"
      ? "consult"
      : searchParams.get("channel") === "commerce"
        ? "commerce"
        : "all");
  const fulfillmentFilter = searchParams.get("fulfillment") ?? "all";
  const paymentFilter = searchParams.get("paymentStatus") ?? "all";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";
  const selectedCommerceId = searchParams.get("orderId")?.trim() ?? "";
  const selectedConsultId = searchParams.get("id")?.trim() ?? "";

  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [shipCarrier, setShipCarrier] = useState<string>(SHIPPING_CARRIERS[0]);
  const [shipTracking, setShipTracking] = useState("");
  const [bulkMemo, setBulkMemo] = useState("");
  const [consultDetail, setConsultDetail] = useState<OrderRequestRecord | null>(null);
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const setParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") p.delete(k);
      else p.set(k, v);
    }
    if (patch.view !== undefined) p.delete("status");
    router.replace(`${ADMIN_ROUTES.orders}?${p.toString()}`);
  };

  const rowKey = (row: UnifiedAdminOrderRow) => `${row.channel}:${row.id}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesWorkbenchView(row, view)) return false;
      if (customerTypeFilter === "guest" && row.customerType !== "guest") return false;
      if (customerTypeFilter === "member" && row.customerType !== "member") return false;
      if (orderTypeFilter === "commerce" && row.channel !== "commerce") return false;
      if (orderTypeFilter === "consult" && row.channel !== "consultation") return false;
      if (fulfillmentFilter !== "all" && row.fulfillmentType !== fulfillmentFilter) return false;
      if (paymentFilter !== "all" && row.paymentStatus !== paymentFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(row.createdAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59`);
        if (new Date(row.createdAt) > to) return false;
      }
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
  }, [rows, view, customerTypeFilter, orderTypeFilter, fulfillmentFilter, paymentFilter, dateFrom, dateTo, query]);

  const selectedRows = useMemo(
    () => filtered.filter((r) => selectedKeys.has(rowKey(r))),
    [filtered, selectedKeys],
  );

  const commerceSelected = selectedRows.filter((r) => r.channel === "commerce");

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

  const toggleAll = () => {
    if (selectedKeys.size === filtered.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(filtered.map(rowKey)));
    }
  };

  const toggleOne = (row: UnifiedAdminOrderRow) => {
    const key = rowKey(row);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runBulkAction = async (
    action: OrderBulkAction,
    extra?: { shippingCarrier?: string; shippingTrackingNumber?: string; adminMemo?: string },
  ) => {
    if (commerceSelected.length === 0) {
      setActionMessage("처리할 주문을 선택해 주세요. (자사몰 결제 주문)");
      return;
    }
    setBusy(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/orders/bulk-action", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          targets: commerceSelected.map((r) => ({ orderId: r.id, channel: r.channel })),
          ...extra,
        }),
      });
      const data = await res.json();
      if (data.results) {
        const failures = (data.results as { orderId: string; ok: boolean; message?: string }[]).filter(
          (r) => !r.ok,
        );
        setActionMessage(
          failures.length > 0
            ? `${data.succeeded ?? 0}건 처리 · 실패: ${failures.map((f) => f.message ?? f.orderId).join(", ")}`
            : `${data.succeeded ?? commerceSelected.length}건 처리 완료`,
        );
        if ((data.succeeded ?? 0) > 0) {
          setSelectedKeys(new Set());
        }
      } else {
        setActionMessage(data.message ?? "처리에 실패했습니다.");
      }
      router.refresh();
    } catch {
      setActionMessage("처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
      setShipModalOpen(false);
      setMemoModalOpen(false);
      setShipTracking("");
      setBulkMemo("");
    }
  };

  const handleShipSubmit = () => {
    if (!shipCarrier.trim() || !shipTracking.trim()) {
      setActionMessage("택배사와 송장번호를 입력해 주세요.");
      return;
    }
    const nonDelivery = commerceSelected.filter((r) => r.fulfillmentType !== "delivery");
    if (nonDelivery.length > 0) {
      setActionMessage(
        `택배 주문 ${commerceSelected.length - nonDelivery.length}건만 발송처리됩니다. 출장/매장 주문은 제외됩니다.`,
      );
    }
    void runBulkAction("ship_order", {
      shippingCarrier: shipCarrier,
      shippingTrackingNumber: shipTracking,
    });
  };

  const statusCounts = WORKBENCH_STATUS_BAR.map((s) => ({
    ...s,
    count: countWorkbenchView(rows, s.id),
  }));

  return (
    <div className="admin-order-workbench space-y-4">
      {!dbReady ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-950">
          자사몰 결제 주문 DB가 연결되지 않았습니다. 상담 주문만 표시됩니다.
        </p>
      ) : null}

      <div className="admin-order-workbench__status-bar">
        {statusCounts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setParams({ view: item.id === "all" ? null : item.id })}
            className={`admin-order-workbench__status-card ${view === item.id ? "is-active" : ""}`}
          >
            <span className="admin-order-workbench__status-label">{item.label}</span>
            <span className="admin-order-workbench__status-count">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="admin-order-workbench__filters">
        <div className="flex flex-wrap gap-2">
          <label className="text-[11px] font-bold text-slate-500">
            조회기간
            <div className="mt-1 flex gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setParams({ from: e.target.value || null })}
                className="rounded border border-slate-200 px-2 py-1 text-xs"
              />
              <span className="self-center text-slate-400">~</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setParams({ to: e.target.value || null })}
                className="rounded border border-slate-200 px-2 py-1 text-xs"
              />
            </div>
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            주문상태
            <select
              value={view}
              onChange={(e) =>
                setParams({ view: e.target.value === "all" ? null : e.target.value })
              }
              className="mt-1 block rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="all">전체</option>
              {WORKBENCH_STATUS_BAR.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            결제상태
            <select
              value={paymentFilter}
              onChange={(e) =>
                setParams({ paymentStatus: e.target.value === "all" ? null : e.target.value })
              }
              className="mt-1 block rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="all">전체</option>
              <option value="completed">결제완료</option>
              <option value="pending">결제대기</option>
              <option value="failed">결제실패</option>
              <option value="canceled">결제취소</option>
              <option value="refunded">환불</option>
            </select>
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            수령방식
            <select
              value={fulfillmentFilter}
              onChange={(e) =>
                setParams({ fulfillment: e.target.value === "all" ? null : e.target.value })
              }
              className="mt-1 block rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="all">전체</option>
              <option value="delivery">택배</option>
              <option value="visit_install">출장 교체</option>
              <option value="store_install">매장 교체</option>
              <option value="store_pickup_self">매장 수령</option>
            </select>
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            회원유형
            <select
              value={customerTypeFilter}
              onChange={(e) =>
                setParams({ customerType: e.target.value === "all" ? null : e.target.value })
              }
              className="mt-1 block rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="all">전체</option>
              <option value="member">회원</option>
              <option value="guest">비회원</option>
            </select>
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            주문유형
            <select
              value={orderTypeFilter}
              onChange={(e) =>
                setParams({ orderType: e.target.value === "all" ? null : e.target.value })
              }
              className="mt-1 block rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="all">전체</option>
              <option value="commerce">자사몰</option>
              <option value="consult">상담주문</option>
            </select>
          </label>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="주문번호·고객명·연락처·상품명·배터리 규격 검색"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="admin-order-workbench__bulk-bar">
        <span className="text-xs font-bold text-slate-600">
          선택 {selectedRows.length}건
          {commerceSelected.length < selectedRows.length
            ? ` (처리가능 ${commerceSelected.length}건)`
            : ""}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["confirm_order", "발주확인"],
              ["mark_preparing", "상품준비중"],
              ["ship_order", "송장입력/발송"],
              ["mark_delivered", "배송완료"],
              ["mark_work_completed", "출장/장착완료"],
              ["cancel_order", "취소처리"],
              ["save_admin_memo", "선택 메모"],
            ] as const
          ).map(([action, label]) => (
            <button
              key={action}
              type="button"
              disabled={busy}
              onClick={() => {
                if (action === "ship_order") {
                  if (commerceSelected.length === 0) {
                    setActionMessage("처리할 주문을 선택해 주세요.");
                    return;
                  }
                  setShipModalOpen(true);
                  return;
                }
                if (action === "save_admin_memo") {
                  if (commerceSelected.length === 0) {
                    setActionMessage("처리할 주문을 선택해 주세요.");
                    return;
                  }
                  setMemoModalOpen(true);
                  return;
                }
                void runBulkAction(action);
              }}
              className="admin-order-workbench__bulk-btn"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {actionMessage ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{actionMessage}</p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="admin-data-table__wrap overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="admin-table admin-order-workbench__table w-full min-w-[1280px] text-sm">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedKeys.size === filtered.length}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                  />
                </th>
                <th>주문일</th>
                <th>주문번호</th>
                <th>고객명</th>
                <th>연락처</th>
                <th>회원유형</th>
                <th>주문유형</th>
                <th>상품명</th>
                <th>규격</th>
                <th>수령방식</th>
                <th>결제금액</th>
                <th>결제상태</th>
                <th>주문상태</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-700">조건에 맞는 주문이 없습니다.</p>
                    <p className="mt-2 text-xs text-slate-500">
                      신규 주문이 접수되면 이곳에서 발주확인할 수 있습니다.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const key = rowKey(row);
                  const selected =
                    (row.channel === "commerce" && row.id === selectedCommerceId) ||
                    (row.channel === "consultation" && row.id === selectedConsultId);
                  const bulkBlocked =
                    row.channel === "commerce" ? canBulkAction(row, "confirm_order") : "상담주문";
                  return (
                    <tr
                      key={key}
                      className={selected ? "bg-blue-50/60" : "hover:bg-slate-50"}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(key)}
                          onChange={() => toggleOne(row)}
                          aria-label={`${row.orderNumber} 선택`}
                        />
                      </td>
                      <td
                        className="cursor-pointer whitespace-nowrap text-xs text-slate-600"
                        onClick={() => selectRow(row)}
                      >
                        {new Date(row.createdAt).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td
                        className="cursor-pointer font-mono text-xs font-bold"
                        onClick={() => selectRow(row)}
                      >
                        {row.orderNumber}
                      </td>
                      <td className="cursor-pointer font-bold" onClick={() => selectRow(row)}>
                        {row.customerName}
                      </td>
                      <td className="cursor-pointer text-xs text-slate-600" onClick={() => selectRow(row)}>
                        {row.customerPhone}
                      </td>
                      <td onClick={() => selectRow(row)}>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${row.customerType === "guest" ? "border-violet-300 text-violet-800" : ""}`}
                        >
                          {row.customerType === "guest" ? "비회원" : "회원"}
                        </Badge>
                      </td>
                      <td onClick={() => selectRow(row)}>
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
                      <td className="max-w-[140px] truncate font-semibold" onClick={() => selectRow(row)}>
                        {row.productName}
                      </td>
                      <td className="text-xs text-slate-500" onClick={() => selectRow(row)}>
                        {row.batteryCode}
                      </td>
                      <td className="text-xs" onClick={() => selectRow(row)}>
                        {row.fulfillmentLabel}
                      </td>
                      <td className="tabular-nums font-bold" onClick={() => selectRow(row)}>
                        {row.finalAmount != null ? formatPriceWon(row.finalAmount) : "—"}
                      </td>
                      <td className="text-xs" onClick={() => selectRow(row)}>
                        {row.paymentStatusLabel}
                      </td>
                      <td onClick={() => selectRow(row)}>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadgeClass(row.orderStatus)}`}
                        >
                          {row.orderStatusLabel}
                        </span>
                      </td>
                      <td className="text-xs" onClick={() => selectRow(row)}>
                        {row.shippingCarrier ?? "—"}
                      </td>
                      <td className="font-mono text-xs" onClick={() => selectRow(row)}>
                        {row.shippingTrackingNumber ?? "—"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`${bm.btnSecondary} text-[11px]`}
                          title={bulkBlocked ?? undefined}
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
            <AdminCommerceOrderOpsPanel
              orderId={selectedCommerceId}
              onUpdated={() => router.refresh()}
            />
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

      {shipModalOpen ? (
        <div className="admin-order-workbench__modal-backdrop" role="presentation">
          <div className="admin-order-workbench__modal" role="dialog" aria-labelledby="ship-modal-title">
            <h3 id="ship-modal-title" className="text-sm font-black text-slate-900">
              송장 입력 / 발송처리
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              선택 {commerceSelected.length}건 · 택배 주문만 처리됩니다.
            </p>
            <label className="mt-4 block text-xs font-bold text-slate-600">
              택배사
              <select
                value={shipCarrier}
                onChange={(e) => setShipCarrier(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
              >
                {SHIPPING_CARRIERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs font-bold text-slate-600">
              송장번호
              <input
                value={shipTracking}
                onChange={(e) => setShipTracking(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 font-mono text-sm"
                placeholder="숫자·문자 조합"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={bm.btnSecondary}
                onClick={() => setShipModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                disabled={busy}
                className={bm.btnNavy}
                onClick={handleShipSubmit}
              >
                저장 및 발송처리
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {memoModalOpen ? (
        <div className="admin-order-workbench__modal-backdrop" role="presentation">
          <div className="admin-order-workbench__modal" role="dialog">
            <h3 className="text-sm font-black text-slate-900">선택 주문 메모</h3>
            <textarea
              value={bulkMemo}
              onChange={(e) => setBulkMemo(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
              placeholder="내부 메모"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={bm.btnSecondary} onClick={() => setMemoModalOpen(false)}>
                취소
              </button>
              <button
                type="button"
                disabled={busy}
                className={bm.btnNavy}
                onClick={() => void runBulkAction("save_admin_memo", { adminMemo: bulkMemo })}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
