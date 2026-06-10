"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminOrderDetailModal, AdminOrderNumberButton } from "@/components/admin/AdminOrderDetailModal";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import type { AdminShippingSummary } from "@/lib/admin/data/shipping-summary";

type Props = {
  summary: AdminShippingSummary;
};

type Tab = "needs_invoice" | "ready_to_ship" | "in_transit" | "auto_complete";

const TAB_LABELS: Record<Tab, string> = {
  needs_invoice: "송장등록 필요",
  ready_to_ship: "발송처리 완료",
  in_transit: "배송조회 준비중",
  auto_complete: "배송완료 자동화 예정",
};

const QUEUE_BADGE: Record<string, string> = {
  needs_invoice: "송장등록 필요",
  ready_to_ship: "발송처리 완료",
  in_transit: "배송조회 준비중",
};

const DEFAULT_CARRIER = "경동택배";

export function AdminShippingClient({ summary }: Props) {
  const [tab, setTab] = useState<Tab>("needs_invoice");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trackingById, setTrackingById] = useState<Record<string, string>>({});
  const [shipping, setShipping] = useState(false);
  const [orderModalId, setOrderModalId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (tab === "auto_complete") return [];
    return summary.items.filter((i) => i.queueStatus === tab);
  }, [summary.items, tab]);

  const needsInvoiceRows = useMemo(
    () => summary.items.filter((i) => i.queueStatus === "needs_invoice"),
    [summary.items],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === needsInvoiceRows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(needsInvoiceRows.map((r) => r.id)));
    }
  };

  const shipOrders = async (targets: { orderId: string; tracking: string }[]) => {
    const valid = targets.filter((t) => t.tracking.trim());
    if (valid.length === 0) {
      setMessage("송장번호가 입력된 주문을 선택해 주세요.");
      return;
    }
    if (
      !confirm(
        `선택한 ${valid.length}건을 경동택배 기준으로 발송처리하시겠습니까?\n(내부 주문 상태만 변경됩니다)`,
      )
    ) {
      return;
    }
    setShipping(true);
    setMessage(null);
    let ok = 0;
    let fail = 0;
    for (const t of valid) {
      const res = await fetch("/api/admin/orders/bulk-action", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ship_order",
          targets: [{ orderId: t.orderId, channel: "commerce" }],
          shippingCarrier: DEFAULT_CARRIER,
          shippingTrackingNumber: t.tracking.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) ok += 1;
      else fail += 1;
    }
    setShipping(false);
    setMessage(`${ok}건 발송처리 완료${fail > 0 ? `, ${fail}건 실패` : ""}`);
    setSelected(new Set());
    window.location.reload();
  };

  const bulkShip = () => {
    const targets = [...selected].map((id) => ({
      orderId: id,
      tracking: trackingById[id] ?? "",
    }));
    void shipOrders(targets);
  };

  const shipSingle = (orderId: string) => {
    void shipOrders([{ orderId, tracking: trackingById[orderId] ?? "" }]);
  };

  return (
    <div className="space-y-5">
      <div className="admin-panel border-blue-100 bg-blue-50/50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          택배사: <strong>경동택배</strong> 단일 사용 기준입니다.
        </p>
        <p className="mt-1 text-sm font-medium text-blue-800">
          스윗트래커 연동 전에는 API를 호출하지 않습니다. 발송처리는 내부 주문 상태만 변경합니다.
        </p>
      </div>

      {message ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {message}
        </p>
      ) : null}

      {!summary.dbReady ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-600">
          주문 DB가 연결되지 않았습니다.
        </p>
      ) : (
        <>
          <div className="admin-dashboard-section__grid admin-dashboard-section__grid--4">
            <button type="button" className="text-left" onClick={() => setTab("needs_invoice")}>
              <div
                className={`admin-stat-card${tab === "needs_invoice" ? " admin-stat-card--active" : ""}`}
              >
                <p className="admin-stat-card__label">송장등록 필요</p>
                <p className="admin-stat-card__value admin-stat-card__value--warning">
                  {summary.needsInvoice}
                </p>
              </div>
            </button>
            <button type="button" className="text-left" onClick={() => setTab("ready_to_ship")}>
              <div
                className={`admin-stat-card${tab === "ready_to_ship" ? " admin-stat-card--active" : ""}`}
              >
                <p className="admin-stat-card__label">발송처리 완료</p>
                <p className="admin-stat-card__value admin-stat-card__value--info">
                  {summary.readyToShip}
                </p>
              </div>
            </button>
            <button type="button" className="text-left" onClick={() => setTab("in_transit")}>
              <div
                className={`admin-stat-card${tab === "in_transit" ? " admin-stat-card--active" : ""}`}
              >
                <p className="admin-stat-card__label">배송조회 준비중</p>
                <p className="admin-stat-card__value admin-stat-card__value--default">
                  {summary.inTransit}
                </p>
              </div>
            </button>
            <button type="button" className="text-left" onClick={() => setTab("auto_complete")}>
              <div
                className={`admin-stat-card${tab === "auto_complete" ? " admin-stat-card--active" : ""}`}
              >
                <p className="admin-stat-card__label">배송완료 자동화 예정</p>
                <p className="admin-stat-card__value admin-stat-card__value--default">—</p>
              </div>
            </button>
          </div>

          <div className="admin-order-workbench__tabs">
            {(Object.keys(TAB_LABELS) as Tab[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`admin-order-workbench__tab ${tab === id ? "is-active" : ""}`}
                onClick={() => setTab(id)}
              >
                {TAB_LABELS[id]}
              </button>
            ))}
          </div>

          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">{TAB_LABELS[tab]} 목록</h2>
              <Link href={`${ADMIN_ROUTES.orders}?view=needs_invoice`} className="admin-panel__link">
                주문관리에서 처리
              </Link>
            </div>

            {tab === "needs_invoice" && filtered.length > 0 ? (
              <div className="admin-shipping-bulk-bar">
                <span className="text-sm font-bold text-slate-700">
                  선택 {selected.size}건 · 택배사 {DEFAULT_CARRIER}
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary admin-btn--md"
                  disabled={shipping || selected.size === 0}
                  onClick={bulkShip}
                >
                  {shipping ? "처리 중…" : "선택 발송처리"}
                </button>
              </div>
            ) : null}

            {tab === "auto_complete" ? (
              <div className="p-6 text-center text-sm font-semibold text-slate-600">
                <p>스윗트래커 배송추적 API 연동 후 배송완료가 자동 반영됩니다.</p>
                <p className="mt-2 text-slate-500">
                  수동 배송완료 보정이 필요하면 주문 상세의 관리자 보정 영역에서만 처리합니다.
                </p>
              </div>
            ) : (
              <div className="admin-data-table__wrap overflow-x-auto">
                <table className="admin-table w-full min-w-[1100px]">
                  <thead>
                    <tr>
                      {tab === "needs_invoice" ? (
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              needsInvoiceRows.length > 0 &&
                              selected.size === needsInvoiceRows.length
                            }
                            onChange={toggleAll}
                            aria-label="전체 선택"
                          />
                        </th>
                      ) : null}
                      <th>주문일</th>
                      <th>주문번호</th>
                      <th>고객명/연락처</th>
                      <th>상품/규격</th>
                      <th>배송지 요약</th>
                      <th>수령방식</th>
                      <th>송장번호</th>
                      <th className="text-right">처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={tab === "needs_invoice" ? 9 : 8}>
                          <p className="admin-table__empty py-8 text-center text-sm font-semibold text-slate-600">
                            {tab === "needs_invoice"
                              ? "송장등록이 필요한 주문이 없습니다."
                              : `현재 ${TAB_LABELS[tab]} 항목이 없습니다.`}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row) => (
                        <tr key={row.id} className="admin-table__row--clickable">
                          {tab === "needs_invoice" ? (
                            <td>
                              <input
                                type="checkbox"
                                checked={selected.has(row.id)}
                                onChange={() => toggleSelect(row.id)}
                                aria-label={`${row.orderNumber} 선택`}
                              />
                            </td>
                          ) : null}
                          <td className="whitespace-nowrap text-sm">
                            {new Date(row.createdAt).toLocaleString("ko-KR", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="admin-table__mono">
                            <AdminOrderNumberButton
                              orderId={row.id}
                              orderNumber={row.orderNumber}
                              onOpen={setOrderModalId}
                            />
                          </td>
                          <td>
                            <p className="font-semibold">{row.customerName}</p>
                            <p className="text-sm text-slate-500">{row.customerPhone}</p>
                          </td>
                          <td>
                            <p className="font-semibold">{row.batteryCode || row.productName}</p>
                            <p className="text-sm text-slate-500">{row.productName}</p>
                          </td>
                          <td className="text-sm text-slate-600">{row.deliveryAddressSummary}</td>
                          <td>{row.fulfillmentLabel}</td>
                          <td>
                            {row.queueStatus === "needs_invoice" ? (
                              <input
                                type="text"
                                className="w-full min-w-[8rem] rounded border border-slate-200 px-2 py-1 text-sm"
                                placeholder="송장번호"
                                value={trackingById[row.id] ?? ""}
                                onChange={(e) =>
                                  setTrackingById((prev) => ({
                                    ...prev,
                                    [row.id]: e.target.value,
                                  }))
                                }
                              />
                            ) : row.shippingTrackingNumber ? (
                              <span className="text-sm">
                                {row.shippingCarrier ?? DEFAULT_CARRIER} · {row.shippingTrackingNumber}
                              </span>
                            ) : (
                              <span className="text-amber-700 text-sm">미등록</span>
                            )}
                          </td>
                          <td className="text-right">
                            {row.queueStatus === "needs_invoice" ? (
                              <button
                                type="button"
                                className="admin-btn admin-btn--primary admin-btn--md"
                                disabled={shipping || !(trackingById[row.id] ?? "").trim()}
                                onClick={() => shipSingle(row.id)}
                              >
                                발송처리
                              </button>
                            ) : (
                              <span className="admin-order-ops-badge admin-order-ops-badge--sky">
                                {QUEUE_BADGE[row.queueStatus]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <AdminOrderDetailModal orderId={orderModalId} onClose={() => setOrderModalId(null)} />
    </div>
  );
}
