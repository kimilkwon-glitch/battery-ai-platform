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

const KPI_TONES: Record<Tab, "warning" | "info" | "default" | "muted"> = {
  needs_invoice: "warning",
  ready_to_ship: "info",
  in_transit: "default",
  auto_complete: "muted",
};

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

  const kpiItems: { id: Tab; label: string; value: string | number }[] = [
    { id: "needs_invoice", label: "송장등록 필요", value: summary.needsInvoice },
    { id: "ready_to_ship", label: "발송처리 완료", value: summary.readyToShip },
    { id: "in_transit", label: "배송조회 준비중", value: summary.inTransit },
    { id: "auto_complete", label: "배송완료 자동화 예정", value: "—" },
  ];

  return (
    <div className="admin-shipping-workspace">
      <div className="admin-workspace-notice admin-workspace-notice--shipping">
        <p className="admin-workspace-notice__title">경동택배 단일 사용 · 내부 상태만 변경</p>
        <p className="admin-workspace-notice__text">
          스윗트래커 연동 전에는 API를 호출하지 않습니다.
        </p>
      </div>

      {message ? <p className="admin-workspace-flash">{message}</p> : null}

      {!summary.dbReady ? (
        <p className="admin-workspace-empty">주문 DB가 연결되지 않았습니다.</p>
      ) : (
        <>
          <div className="admin-kpi-grid admin-kpi-grid--4">
            {kpiItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-kpi-card admin-kpi-card--${KPI_TONES[item.id]}${tab === item.id ? " admin-kpi-card--active" : ""}`}
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
              >
                <span className="admin-kpi-card__label">{item.label}</span>
                <span className="admin-kpi-card__value">{item.value}</span>
              </button>
            ))}
          </div>

          <nav className="admin-workbench-tabs" aria-label="배송 상태">
            {(Object.keys(TAB_LABELS) as Tab[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`admin-workbench-tabs__tab${tab === id ? " is-active" : ""}`}
                onClick={() => setTab(id)}
              >
                {TAB_LABELS[id]}
              </button>
            ))}
          </nav>

          <section className="admin-panel admin-workspace-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">{TAB_LABELS[tab]} 목록</h2>
              <Link href={`${ADMIN_ROUTES.orders}?view=needs_invoice`} className="admin-panel__link">
                주문관리에서 처리
              </Link>
            </div>

            {tab === "needs_invoice" && filtered.length > 0 ? (
              <div className="admin-shipping-bulk-bar">
                <span className="admin-shipping-bulk-bar__label">
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
              <div className="admin-table__empty admin-table__empty--panel">
                <p className="admin-table__empty-title">배송완료 자동 반영은 스윗트래커 연동 후 제공됩니다.</p>
                <p className="admin-table__empty-sub">
                  수동 보정이 필요하면 주문 상세의 관리자 보정에서 처리하세요.
                </p>
              </div>
            ) : (
              <div className="admin-data-table__wrap overflow-x-auto">
                <table className="admin-table admin-order-workbench__table w-full min-w-[980px]">
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
                      <th>주문번호</th>
                      <th>고객</th>
                      <th>상품/규격</th>
                      <th>배송지</th>
                      <th>수령</th>
                      <th>송장번호</th>
                      <th className="text-right">처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={tab === "needs_invoice" ? 8 : 7}>
                          <div className="admin-table__empty py-8 text-center">
                            <p className="admin-table__empty-title">
                              {tab === "needs_invoice"
                                ? "송장등록이 필요한 주문이 없습니다."
                                : `현재 ${TAB_LABELS[tab]} 항목이 없습니다.`}
                            </p>
                          </div>
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
                          <td className="admin-table__mono admin-order-workbench__order-cell">
                            <AdminOrderNumberButton
                              orderId={row.id}
                              orderNumber={row.orderNumber}
                              onOpen={setOrderModalId}
                            />
                            <p className="admin-order-workbench__order-date">
                              {new Date(row.createdAt).toLocaleString("ko-KR", {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="admin-table__customer">
                            <p className="admin-table__customer-name">{row.customerName}</p>
                            <p className="admin-table__customer-phone">{row.customerPhone}</p>
                          </td>
                          <td className="admin-table__product">
                            <p className="admin-table__product-spec">{row.batteryCode || row.productName}</p>
                            <p className="admin-table__product-name">{row.productName}</p>
                          </td>
                          <td className="admin-table__address">{row.deliveryAddressSummary}</td>
                          <td>{row.fulfillmentLabel}</td>
                          <td>
                            {row.queueStatus === "needs_invoice" ? (
                              <input
                                type="text"
                                className="admin-shipping-tracking-input"
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
                              <span className="admin-table__tracking">
                                {row.shippingCarrier ?? DEFAULT_CARRIER} · {row.shippingTrackingNumber}
                              </span>
                            ) : (
                              <span className="admin-table__tracking admin-table__tracking--missing">미등록</span>
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
