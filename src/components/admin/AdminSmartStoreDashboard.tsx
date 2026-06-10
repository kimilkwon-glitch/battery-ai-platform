"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  formatAdminCustomerName,
  formatAdminContact,
  formatAdminInquiryMessage,
} from "@/lib/admin/admin-display-labels";
import {
  DASHBOARD_PANEL_EMPTY_MESSAGES,
  DASHBOARD_PANEL_LIST_TITLES,
  filterBatteryTalkThreads,
  filterClaimsByPanel,
  filterDelayOrders,
  filterInquiries,
  filterProductRows,
  filterReviewRows,
  matchCommerceNeedsInvoice,
  matchCommercePreparing,
  matchesDashboardOrderPanel,
  panelListKind,
  type AdminDashboardCard,
  type AdminDashboardPanel,
} from "@/lib/admin/dashboard-panel";
import type { OrderWorkbenchClaimContext } from "@/lib/admin/order-workbench";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminDashboardConsultationPreview } from "@/lib/admin/data/admin-dashboard-snapshot";
import type { AdminSettlementSummary } from "@/lib/admin/data/settlement-summary";
import type { CommerceClaimSummary } from "@/types/commerce-claim";
import { CLAIM_TYPE_LABELS, ADMIN_CLAIM_STATUS_LABELS } from "@/types/commerce-claim";
import type { CustomerInquiryRecord } from "@/types/customer-inquiry";
import { INQUIRY_CATEGORY_LABELS } from "@/types/customer-inquiry";
import type { AdminProductRow } from "@/types/admin-product";
import type { BatteryTalkThreadSummary } from "@/types/battery-talk";
import { BATTERY_TALK_STATUS_LABELS } from "@/types/battery-talk";
import type { AdminDashboardCardTone } from "@/types/admin";
import type { CustomerReviewRecord } from "@/types/customer-review";

type Props = {
  orderFlowCards: AdminDashboardCard[];
  claimCards: AdminDashboardCard[];
  delayCards: AdminDashboardCard[];
  productCards: AdminDashboardCard[];
  consultationCards: AdminDashboardCard[];
  reviewCards: AdminDashboardCard[];
  reviewRows: CustomerReviewRecord[];
  productionRows: UnifiedAdminOrderRow[];
  productionClaims: CommerceClaimSummary[];
  productRows: AdminProductRow[];
  productionInquiries: CustomerInquiryRecord[];
  batteryTalkThreads: BatteryTalkThreadSummary[];
  photoCheckCount: number;
  recentConsultations: AdminDashboardConsultationPreview[];
  settlement: AdminSettlementSummary;
  claimContext: {
    cancelRequestOrderIds: string[];
    returnExchangeOrderIds: string[];
  };
};

