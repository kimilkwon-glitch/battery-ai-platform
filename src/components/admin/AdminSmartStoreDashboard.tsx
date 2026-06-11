"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
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

function findCardCount(cards: AdminDashboardCard[], panel: AdminDashboardPanel): number {
  return cards.find((c) => c.panel === panel)?.count ?? 0;
}

function reviewHasPhoto(r: CustomerReviewRecord): boolean {
  return (r.images?.length ?? 0) > 0 || Boolean(r.imageUrl?.trim());
}

function reviewPrimaryPhoto(r: CustomerReviewRecord): string | null {
  const fromList = r.images?.find((url) => url.trim());
  if (fromList) return fromList;
  const single = r.imageUrl?.trim();
  return single || null;
}

function SummaryMetricRow({
  label,
  count,
  panel,
  activePanel,
  onSelect,
  tone,
}: {
  label: string;
  count: number;
  panel: AdminDashboardPanel;
  activePanel: AdminDashboardPanel;
  onSelect: (panel: AdminDashboardPanel) => void;
  tone?: AdminDashboardCardTone;
}) {
  const active = activePanel === panel;
  const toneKey = toneClass(tone, count, active);
  return (
    <button
      type="button"
      className={`admin-dash-metric-row admin-dash-metric-row--${toneKey}${active ? " admin-dash-metric-row--active" : ""}`}
      onClick={() => onSelect(panel)}
      aria-pressed={active}
    >
      <span className="admin-dash-metric-row__label">{label}</span>
      <span className="admin-dash-metric-row__count">{count.toLocaleString("ko-KR")}</span>
    </button>
  );
}

