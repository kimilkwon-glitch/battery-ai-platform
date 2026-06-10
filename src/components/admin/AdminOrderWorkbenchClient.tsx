"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminCommerceOrderOpsPanel } from "@/components/admin/AdminCommerceOrderOpsPanel";
import { OrderRequestDetailPanel } from "@/components/admin/order-requests/OrderRequestDetailPanel";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  filterUnifiedRowsByDataScope,
  parseAdminOrderDataScope,
  type AdminOrderDataScope,
} from "@/lib/admin/order-data-scope";
import {
  canBulkAction,
  canStartVisit,
  completeActionForRow,
  deliveryTrackingUrl,
  isDeliveryOrder,
  isStorePickup,
  isVisitOrStoreInstall,
  rowNeedsOperatorAction,
  SHIPPING_CARRIERS,
  visitStartStatus,
  WORKBENCH_STATUS_BAR,
  type OrderBulkAction,
  type OrderWorkbenchClaimContext,
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
  claimContext: {
    cancelRequestOrderIds: string[];
    returnExchangeOrderIds: string[];
  };
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
  if (["order_confirmed", "preparing", "shipping_prep", "payment_completed"].includes(status)) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-slate-100 text-slate-700";
}

function toClaimContext(ctx: Props["claimContext"]): OrderWorkbenchClaimContext {
  return {
    cancelRequestOrderIds: new Set(ctx.cancelRequestOrderIds),
    returnExchangeOrderIds: new Set(ctx.returnExchangeOrderIds),
  };
}