function toneClass(tone: AdminDashboardCardTone | undefined, count: number, active: boolean): string {
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

function DashboardCardGrid({
  cards,
  activePanel,
  onSelect,
  columns = 5,
}: {
  cards: AdminDashboardCard[];
  activePanel: AdminDashboardPanel;
  onSelect: (panel: AdminDashboardPanel) => void;
  columns?: 4 | 5;
}) {
  const gridClass =
    columns === 4
      ? "admin-dashboard-section__grid admin-dashboard-section__grid--4"
      : "admin-dashboard-section__grid admin-dashboard-section__grid--5";

  return (
    <div className={gridClass}>
      {cards.map((item) => {
        const active = activePanel === item.panel;
        const tone = toneClass(item.tone, item.count, active);
        return (
          <button
            key={item.panel}
            type="button"
            onClick={() => onSelect(item.panel)}
            className="group block w-full text-left"
            aria-pressed={active}
          >
            <div
              className={`admin-stat-card admin-stat-card--${tone}${active ? " admin-stat-card--active" : ""} h-full`}
            >
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
  );
}

export function AdminSmartStoreDashboard({
  orderFlowCards,
  claimCards,
  delayCards,
  productCards,
  consultationCards,
  reviewCards,
  reviewRows,
  productionRows,
  productionClaims,
  productRows,
  productionInquiries,
  batteryTalkThreads,
  photoCheckCount,
  recentConsultations,
  settlement,
  claimContext: claimContextProp,
}: Props) {
  const [activePanel, setActivePanel] = useState<AdminDashboardPanel>("new_order");
  const claimContext = useMemo(() => toClaimContext(claimContextProp), [claimContextProp]);

  const activeCardCount = useMemo(() => {
    const all = [
      ...orderFlowCards,
      ...claimCards,
      ...delayCards,
      ...productCards,
      ...consultationCards,
      ...reviewCards,
    ];
    return all.find((c) => c.panel === activePanel)?.count ?? 0;
  }, [
    activePanel,
    orderFlowCards,
    claimCards,
    delayCards,
    productCards,
    consultationCards,
    reviewCards,
  ]);

  const filteredOrders = useMemo(() => {
    if (panelListKind(activePanel) !== "order") return [];
    if (activePanel === "delay_confirm" || activePanel === "delay_invoice") {
      return filterDelayOrders(productionRows, activePanel);
    }
    if (activePanel === "needs_invoice") {
      return productionRows.filter(matchCommerceNeedsInvoice);
    }
    if (activePanel === "preparing") {
      return productionRows.filter(matchCommercePreparing);
    }
    return productionRows.filter((r) =>
      matchesDashboardOrderPanel(r, activePanel, claimContext),
    );
  }, [productionRows, activePanel, claimContext]);

  const filteredClaims = useMemo(() => {
    if (panelListKind(activePanel) !== "claim") return [];
    return filterClaimsByPanel(productionClaims, activePanel);
  }, [productionClaims, activePanel]);

  const filteredProducts = useMemo(() => {
    if (panelListKind(activePanel) !== "product") return [];
    return filterProductRows(productRows, activePanel);
  }, [productRows, activePanel]);

  const filteredTalk = useMemo(() => {
    if (activePanel === "talk_pending" || activePanel === "delay_consultation") {
      return filterBatteryTalkThreads(batteryTalkThreads, activePanel);
    }
    return [];
  }, [batteryTalkThreads, activePanel]);

  const filteredInquiries = useMemo(() => {
    if (
      activePanel === "inquiry_product" ||
      activePanel === "inquiry_order" ||
      activePanel === "delay_consultation"
    ) {
      return filterInquiries(productionInquiries, activePanel);
    }
    return [];
  }, [productionInquiries, activePanel]);

  const filteredReviews = useMemo(() => {
    if (panelListKind(activePanel) !== "review") return [];
    return filterReviewRows(reviewRows, activePanel);
  }, [reviewRows, activePanel]);

  const listTitle = DASHBOARD_PANEL_LIST_TITLES[activePanel];
  const emptyMessage = DASHBOARD_PANEL_EMPTY_MESSAGES[activePanel];
  const listKind = panelListKind(activePanel);

  const listCount =
    listKind === "order"
      ? filteredOrders.length
      : listKind === "claim"
        ? filteredClaims.length
        : listKind === "product"
          ? filteredProducts.length
          : listKind === "review"
            ? filteredReviews.length
            : listKind === "photo"
              ? photoCheckCount
              : filteredTalk.length + filteredInquiries.length;

  const hasConsultationHighlight = consultationCards.some((c) => c.count > 0);

  return (
    <div className="admin-dashboard space-y-6">
      <div className="admin-dashboard__top-grid">
        <section className="admin-panel border-blue-100 bg-gradient-to-br from-slate-50 to-white">
          <div className="admin-panel__header border-b border-slate-100">
            <div>
              <h2 className="admin-panel__title text-xl">주문 처리 흐름</h2>
              <p className="mt-1 text-base font-medium text-slate-500">
                카드를 클릭하면 아래 목록이 해당 업무로 바뀝니다. 실제 주문만 집계합니다.
              </p>
            </div>
          </div>
          <div className="p-3">
            <DashboardCardGrid
              cards={orderFlowCards}
              activePanel={activePanel}
              onSelect={setActivePanel}
            />
          </div>
        </section>

        <aside className="admin-panel admin-dashboard__settlement">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title text-lg">정산 요약</h2>
            <Link href={ADMIN_ROUTES.settlement} className="admin-panel__link">
              정산관리
            </Link>
          </div>
          <div className="space-y-3 p-4 pt-0">
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">오늘 결제금액</p>
              <p className="admin-stat-card__value admin-stat-card__value--info">
                {formatPriceWon(settlement.todayPaidAmount)}
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">이번 달 결제금액</p>
              <p className="admin-stat-card__value admin-stat-card__value--info">
                {formatPriceWon(settlement.monthPaidAmount)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="admin-stat-card">
                <p className="admin-stat-card__label text-xs">취소/환불</p>
                <p className="admin-stat-card__value admin-stat-card__value--warning text-lg">
                  {formatPriceWon(settlement.canceledAmount + settlement.refundedAmount)}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-card__label text-xs">예상 정산금</p>
                <p className="admin-stat-card__value admin-stat-card__value--info text-lg">
                  {formatPriceWon(settlement.estimatedSettlement)}
                </p>
              </div>
            </div>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-900">
              토스 결제 연동 후 실제 정산 데이터와 연결됩니다.
            </p>
          </div>
        </aside>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title text-lg">취소·반품·교환 클레임</h2>
          <Link href={ADMIN_ROUTES.commerceClaims} className="admin-panel__link">
            클레임관리
          </Link>
        </div>
        <div className="p-3 pt-0">
          <DashboardCardGrid
            cards={claimCards}
            activePanel={activePanel}
            onSelect={setActivePanel}
          />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title text-lg">처리 지연</h2>
          <p className="text-sm font-medium text-slate-500">24시간 이상 미처리 기준</p>
        </div>
        <div className="p-3 pt-0">
          <DashboardCardGrid
            cards={delayCards}
            activePanel={activePanel}
            onSelect={setActivePanel}
            columns={4}
          />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title text-lg">상품관리 요약</h2>
          <Link href={ADMIN_ROUTES.products} className="admin-panel__link">
            상품관리
          </Link>
        </div>
        <div className="p-3 pt-0">
          <DashboardCardGrid
            cards={productCards}
            activePanel={activePanel}
            onSelect={setActivePanel}
          />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title text-lg">리뷰관리</h2>
          <Link href={ADMIN_ROUTES.reviews} className="admin-panel__link">
            리뷰관리
          </Link>
        </div>
        <div className="p-3 pt-0">
          <DashboardCardGrid
            cards={reviewCards}
            activePanel={activePanel}
            onSelect={setActivePanel}
            columns={4}
          />
        </div>
      </section>

      <section
        className={`admin-panel admin-consultation-summary${hasConsultationHighlight ? " admin-consultation-summary--alert" : ""}`}
      >
        <div className="admin-panel__header">
          <h2 className="admin-panel__title text-lg">상담·문의 현황</h2>
          <Link href={`${ADMIN_ROUTES.inquiries}?type=consultation`} className="admin-panel__link">
            배터리톡 상담관리
          </Link>
        </div>
        <div className="p-3 pt-0 space-y-4">
          <DashboardCardGrid
            cards={consultationCards}
            activePanel={activePanel}
            onSelect={setActivePanel}
            columns={4}
          />
          {recentConsultations.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="mb-2 text-sm font-bold text-slate-700">최근 상담</p>
              <ul className="space-y-2">
                {recentConsultations.map((c) => (
                  <li key={`${c.kind}-${c.id}`}>
                    <Link
                      href={c.href}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm hover:border-blue-200 border border-transparent"
                    >
                      <span className="font-bold text-slate-800">
                        {c.customerName}
                        <span className="ml-2 font-medium text-slate-500">{c.inquiryType}</span>
                      </span>
                      <span className="text-slate-500">{c.summary.slice(0, 40)}…</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">{listTitle}</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              {listCount.toLocaleString("ko-KR")}건 · 카드 숫자와 동일 기준
              {activeCardCount !== listCount && listKind === "consultation" && activePanel === "delay_consultation"
                ? " (문의+배터리톡 합산)"
                : ""}
            </p>
          </div>
          {listKind === "order" ? (
            <Link
              href={`${ADMIN_ROUTES.orders}?view=${activePanel}`}
              className="admin-panel__link"
            >
              주문관리에서 열기
            </Link>
          ) : listKind === "claim" ? (
            <Link href={ADMIN_ROUTES.commerceClaims} className="admin-panel__link">
              클레임관리에서 열기
            </Link>
          ) : listKind === "product" ? (
            <Link
              href={`${ADMIN_ROUTES.products}?review=${activePanel.replace("product_", "")}`}
              className="admin-panel__link"
            >
              상품관리에서 열기
            </Link>
          ) : listKind === "review" ? (
            <Link href={ADMIN_ROUTES.reviews} className="admin-panel__link">
              리뷰관리에서 열기
            </Link>
          ) : (
            <Link
              href={`${ADMIN_ROUTES.inquiries}?type=consultation`}
              className="admin-panel__link"
            >
              상담관리에서 열기
            </Link>
          )}
        </div>

        {listKind === "order" ? (
          <OrderListTable rows={filteredOrders} activePanel={activePanel} emptyMessage={emptyMessage} />
        ) : null}
        {listKind === "claim" ? (
          <ClaimListTable rows={filteredClaims} emptyMessage={emptyMessage} />
        ) : null}
        {listKind === "product" ? (
          <ProductIssueTable rows={filteredProducts} emptyMessage={emptyMessage} />
        ) : null}
        {listKind === "consultation" ? (
          <ConsultationListTables
            talkRows={filteredTalk}
            inquiryRows={filteredInquiries}
            emptyMessage={emptyMessage}
          />
        ) : null}
        {listKind === "review" ? (
          <ReviewListTable rows={filteredReviews} emptyMessage={emptyMessage} />
        ) : null}
        {listKind === "photo" ? (
          <div className="p-6 text-center">
            <p className="text-base font-bold text-slate-700">
              {photoCheckCount > 0
                ? `사진 확인이 필요한 접수 ${photoCheckCount}건이 있습니다.`
                : emptyMessage}
            </p>
            {photoCheckCount > 0 ? (
              <Link
                href={ADMIN_ROUTES.photoRequests}
                className="admin-btn admin-btn--primary admin-btn--md mt-4 inline-flex"
              >
                사진 확인 요청 열기
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function OrderListTable({
  rows,
  activePanel,
  emptyMessage,
}: {
  rows: UnifiedAdminOrderRow[];
  activePanel: AdminDashboardPanel;
  emptyMessage: string;
}) {
  return (
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
            <th className="text-right">처리</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="admin-table__empty py-10 text-center">
                  <p className="text-base font-bold text-slate-700">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((o) => {
              const productPrimary = o.batteryCode || o.productName;
              const href =
                o.channel === "commerce"
                  ? `${ADMIN_ROUTES.orders}?view=${activePanel}&orderId=${encodeURIComponent(o.id)}`
                  : `${ADMIN_ROUTES.orders}?view=${activePanel}&id=${encodeURIComponent(o.id)}`;
              const actionLabel =
                activePanel === "needs_invoice"
                  ? "송장등록"
                  : activePanel === "new_order"
                    ? "발주확인"
                    : "열기";
              return (
                <tr key={`${o.channel}-${o.id}`} className="admin-order-workbench__row">
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
                      {actionLabel}
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function ClaimListTable({
  rows,
  emptyMessage,
}: {
  rows: CommerceClaimSummary[];
  emptyMessage: string;
}) {
  return (
    <div className="admin-data-table__wrap overflow-x-auto">
      <table className="admin-table w-full min-w-[880px]">
        <thead>
          <tr>
            <th>접수일</th>
            <th>주문번호</th>
            <th>고객명/연락처</th>
            <th>유형</th>
            <th>상품</th>
            <th>상태</th>
            <th className="text-right">처리</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="admin-table__empty py-10 text-center">
                  <p className="text-base font-bold text-slate-700">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((c) => (
              <tr key={c.id}>
                <td className="whitespace-nowrap text-sm">
                  {new Date(c.requestedAt).toLocaleString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="admin-table__mono font-bold">{c.orderNumber}</td>
                <td>
                  <p>{formatAdminCustomerName(c.customerName)}</p>
                  <p className="text-sm text-slate-500">{formatAdminContact(c.customerPhone)}</p>
                </td>
                <td>{CLAIM_TYPE_LABELS[c.claimType]}</td>
                <td>{c.productName}</td>
                <td>
                  <span className="admin-order-status-badge">
                    {ADMIN_CLAIM_STATUS_LABELS[c.claimStatus]}
                  </span>
                </td>
                <td className="text-right">
                  <Link
                    href={`${ADMIN_ROUTES.commerceClaims}?claimId=${encodeURIComponent(c.id)}`}
                    className="admin-btn admin-btn--secondary admin-btn--md"
                  >
                    처리
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductIssueTable({
  rows,
  emptyMessage,
}: {
  rows: AdminProductRow[];
  emptyMessage: string;
}) {
  return (
    <div className="admin-data-table__wrap overflow-x-auto">
      <table className="admin-table w-full min-w-[800px]">
        <thead>
          <tr>
            <th>브랜드/규격</th>
            <th>상품명</th>
            <th>누락 항목</th>
            <th>판매상태</th>
            <th className="text-right">바로수정</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="admin-table__empty py-10 text-center">
                  <p className="text-base font-bold text-slate-700">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.slice(0, 50).map((r) => (
              <tr key={r.productId}>
                <td>
                  <p className="font-bold">{r.brandLabel}</p>
                  <p className="text-sm text-slate-500">{r.batteryCode}</p>
                </td>
                <td>{r.displayName}</td>
                <td className="text-sm text-amber-800">{r.reviewLabels.join(", ") || "—"}</td>
                <td>{r.saleStatus === "selling" ? "판매중" : "비활성"}</td>
                <td className="text-right">
                  <Link
                    href={`${ADMIN_ROUTES.products}?review=${r.reviewStatus}&focus=${encodeURIComponent(r.productId)}`}
                    className="admin-btn admin-btn--secondary admin-btn--md"
                  >
                    바로수정
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReviewListTable({
  rows,
  emptyMessage,
}: {
  rows: CustomerReviewRecord[];
  emptyMessage: string;
}) {
  return (
    <div className="admin-data-table__wrap overflow-x-auto">
      <table className="admin-table w-full min-w-[720px]">
        <thead>
          <tr>
            <th>등록일</th>
            <th>상품/차량</th>
            <th>평점</th>
            <th>리뷰 요약</th>
            <th>답글</th>
            <th>작성자</th>
            <th className="text-right">처리</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="admin-table__empty py-10 text-center">
                  <p className="text-base font-bold text-slate-700">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.slice(0, 30).map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap text-sm">
                  {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td>{r.batteryCode ?? r.vehicleName ?? "—"}</td>
                <td>{r.rating}점</td>
                <td className="max-w-xs truncate text-sm">{r.content}</td>
                <td>{r.operatorReply ? "완료" : "대기"}</td>
                <td>{r.authorName}</td>
                <td className="text-right">
                  <Link href={ADMIN_ROUTES.reviews} className="admin-btn admin-btn--secondary admin-btn--md">
                    답글
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ConsultationListTables({
  talkRows,
  inquiryRows,
  emptyMessage,
}: {
  talkRows: BatteryTalkThreadSummary[];
  inquiryRows: CustomerInquiryRecord[];
  emptyMessage: string;
}) {
  const empty = talkRows.length === 0 && inquiryRows.length === 0;
  if (empty) {
    return (
      <div className="admin-table__empty py-10 text-center">
        <p className="text-base font-bold text-slate-700">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {talkRows.length > 0 ? (
        <div className="admin-data-table__wrap overflow-x-auto">
          <table className="admin-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th>접수일</th>
                <th>고객명/연락처</th>
                <th>문의유형</th>
                <th>문의내용 요약</th>
                <th>상태</th>
                <th className="text-right">처리</th>
              </tr>
            </thead>
            <tbody>
              {talkRows.map((t) => (
                <tr key={t.threadId}>
                  <td className="whitespace-nowrap text-sm">
                    {new Date(t.lastMessageAt).toLocaleString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <p>{formatAdminCustomerName(t.customerName)}</p>
                    <p className="text-sm text-slate-500">{formatAdminContact(t.phone)}</p>
                  </td>
                  <td>배터리톡</td>
                  <td className="max-w-xs truncate text-sm">
                    {formatAdminInquiryMessage(t.lastMessagePreview)}
                  </td>
                  <td>{BATTERY_TALK_STATUS_LABELS[t.status]}</td>
                  <td className="text-right">
                    <Link
                      href={`${ADMIN_ROUTES.inquiries}?type=consultation&threadId=${encodeURIComponent(t.threadId)}`}
                      className="admin-btn admin-btn--secondary admin-btn--md"
                    >
                      답변
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {inquiryRows.length > 0 ? (
        <div className="admin-data-table__wrap overflow-x-auto">
          <table className="admin-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th>접수일</th>
                <th>고객명/연락처</th>
                <th>문의유형</th>
                <th>문의내용 요약</th>
                <th>상태</th>
                <th className="text-right">처리</th>
              </tr>
            </thead>
            <tbody>
              {inquiryRows.map((i) => (
                <tr key={i.id}>
                  <td className="whitespace-nowrap text-sm">
                    {new Date(i.createdAt).toLocaleString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <p>{formatAdminCustomerName(i.name)}</p>
                    <p className="text-sm text-slate-500">{formatAdminContact(i.contact)}</p>
                  </td>
                  <td>{INQUIRY_CATEGORY_LABELS[i.category]}</td>
                  <td className="max-w-xs truncate text-sm">
                    {formatAdminInquiryMessage(i.message)}
                  </td>
                  <td>신규</td>
                  <td className="text-right">
                    <Link
                      href={`${ADMIN_ROUTES.inquiries}?id=${encodeURIComponent(i.id)}`}
                      className="admin-btn admin-btn--secondary admin-btn--md"
                    >
                      답변
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
