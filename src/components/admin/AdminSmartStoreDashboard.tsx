"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  matchesWorkbenchView,
  type OrderWorkbenchClaimContext,
} from "@/lib/admin/order-workbench";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type {
  AdminConsultationSummary,
  AdminDashboardWorkbenchView,
  AdminTodayTaskItem,
} from "@/types/admin";

type Props = {
  actionCards: AdminTodayTaskItem[];
  productionRows: UnifiedAdminOrderRow[];
  claimContext: {
    cancelRequestOrderIds: string[];
    returnExchangeOrderIds: string[];
  };
  consultationSummary: AdminConsultationSummary;
};

function toneClass(tone: AdminTodayTaskItem["tone"], count: number, active: boolean): string {
  if (active) return "active";
  if (count === 0) return "zero";
  switch (tone) {
    case "urgent":
      return "urgent";
    case "progress":
      return "progress";
    case "done":
      return "done";
    case "warn":
      return "warn";
    default:
      return "info";
  }
}

function toClaimContext(ctx: Props["claimContext"]): OrderWorkbenchClaimContext {
  return {
    cancelRequestOrderIds: new Set(ctx.cancelRequestOrderIds),
    returnExchangeOrderIds: new Set(ctx.returnExchangeOrderIds),
  };
}

export function AdminSmartStoreDashboard({
  actionCards,
  productionRows,
  claimContext: claimContextProp,
  consultationSummary,
}: Props) {
  const [activeView, setActiveView] = useState<AdminDashboardWorkbenchView>("new_order");
  const claimContext = useMemo(() => toClaimContext(claimContextProp), [claimContextProp]);

  const filteredRows = useMemo(
    () => productionRows.filter((row) => matchesWorkbenchView(row, activeView, claimContext)),
    [productionRows, activeView, claimContext],
  );

  const activeCard = actionCards.find((c) => c.view === activeView);
  const activeLabel = activeCard?.label ?? "주문";

  return (
    <div className="admin-dashboard space-y-6">
      <section className="admin-panel border-blue-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="admin-panel__header border-b border-slate-100">
          <div>
            <h2 className="admin-panel__title text-lg">주문 처리 현황</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              카드를 클릭하면 아래 목록이 해당 상태로 바뀝니다. 기본 집계는 실제 주문만 포함합니다.
            </p>
          </div>
        </div>
        <div className="p-3">
          <div className="admin-dashboard-section__grid admin-dashboard-section__grid--5">
            {actionCards.map((item) => {
              const active = activeView === item.view;
              const tone = toneClass(item.tone, item.count, active);
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => setActiveView(item.view)}
                  className="group block w-full text-left"
                  aria-pressed={active}
                >
                  <div className={`admin-stat-card admin-stat-card--${tone} h-full`}>
                    <p className="admin-stat-card__label flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {active ? (
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white">
                          선택
                        </span>
                      ) : null}
                    </p>
                    <p className={`admin-stat-card__value admin-stat-card__value--${tone}`}>
                      {item.count.toLocaleString("ko-KR")}
                    </p>
                    {item.description ? (
                      <p className="admin-stat-card__desc">{item.description}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {(consultationSummary.pendingInquiries > 0 || consultationSummary.pendingBatteryTalk > 0) && (
        <section className="admin-panel admin-consultation-summary">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">상담 확인</h2>
          </div>
          <div className="flex flex-wrap gap-3 p-4">
            {consultationSummary.pendingBatteryTalk > 0 ? (
              <Link
                href={`${ADMIN_ROUTES.inquiries}?type=consultation`}
                className="admin-consultation-summary__link"
              >
                <span className="admin-consultation-summary__label">배터리톡 상담</span>
                <span className="admin-consultation-summary__count">
                  {consultationSummary.pendingBatteryTalk}건
                </span>
              </Link>
            ) : null}
            {consultationSummary.pendingInquiries > 0 ? (
              <Link href={ADMIN_ROUTES.inquiries} className="admin-consultation-summary__link">
                <span className="admin-consultation-summary__label">문의 미확인</span>
                <span className="admin-consultation-summary__count">
                  {consultationSummary.pendingInquiries}건
                </span>
              </Link>
            ) : null}
          </div>
        </section>
      )}

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">{activeLabel} 목록</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              {filteredRows.length.toLocaleString("ko-KR")}건 · 카드 숫자와 동일 기준
            </p>
          </div>
          <Link
            href={`${ADMIN_ROUTES.orders}?view=${activeView}`}
            className="admin-panel__link"
          >
            주문관리에서 열기
          </Link>
        </div>
        <div className="admin-data-table__wrap admin-data-table__wrap--sticky overflow-x-auto">
          <table className="admin-table admin-order-workbench__table w-full min-w-[960px]">
            <thead>
              <tr>
                <th>주문일</th>
                <th>주문번호</th>
                <th>고객명/연락처</th>
                <th>상품/규격</th>
                <th>수령</th>
                <th>금액</th>
                <th>상태</th>
                <th className="text-right">상세</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="admin-table__empty py-10 text-center">
                      <p className="text-sm font-bold text-slate-700">
                        {activeLabel} 상태의 주문이 없습니다.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((o) => {
                  const productPrimary = o.batteryCode || o.productName;
                  const href =
                    o.channel === "commerce"
                      ? `${ADMIN_ROUTES.orders}?view=${activeView}&orderId=${encodeURIComponent(o.id)}`
                      : `${ADMIN_ROUTES.orders}?view=${activeView}&id=${encodeURIComponent(o.id)}`;
                  return (
                    <tr
                      key={`${o.channel}-${o.id}`}
                      className={`admin-order-workbench__row ${o.isTestOrder ? "" : ""}`}
                    >
                      <td className="admin-table__date whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="admin-table__mono">
                        <Link href={href} className="font-bold text-blue-700 hover:underline">
                          {o.orderNumber}
                        </Link>
                        {o.isTestOrder ? (
                          <span className="admin-order-ops-badge admin-order-ops-badge--violet ml-1">
                            테스트
                          </span>
                        ) : null}
                      </td>
                      <td className="admin-table__customer">
                        <p className="admin-table__customer-name">{o.customerName}</p>
                        <p className="admin-table__customer-phone">{o.customerPhone}</p>
                      </td>
                      <td className="admin-table__product min-w-[10rem]">
                        <p className="admin-table__product-spec">{productPrimary}</p>
                        <p className="admin-table__product-name">{o.productName}</p>
                      </td>
                      <td>{o.fulfillmentLabel}</td>
                      <td className="admin-table__amount tabular-nums">
                        {o.finalAmount != null ? formatPriceWon(o.finalAmount) : "—"}
                      </td>
                      <td>
                        <span className="admin-order-status-badge">{o.orderStatusLabel}</span>
                      </td>
                      <td className="text-right">
                        <Link href={href} className="admin-btn admin-btn--secondary admin-btn--md">
                          열기
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