function OrderFlowStrip({
  cards,
  activePanel,
  onSelect,
}: {
  cards: AdminDashboardCard[];
  activePanel: AdminDashboardPanel;
  onSelect: (panel: AdminDashboardPanel) => void;
}) {
  return (
    <div className="admin-dash-flow" role="list" aria-label="주문 처리 흐름">
      {cards.map((item, index) => {
        const active = activePanel === item.panel;
        const toneKey = toneClass(item.tone, item.count, active);
        return (
          <div key={item.panel} className="admin-dash-flow__item">
            {index > 0 ? <span className="admin-dash-flow__arrow" aria-hidden="true" /> : null}
            <button
              type="button"
              role="listitem"
              className={`admin-dash-flow__step admin-dash-flow__step--${toneKey}${active ? " admin-dash-flow__step--active" : ""}`}
              onClick={() => onSelect(item.panel)}
              aria-pressed={active}
              title={item.description}
            >
              <span className="admin-dash-flow__count">{item.count.toLocaleString("ko-KR")}</span>
              <span className="admin-dash-flow__label">{item.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function SettlementCompactPanel({ settlement }: { settlement: AdminSettlementSummary }) {
  const cancelRefund = settlement.canceledAmount + settlement.refundedAmount;
  const amountClass = (value: number, variant: "info" | "warn" = "info") => {
    if (value === 0) return "admin-dash-settle__amount admin-dash-settle__amount--zero";
    return `admin-dash-settle__amount admin-dash-settle__amount--${variant}`;
  };

  return (
    <div className="admin-dash-settle">
      <div className="admin-dash-settle__row">
        <span className="admin-dash-settle__label">오늘 결제금액</span>
        <span className={amountClass(settlement.todayPaidAmount)}>{formatPriceWon(settlement.todayPaidAmount)}</span>
      </div>
      <div className="admin-dash-settle__row">
        <span className="admin-dash-settle__label">이번 달 결제금액</span>
        <span className={amountClass(settlement.monthPaidAmount)}>{formatPriceWon(settlement.monthPaidAmount)}</span>
      </div>
      <div className="admin-dash-settle__row admin-dash-settle__row--split">
        <div>
          <span className="admin-dash-settle__label">취소/환불</span>
          <span className={amountClass(cancelRefund, "warn")}>{formatPriceWon(cancelRefund)}</span>
        </div>
        <div>
          <span className="admin-dash-settle__label">예상 정산금</span>
          <span className={amountClass(settlement.estimatedSettlement)}>{formatPriceWon(settlement.estimatedSettlement)}</span>
        </div>
      </div>
      <p className="admin-dash-settle__notice">토스 결제 연동 후 실제 정산 데이터와 연결됩니다.</p>
    </div>
  );
}

function SummaryBox({
  title,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-dash-summary-box">
      <div className="admin-dash-summary-box__head">
        <h3 className="admin-dash-summary-box__title">{title}</h3>
        {href && hrefLabel ? (
          <Link href={href} className="admin-dash-summary-box__link">
            {hrefLabel}
          </Link>
        ) : null}
      </div>
      <div className="admin-dash-summary-box__body">{children}</div>
    </div>
  );
}

type InquiryTab = "talk" | "order" | "product";

function InquiryReviewPanels({
  consultationCards,
  reviewCards,
  recentConsultations,
  reviewRows,
  productionInquiries,
  batteryTalkThreads,
  activePanel,
  onSelect,
  photoCheckCount,
}: {
  consultationCards: AdminDashboardCard[];
  reviewCards: AdminDashboardCard[];
  recentConsultations: AdminDashboardConsultationPreview[];
  reviewRows: CustomerReviewRecord[];
  productionInquiries: CustomerInquiryRecord[];
  batteryTalkThreads: BatteryTalkThreadSummary[];
  activePanel: AdminDashboardPanel;
  onSelect: (panel: AdminDashboardPanel) => void;
  photoCheckCount: number;
}) {
  const [inquiryTab, setInquiryTab] = useState<InquiryTab>("talk");

  const recentReviews = useMemo(
    () =>
      reviewRows
        .filter((r) => r.status === "active")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [reviewRows],
  );

  const filteredConsultations = useMemo(() => {
    if (inquiryTab === "talk") {
      return recentConsultations.filter((c) => c.kind === "battery_talk");
    }
    if (inquiryTab === "order") {
      return recentConsultations.filter(
        (c) => c.kind === "inquiry" && (c.inquiryType.includes("주문") || c.inquiryType.includes("배송")),
      );
    }
    return recentConsultations.filter(
      (c) => c.kind === "inquiry" && !c.inquiryType.includes("주문") && !c.inquiryType.includes("배송"),
    );
  }, [recentConsultations, inquiryTab]);

  const pendingInquiries =
    findCardCount(consultationCards, "talk_pending") +
    findCardCount(consultationCards, "inquiry_product") +
    findCardCount(consultationCards, "inquiry_order");
  const replyPending = findCardCount(reviewCards, "review_reply");
  const photoReviews = findCardCount(reviewCards, "review_photo");

  const consultTotal = productionInquiries.length + batteryTalkThreads.length;
  const responseRate =
    consultTotal > 0
      ? Math.max(0, Math.min(100, Math.round(((consultTotal - pendingInquiries) / consultTotal) * 100)))
      : null;

  const tabPanels: { id: InquiryTab; label: string; panel: AdminDashboardPanel }[] = [
    { id: "talk", label: "배터리톡", panel: "talk_pending" },
    { id: "order", label: "주문 고객 문의", panel: "inquiry_order" },
    { id: "product", label: "상품 Q&A", panel: "inquiry_product" },
  ];

  return (
    <section className="admin-dash-inquiry-review">
      <div className="admin-dash-inquiry-review__grid">
        <div className="admin-dash-list-panel">
          <div className="admin-dash-list-panel__head">
            <h3 className="admin-dash-list-panel__title">확인 필요한 문의</h3>
            <Link href={`${ADMIN_ROUTES.inquiries}?type=consultation`} className="admin-dash-list-panel__link">
              배터리톡 상담관리
            </Link>
          </div>
          <div className="admin-dash-list-panel__metrics">
            {consultationCards.map((c) => (
              <SummaryMetricRow
                key={c.panel}
                label={c.label}
                count={c.count}
                panel={c.panel}
                activePanel={activePanel}
                onSelect={onSelect}
                tone={c.tone}
              />
            ))}
          </div>
          <div className="admin-dash-list-panel__tabs" role="tablist" aria-label="문의 유형">
            {tabPanels.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={inquiryTab === tab.id}
                className={`admin-dash-list-panel__tab${inquiryTab === tab.id ? " admin-dash-list-panel__tab--active" : ""}`}
                onClick={() => {
                  setInquiryTab(tab.id);
                  onSelect(tab.panel);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {filteredConsultations.length > 0 ? (
            <ul className="admin-dash-list-panel__list">
              {filteredConsultations.map((c) => (
                <li key={`${c.kind}-${c.id}`}>
                  <Link href={c.href} className="admin-dash-list-panel__item">
                    <div className="admin-dash-list-panel__item-main">
                      <span className="admin-dash-list-panel__item-title">{c.summary.slice(0, 48)}</span>
                      <span className="admin-dash-list-panel__item-meta">
                        {c.customerName} · {c.inquiryType}
                      </span>
                    </div>
                    <div className="admin-dash-list-panel__item-side">
                      <span className="admin-dash-list-panel__item-status">{c.status}</span>
                      <time className="admin-dash-list-panel__item-time">
                        {new Date(c.createdAt).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-dash-list-panel__empty">확인할 문의가 없습니다.</p>
          )}
          {photoCheckCount > 0 ? (
            <button
              type="button"
              className="admin-dash-list-panel__footer-link"
              onClick={() => onSelect("inquiry_photo")}
            >
              사진확인 {photoCheckCount}건 · 자세히 확인하기
            </button>
          ) : null}
        </div>

        <div className="admin-dash-list-panel">
          <div className="admin-dash-list-panel__head">
            <h3 className="admin-dash-list-panel__title">확인 필요한 리뷰</h3>
            <Link href={ADMIN_ROUTES.reviews} className="admin-dash-list-panel__link">
              리뷰관리
            </Link>
          </div>
          <div className="admin-dash-list-panel__metrics">
            {reviewCards.map((c) => (
              <SummaryMetricRow
                key={c.panel}
                label={c.label}
                count={c.count}
                panel={c.panel}
                activePanel={activePanel}
                onSelect={onSelect}
                tone={c.tone}
              />
            ))}
          </div>
          {recentReviews.length > 0 ? (
            <ul className="admin-dash-list-panel__list">
              {recentReviews.map((r) => {
                const hasPhoto = reviewHasPhoto(r);
                const photoSrc = reviewPrimaryPhoto(r);
                return (
                <li key={r.id}>
                  <Link
                    href={ADMIN_ROUTES.reviews}
                    className={`admin-dash-list-panel__item admin-dash-list-panel__item--review${hasPhoto ? " admin-dash-list-panel__item--photo" : ""}`}
                    onClick={() => onSelect("review_reply")}
                  >
                    {photoSrc ? (
                      <span className="admin-dash-review-thumb" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoSrc} alt="" loading="lazy" />
                      </span>
                    ) : null}
                    <div className="admin-dash-list-panel__item-main">
                      <span className="admin-dash-list-panel__item-title">
                        {r.batteryCode ?? r.vehicleName ?? "상품"} · {r.rating}점
                        {hasPhoto ? (
                          <span className="admin-dash-review-badge">포토리뷰</span>
                        ) : null}
                      </span>
                      <span className="admin-dash-list-panel__item-meta">{r.content.slice(0, 56)}</span>
                    </div>
                    <div className="admin-dash-list-panel__item-side">
                      <span
                        className={`admin-dash-list-panel__item-status${!r.operatorReply?.trim() ? " admin-dash-list-panel__item-status--warn" : ""}`}
                      >
                        {r.operatorReply?.trim() ? "답글완료" : "답글대기"}
                      </span>
                      <time className="admin-dash-list-panel__item-time">
                        {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </time>
                    </div>
                  </Link>
                </li>
              );
              })}
            </ul>
          ) : (
            <p className="admin-dash-list-panel__empty">최근 리뷰가 없습니다.</p>
          )}
        </div>
      </div>
      <div className="admin-dash-inquiry-review__footer">
        <span>상담 응답률 {responseRate != null ? `${responseRate}%` : "—"}</span>
        <span>미답변 {pendingInquiries.toLocaleString("ko-KR")}건</span>
        <span>답글 대기 {replyPending.toLocaleString("ko-KR")}건</span>
        <span>사진 리뷰 {photoReviews.toLocaleString("ko-KR")}건</span>
      </div>
    </section>
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

  const productNeedCount = useMemo(
    () =>
      productCards
        .filter((c) => c.panel !== "product_selling")
        .reduce((sum, c) => sum + c.count, 0),
    [productCards],
  );

  const productFixCards = useMemo(
    () => productCards.filter((c) => c.panel !== "product_selling"),
    [productCards],
  );

  return (
    <div className="admin-dashboard admin-dashboard--dense">
      <div className="admin-dashboard__top-grid">
        <section className="admin-panel admin-dashboard__sales">
          <div className="admin-panel__header admin-panel__header--compact">
            <div>
              <h2 className="admin-panel__title">판매관리</h2>
              <p className="admin-panel__subtitle">클릭하면 아래 업무 목록이 바뀝니다</p>
            </div>
            <Link href={ADMIN_ROUTES.orders} className="admin-panel__link">
              주문관리
            </Link>
          </div>
          <div className="admin-panel__body-compact">
            <OrderFlowStrip cards={orderFlowCards} activePanel={activePanel} onSelect={setActivePanel} />
          </div>
        </section>

        <aside className="admin-panel admin-dashboard__settlement-compact">
          <div className="admin-panel__header admin-panel__header--compact">
            <h2 className="admin-panel__title">정산관리</h2>
            <Link href={ADMIN_ROUTES.settlement} className="admin-panel__link">
              정산관리
            </Link>
          </div>
          <div className="admin-panel__body-compact">
            <SettlementCompactPanel settlement={settlement} />
          </div>
        </aside>
      </div>

      <div className="admin-dashboard__mid-grid">
        <SummaryBox title="취소·반품·교환" href={ADMIN_ROUTES.commerceClaims} hrefLabel="클레임관리">
          {claimCards
            .filter((c) => c.panel !== "claim_done")
            .map((c) => (
              <SummaryMetricRow
                key={c.panel}
                label={c.label}
                count={c.count}
                panel={c.panel}
                activePanel={activePanel}
                onSelect={setActivePanel}
                tone={c.tone}
              />
            ))}
        </SummaryBox>

        <SummaryBox title="처리 지연">
          <p className="admin-dash-summary-box__hint">24시간 이상 미처리</p>
          {delayCards.map((c) => (
            <SummaryMetricRow
              key={c.panel}
              label={c.label}
              count={c.count}
              panel={c.panel}
              activePanel={activePanel}
              onSelect={setActivePanel}
              tone={c.tone}
            />
          ))}
        </SummaryBox>

        <SummaryBox title="상품관리" href={ADMIN_ROUTES.products} hrefLabel="상품관리">
          <SummaryMetricRow
            label="판매중"
            count={findCardCount(productCards, "product_selling")}
            panel="product_selling"
            activePanel={activePanel}
            onSelect={setActivePanel}
            tone="info"
          />
          <SummaryMetricRow
            label="보완 필요"
            count={productNeedCount}
            panel="product_price"
            activePanel={activePanel}
            onSelect={setActivePanel}
            tone={productNeedCount > 0 ? "warn" : undefined}
          />
          <div className="admin-dash-product-fix">
            {productFixCards.map((c) => (
              <button
                key={c.panel}
                type="button"
                className={`admin-dash-product-fix__chip admin-dash-product-fix__chip--${toneClass(c.tone, c.count, activePanel === c.panel)}${activePanel === c.panel ? " admin-dash-product-fix__chip--active" : ""}`}
                onClick={() => setActivePanel(c.panel)}
                aria-pressed={activePanel === c.panel}
              >
                {c.label.replace(" 누락", "")} {c.count}
              </button>
            ))}
          </div>
        </SummaryBox>

        <SummaryBox title="리뷰 현황" href={ADMIN_ROUTES.reviews} hrefLabel="리뷰관리">
          {reviewCards.map((c) => (
            <SummaryMetricRow
              key={c.panel}
              label={c.label}
              count={c.count}
              panel={c.panel}
              activePanel={activePanel}
              onSelect={setActivePanel}
              tone={c.tone}
            />
          ))}
        </SummaryBox>
      </div>

      <InquiryReviewPanels
        consultationCards={consultationCards}
        reviewCards={reviewCards}
        recentConsultations={recentConsultations}
        reviewRows={reviewRows}
        productionInquiries={productionInquiries}
        batteryTalkThreads={batteryTalkThreads}
        activePanel={activePanel}
        onSelect={setActivePanel}
        photoCheckCount={photoCheckCount}
      />

      <section className="admin-panel admin-dashboard__work-list">
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
                <td className="max-w-xs truncate text-sm">
                  {r.content}
                  {reviewHasPhoto(r) ? (
                    <span className="admin-dash-review-badge admin-dash-review-badge--inline">포토</span>
                  ) : null}
                </td>
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