export function AdminOrderWorkbenchClient({ rows: initialRows, dbReady, claimContext: claimContextProp }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const claimContext = useMemo(() => toClaimContext(claimContextProp), [claimContextProp]);
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
  const dataScope = parseAdminOrderDataScope(searchParams.get("dataScope"));
  const hasSelection = Boolean(selectedCommerceId || selectedConsultId);

  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [shipTargetId, setShipTargetId] = useState<string | null>(null);
  const [shipCarrier, setShipCarrier] = useState<string>(SHIPPING_CARRIERS[0]);
  const [shipTracking, setShipTracking] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [consultDetail, setConsultDetail] = useState<OrderRequestRecord | null>(null);
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    if (dataScope === "production") {
      setRows(initialRows);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/admin/workbench-rows?dataScope=${dataScope}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!cancelled && res.ok && data.ok) setRows(data.items ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialRows, dataScope]);

  const setParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") p.delete(k);
      else p.set(k, v);
    }
    if (patch.view !== undefined) p.delete("status");
    router.replace(`${ADMIN_ROUTES.orders}?${p.toString()}`);
  };

  const scopedRows = useMemo(
    () => filterUnifiedRowsByDataScope(rows, dataScope),
    [rows, dataScope],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedRows.filter((row) => {
      if (!matchesWorkbenchView(row, view, claimContext)) return false;
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
  }, [
    scopedRows,
    view,
    claimContext,
    customerTypeFilter,
    orderTypeFilter,
    fulfillmentFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    query,
  ]);

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

  const runSingleAction = async (
    row: UnifiedAdminOrderRow,
    action: OrderBulkAction,
    extra?: { shippingCarrier?: string; shippingTrackingNumber?: string },
  ) => {
    if (row.channel !== "commerce") {
      setActionMessage("자사몰 결제 주문만 처리할 수 있습니다.");
      return;
    }
    const block = canBulkAction(row, action);
    if (block) {
      setActionMessage(block);
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
          targets: [{ orderId: row.id, channel: row.channel }],
          ...extra,
        }),
      });
      const data = await res.json();
      if (data.results?.[0]?.ok) {
        setActionMessage("처리 완료");
        router.refresh();
      } else {
        setActionMessage(data.results?.[0]?.message ?? data.message ?? "처리에 실패했습니다.");
      }
    } catch {
      setActionMessage("처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
      setShipModalOpen(false);
      setShipTargetId(null);
      setShipTracking("");
    }
  };

  const runVisitStart = async (row: UnifiedAdminOrderRow) => {
    const block = canStartVisit(row);
    if (block) {
      setActionMessage(block);
      return;
    }
    const nextStatus = visitStartStatus(row);
    if (!nextStatus) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/commerce-orders/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderStatus: nextStatus, statusNote: "관리자: 출장시작 처리" }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setActionMessage("출장시작 처리 완료");
        router.refresh();
      } else {
        setActionMessage(data.message ?? "처리에 실패했습니다.");
      }
    } catch {
      setActionMessage("처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const openShipModal = (row: UnifiedAdminOrderRow) => {
    setShipTargetId(row.id);
    setShipModalOpen(true);
  };

  const handleShipSubmit = () => {
    if (!shipTargetId || !shipCarrier.trim() || !shipTracking.trim()) {
      setActionMessage("택배사와 송장번호를 입력해 주세요.");
      return;
    }
    const row = rows.find((r) => r.id === shipTargetId);
    if (!row) return;
    void runSingleAction(row, "ship_order", {
      shippingCarrier: shipCarrier,
      shippingTrackingNumber: shipTracking,
    });
  };

  const claimHref = (row: UnifiedAdminOrderRow, type?: "CANCEL" | "RETURN") => {
    const base = ADMIN_ROUTES.commerceClaims;
    const p = new URLSearchParams();
    p.set("orderId", row.id);
    if (type) p.set("type", type);
    return `${base}?${p.toString()}`;
  };

  const tabCounts = WORKBENCH_STATUS_BAR.map((s) => ({
    ...s,
    count: countWorkbenchView(rows, s.id, dataScope, claimContext),
  }));

  const actionBtnClass = "admin-row-action-btn";

  const renderRowActions = (row: UnifiedAdminOrderRow) => {
    const detailBtn = (
      <button type="button" className={`${actionBtnClass} ${actionBtnClass}--secondary`} onClick={() => selectRow(row)}>
        상세
      </button>
    );

    if (view === "new_order") {
      return (
        <div className="flex flex-wrap gap-1">
          {row.channel === "commerce" && canBulkAction(row, "confirm_order") === null ? (
            <button
              type="button"
              disabled={busy}
              className={`${actionBtnClass} ${actionBtnClass}--primary`}
              onClick={() => void runSingleAction(row, "confirm_order")}
            >
              발주확인
            </button>
          ) : null}
          {row.channel === "commerce" && canBulkAction(row, "cancel_order") === null ? (
            <button
              type="button"
              disabled={busy}
              className={`${actionBtnClass} ${actionBtnClass}--secondary`}
              onClick={() => void runSingleAction(row, "cancel_order")}
            >
              취소처리
            </button>
          ) : null}
          {detailBtn}
        </div>
      );
    }

    if (view === "preparing") {
      return (
        <div className="flex flex-wrap gap-1">
          {row.channel === "commerce" && isDeliveryOrder(row) && canBulkAction(row, "ship_order") === null ? (
            <button
              type="button"
              disabled={busy}
              className={`${actionBtnClass} ${actionBtnClass}--primary`}
              onClick={() => openShipModal(row)}
            >
              송장등록
            </button>
          ) : null}
          {row.channel === "commerce" && isVisitOrStoreInstall(row) && canStartVisit(row) === null ? (
            <button
              type="button"
              disabled={busy}
              className={`${actionBtnClass} ${actionBtnClass}--primary`}
              onClick={() => void runVisitStart(row)}
            >
              출장시작
            </button>
          ) : null}
          {row.channel === "commerce" && isStorePickup(row) ? (
            <button
              type="button"
              className={`${actionBtnClass} ${actionBtnClass}--secondary`}
              onClick={() => selectRow(row)}
            >
              수령대기
            </button>
          ) : null}
          {detailBtn}
        </div>
      );
    }

    if (view === "in_progress") {
      const completeAction = completeActionForRow(row);
      const trackingHref =
        row.channel === "commerce" && isDeliveryOrder(row)
          ? deliveryTrackingUrl(row.shippingCarrier, row.shippingTrackingNumber)
          : null;
      const completeLabel =
        completeAction === "mark_work_completed"
          ? "작업완료"
          : completeAction === "mark_pickup_completed"
            ? "수령완료"
            : "완료처리";
      return (
        <div className="flex flex-wrap gap-1.5">
          {trackingHref ? (
            <a
              href={trackingHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBtnClass} ${actionBtnClass}--secondary`}
            >
              배송조회
            </a>
          ) : null}
          {completeAction ? (
            <button
              type="button"
              disabled={busy}
              className={`${actionBtnClass} ${actionBtnClass}--primary`}
              onClick={() => void runSingleAction(row, completeAction)}
            >
              {completeLabel}
            </button>
          ) : null}
          {detailBtn}
        </div>
      );
    }

    if (view === "cancel_request") {
      return (
        <div className="flex flex-wrap gap-1">
          <Link href={claimHref(row, "CANCEL")} className={`${actionBtnClass} ${actionBtnClass}--primary`}>
            취소승인
          </Link>
          <Link href={claimHref(row, "CANCEL")} className={`${actionBtnClass} ${actionBtnClass}--secondary`}>
            취소거부
          </Link>
          {detailBtn}
        </div>
      );
    }

    if (view === "return_exchange") {
      return (
        <div className="flex flex-wrap gap-1">
          <Link href={claimHref(row, "RETURN")} className={`${actionBtnClass} ${actionBtnClass}--primary`}>
            승인
          </Link>
          <Link href={claimHref(row, "RETURN")} className={`${actionBtnClass} ${actionBtnClass}--secondary`}>
            거부
          </Link>
          {detailBtn}
        </div>
      );
    }

    return detailBtn;
  };

  return (
    <div className="admin-order-workbench space-y-4">
      {!dbReady ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-950">
          자사몰 결제 주문 DB가 연결되지 않았습니다. 상담 주문만 표시됩니다.
        </p>
      ) : null}

      <nav className="admin-order-workbench__tabs" aria-label="주문 상태">
        {tabCounts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setParams({ view: item.id === "new_order" ? null : item.id })}
            className={`admin-order-workbench__tab ${view === item.id ? "is-active" : ""}`}
          >
            <span>{item.label}</span>
            <span className="admin-order-workbench__tab-count">{item.count}</span>
          </button>
        ))}
      </nav>

      <div className="admin-order-workbench__filters">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[11px] font-bold text-slate-500">
            기간
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
            주문 구분
            <select
              value={dataScope}
              onChange={(e) =>
                setParams({
                  dataScope: (e.target.value as AdminOrderDataScope) === "production" ? null : e.target.value,
                })
              }
              className="mt-1 block rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="production">실제 주문</option>
              <option value="test">테스트 주문</option>
              <option value="all">전체</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            {advancedOpen ? "상세필터 닫기" : "상세필터"}
          </button>
        </div>
        {advancedOpen ? (
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
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
                <option value="completed">결제됨</option>
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
        ) : null}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="주문번호·고객명·연락처·상품명·배터리 규격 검색"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {actionMessage ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{actionMessage}</p>
      ) : null}

      <div className={`admin-order-workbench__layout ${hasSelection ? "has-detail" : "no-detail"}`}>
        <div className="admin-data-table__wrap overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="admin-table admin-order-workbench__table w-full min-w-[1040px] text-sm">
            <thead>
              <tr>
                <th>주문일</th>
                <th>주문번호</th>
                <th>고객명/연락처</th>
                <th>상품/규격</th>
                <th>수령방식</th>
                <th>결제금액</th>
                <th>상태</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-700">조건에 맞는 주문이 없습니다.</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {WORKBENCH_STATUS_BAR.find((t) => t.id === view)?.label ?? "해당"} 상태의 주문이 없습니다.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const selected =
                    (row.channel === "commerce" && row.id === selectedCommerceId) ||
                    (row.channel === "consultation" && row.id === selectedConsultId);
                  const needsAction = rowNeedsOperatorAction(row);
                  const productPrimary = row.batteryCode || row.productName;
                  return (
                    <tr
                      key={`${row.channel}:${row.id}`}
                      className={`admin-order-workbench__row ${selected ? "is-selected" : ""} ${needsAction ? "needs-action" : ""}`}
                    >
                      <td className="admin-table__date whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString("ko-KR", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="admin-table__mono font-mono">
                        <button
                          type="button"
                          className="text-left text-blue-800 hover:underline"
                          onClick={() => selectRow(row)}
                        >
                          {row.orderNumber}
                        </button>
                        {row.isTestOrder ? (
                          <span className="ml-1 rounded bg-violet-100 px-1 py-0.5 text-[10px] font-bold text-violet-800">
                            테스트
                          </span>
                        ) : null}
                      </td>
                      <td className="admin-table__customer">
                        <p className="admin-table__customer-name">{row.customerName}</p>
                        <p className="admin-table__customer-phone">{row.customerPhone}</p>
                      </td>
                      <td className="admin-table__product min-w-[11rem]">
                        <p className="admin-table__product-spec">{productPrimary}</p>
                        <p className="admin-table__product-name">{row.productName}</p>
                      </td>
                      <td>{row.fulfillmentLabel}</td>
                      <td className="admin-table__amount tabular-nums">
                        {row.finalAmount != null ? formatPriceWon(row.finalAmount) : "—"}
                      </td>
                      <td>
                        <span
                          className={`admin-order-status-badge ${statusBadgeClass(row.orderStatus)} ${needsAction ? "admin-order-status-badge--urgent" : ""}`}
                        >
                          {row.orderStatusLabel}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>{renderRowActions(row)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {hasSelection ? (
          <aside className="admin-order-workbench__detail xl:sticky xl:top-4">
            <div className="admin-order-workbench__detail-head">
              <h3 className="text-sm font-black text-slate-900">주문 상세</h3>
              <button
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
                onClick={() => setParams({ orderId: null, id: null })}
              >
                닫기
              </button>
            </div>
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
            ) : null}
          </aside>
        ) : null}
      </div>

      {shipModalOpen ? (
        <div className="admin-order-workbench__modal-backdrop" role="presentation">
          <div className="admin-order-workbench__modal" role="dialog" aria-labelledby="ship-modal-title">
            <h3 id="ship-modal-title" className="text-sm font-black text-slate-900">
              배송처리
            </h3>
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
                onClick={() => {
                  setShipModalOpen(false);
                  setShipTargetId(null);
                }}
              >
                취소
              </button>
              <button type="button" disabled={busy} className={bm.btnNavy} onClick={handleShipSubmit}>
                저장 및 발송처리
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
