"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import type { AdminShippingSummary } from "@/lib/admin/data/shipping-summary";

type Props = {
  summary: AdminShippingSummary;
};

type Tab = "all" | "needs_invoice" | "ready_to_ship" | "in_transit";

const TAB_LABELS: Record<Tab, string> = {
  all: "전체",
  needs_invoice: "송장등록 필요",
  ready_to_ship: "발송처리 대기",
  in_transit: "배송조회 준비중",
};

const QUEUE_BADGE: Record<string, string> = {
  needs_invoice: "송장등록 필요",
  ready_to_ship: "발송처리 대기",
  in_transit: "배송조회 준비중",
};

export function AdminShippingClient({ summary }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return summary.items;
    return summary.items.filter((i) => i.queueStatus === tab);
  }, [summary.items, tab]);

  return (
    <div className="space-y-5">
      <div className="admin-panel border-blue-100 bg-blue-50/50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          경동택배 단일 사용 전제입니다. 스윗트래커 API 연동 후 송장 조회·배송완료 자동 반영이 추가됩니다.
        </p>
      </div>

      {!summary.dbReady ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-600">
          주문 DB가 연결되지 않았습니다.
        </p>
      ) : (
        <>
          <div className="admin-dashboard-section__grid">
            <button type="button" className="text-left" onClick={() => setTab("needs_invoice")}>
              <div className="admin-stat-card">
                <p className="admin-stat-card__label">송장등록 필요</p>
                <p className="admin-stat-card__value admin-stat-card__value--warning">
                  {summary.needsInvoice}
                </p>
              </div>
            </button>
            <button type="button" className="text-left" onClick={() => setTab("ready_to_ship")}>
              <div className="admin-stat-card">
                <p className="admin-stat-card__label">발송처리 대기</p>
                <p className="admin-stat-card__value admin-stat-card__value--info">
                  {summary.readyToShip}
                </p>
              </div>
            </button>
            <button type="button" className="text-left" onClick={() => setTab("in_transit")}>
              <div className="admin-stat-card">
                <p className="admin-stat-card__label">배송조회 준비중</p>
                <p className="admin-stat-card__value admin-stat-card__value--default">
                  {summary.inTransit}
                </p>
              </div>
            </button>
          </div>

          <div className="admin-order-workbench__tabs">
            {(Object.keys(TAB_LABELS) as Tab[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`admin-order-workbench__tab ${tab === id ? "admin-order-workbench__tab--active" : ""}`}
                onClick={() => setTab(id)}
              >
                {TAB_LABELS[id]}
              </button>
            ))}
          </div>

          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">{TAB_LABELS[tab]} 목록</h2>
              <Link href={`${ADMIN_ROUTES.orders}?view=preparing`} className="admin-panel__link">
                주문관리에서 처리
              </Link>
            </div>
            <div className="admin-data-table__wrap overflow-x-auto">
              <table className="admin-table w-full min-w-[880px]">
                <thead>
                  <tr>
                    <th>주문일</th>
                    <th>주문번호</th>
                    <th>고객명</th>
                    <th>상품/규격</th>
                    <th>상태</th>
                    <th>송장</th>
                    <th>큐</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <p className="admin-table__empty py-8 text-center text-sm font-semibold text-slate-600">
                          현재 {TAB_LABELS[tab]} 항목이 없습니다.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id} className="admin-table__row--clickable">
                        <td className="whitespace-nowrap text-sm">
                          {new Date(row.createdAt).toLocaleString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="admin-table__mono">
                          <Link
                            href={`${ADMIN_ROUTES.orders}?orderId=${encodeURIComponent(row.id)}`}
                            className="font-bold text-blue-700 hover:underline"
                          >
                            {row.orderNumber}
                          </Link>
                        </td>
                        <td>{row.customerName}</td>
                        <td>
                          <p className="font-semibold">{row.batteryCode || row.productName}</p>
                          <p className="text-sm text-slate-500">{row.productName}</p>
                        </td>
                        <td>
                          <span className="admin-order-status-badge">{row.orderStatusLabel}</span>
                        </td>
                        <td className="text-sm">
                          {row.shippingTrackingNumber ? (
                            <span>
                              {row.shippingCarrier ?? "경동택배"} · {row.shippingTrackingNumber}
                            </span>
                          ) : (
                            <span className="text-amber-700">미등록</span>
                          )}
                        </td>
                        <td>
                          <span className="admin-order-ops-badge admin-order-ops-badge--blue">
                            {QUEUE_BADGE[row.queueStatus]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
