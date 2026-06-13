"use client";

import { useMemo, useState } from "react";
import { AdminOrderDetailModal, AdminOrderNumberButton } from "@/components/admin/AdminOrderDetailModal";
import type { AdminSettlementRow, AdminSettlementSummary } from "@/lib/admin/data/settlement-summary";
import {
  matchesSettlementBucket,
  SETTLEMENT_BUCKET_META,
  type SettlementKpiBucket,
} from "@/lib/admin/settlement-selectors";
import { formatPriceWon } from "@/lib/pricing/order-price";

type Props = {
  summary: AdminSettlementSummary;
};

type DetailFilters = {
  q: string;
  from: string;
  to: string;
  paymentStatus: string;
  orderStatus: string;
  refundKind: string;
};

const DEFAULT_FILTERS: DetailFilters = {
  q: "",
  from: "",
  to: "",
  paymentStatus: "all",
  orderStatus: "all",
  refundKind: "all",
};

const KPI_ITEMS: {
  id: SettlementKpiBucket;
  tone: "info" | "warn" | "primary" | "default" | "metric";
  getValue: (s: AdminSettlementSummary) => string;
  getNumeric: (s: AdminSettlementSummary) => number;
}[] = [
  {
    id: "today_paid",
    tone: "info",
    getValue: (s) => formatPriceWon(s.todayPaidAmount),
    getNumeric: (s) => s.todayPaidAmount,
  },
  {
    id: "month_paid",
    tone: "info",
    getValue: (s) => formatPriceWon(s.monthPaidAmount),
    getNumeric: (s) => s.monthPaidAmount,
  },
  {
    id: "cancel_refund",
    tone: "warn",
    getValue: (s) => formatPriceWon(s.canceledAmount + s.refundedAmount),
    getNumeric: (s) => s.canceledAmount + s.refundedAmount,
  },
  {
    id: "estimated_settlement",
    tone: "primary",
    getValue: (s) => formatPriceWon(s.estimatedSettlement),
    getNumeric: (s) => s.estimatedSettlement,
  },
  {
    id: "paid_all",
    tone: "default",
    getValue: (s) => formatPriceWon(s.paidAmount),
    getNumeric: (s) => s.paidAmount,
  },
  {
    id: "order_count",
    tone: "metric",
    getValue: (s) => s.orderCount.toLocaleString("ko-KR"),
    getNumeric: (s) => s.orderCount,
  },
];

export function AdminSettlementClient({ summary }: Props) {
  const [bucket, setBucket] = useState<SettlementKpiBucket>("estimated_settlement");
  const [filters, setFilters] = useState<DetailFilters>(DEFAULT_FILTERS);
  const [orderModalId, setOrderModalId] = useState<string | null>(null);

  const bucketMeta = SETTLEMENT_BUCKET_META[bucket];
  const cancelRefund = summary.canceledAmount + summary.refundedAmount;

  const bucketRows = useMemo(
    () =>
      summary.items.filter((row) =>
        matchesSettlementBucket(toSettlementInput(row), bucket),
      ),
    [summary.items, bucket],
  );

  const filteredRows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return bucketRows.filter((row) => {
      if (filters.from) {
        const d = new Date(row.paymentAt);
        if (d < new Date(`${filters.from}T00:00:00`)) return false;
      }
      if (filters.to) {
        const d = new Date(row.paymentAt);
        if (d > new Date(`${filters.to}T23:59:59`)) return false;
      }
      if (filters.paymentStatus !== "all" && row.paymentStatus !== filters.paymentStatus) return false;
      if (filters.orderStatus !== "all" && row.orderStatus !== filters.orderStatus) return false;
      if (filters.refundKind !== "all" && row.refundKind !== filters.refundKind) return false;
      if (!q) return true;
      return (
        row.orderNumber.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.batteryCode.toLowerCase().includes(q)
      );
    });
  }, [bucketRows, filters]);

  const hasDetailFilters =
    filters.q.trim() !== "" ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.paymentStatus !== "all" ||
    filters.orderStatus !== "all" ||
    filters.refundKind !== "all";

  const detailSum = useMemo(() => {
    if (!hasDetailFilters) {
      if (bucket === "estimated_settlement") return summary.estimatedSettlement;
      if (bucket === "cancel_refund") return summary.canceledAmount + summary.refundedAmount;
      if (bucket === "today_paid") return summary.todayPaidAmount;
      if (bucket === "month_paid") return summary.monthPaidAmount;
      if (bucket === "paid_all") return summary.paidAmount;
      if (bucket === "order_count") return summary.orderCount;
    }
    if (bucket === "estimated_settlement") {
      return filteredRows.reduce((sum, row) => sum + row.estimatedSettlementAmount, 0);
    }
    if (bucket === "cancel_refund") {
      return filteredRows.reduce((sum, row) => sum + row.cancelRefundAmount, 0);
    }
    if (bucket === "order_count") return filteredRows.length;
    return filteredRows.reduce((sum, row) => sum + row.finalAmount, 0);
  }, [bucket, filteredRows, hasDetailFilters, summary]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="admin-settlement">
      <div className="admin-workspace-notice admin-workspace-notice--settlement admin-settlement__notice">
        <p className="admin-workspace-notice__title">정산 데이터 안내</p>
        <p className="admin-workspace-notice__text">
          현재 금액은 주문·결제 기록을 기준으로 계산한 예상값입니다. 실제 Toss 정산 연동 후 실제 정산
          내역과 지급 예정 금액을 확인할 수 있습니다.
        </p>
      </div>

      {!summary.dbReady ? (
        <p className="admin-workspace-empty">주문 DB가 연결되지 않았습니다. DATABASE_URL 설정 후 다시 확인하세요.</p>
      ) : (
        <>
          <div className="admin-kpi-grid admin-kpi-grid--5 admin-settlement__kpi-grid">
            {KPI_ITEMS.slice(0, 5).map((item) => (
              <KpiCard
                key={item.id}
                label={SETTLEMENT_BUCKET_META[item.id].label}
                value={item.getValue(summary)}
                tone={item.tone}
                numericAmount={item.getNumeric(summary)}
                active={bucket === item.id}
                onClick={() => setBucket(item.id)}
              />
            ))}
          </div>

          <div className="admin-kpi-grid admin-kpi-grid--4 admin-settlement__kpi-grid">
            <div className="admin-kpi-card admin-kpi-card--placeholder">
              <span className="admin-kpi-card__label">결제수단별 내역</span>
              <span className="admin-kpi-card__placeholder">연동 예정</span>
              <span className="admin-kpi-card__note">토스 연동 후 표시</span>
            </div>
            <div className="admin-kpi-card admin-kpi-card--placeholder">
              <span className="admin-kpi-card__label">부가세 자료</span>
              <span className="admin-kpi-card__placeholder">연동 예정</span>
              <span className="admin-kpi-card__note">토스 연동 후 표시</span>
            </div>
            <div className="admin-kpi-card admin-kpi-card--placeholder">
              <span className="admin-kpi-card__label">엑셀 다운로드</span>
              <span className="admin-kpi-card__placeholder">연동 예정</span>
              <span className="admin-kpi-card__note">연동 후 제공</span>
            </div>
            <KpiCard
              label={SETTLEMENT_BUCKET_META.order_count.label}
              value={summary.orderCount.toLocaleString("ko-KR")}
              tone="metric"
              active={bucket === "order_count"}
              onClick={() => setBucket("order_count")}
            />
          </div>

          <section className="admin-panel admin-workspace-panel admin-settlement-detail">
            <div className="admin-panel__header">
              <div>
                <h2 className="admin-panel__title">정산 상세 내역</h2>
                <p className="admin-settlement-detail__summary">
                  <strong>{bucketMeta.label}</strong>
                  <span aria-hidden> · </span>
                  {filteredRows.length}건
                  <span aria-hidden> · </span>
                  {bucket === "order_count"
                    ? `${detailSum.toLocaleString("ko-KR")}건`
                    : formatPriceWon(detailSum)}
                  <span aria-hidden> · </span>
                  {bucketMeta.periodLabel}
                </p>
                <p className="admin-settlement-detail__desc">기준: {bucketMeta.description}</p>
              </div>
            </div>

            <div className="admin-filter-bar admin-settlement-detail__filters">
              <div className="admin-filter-bar__fields">
                <div className="admin-filter-bar__field admin-filter-bar__field--wide">
                  <label className="admin-filter-bar__label">검색</label>
                  <input
                    type="search"
                    value={filters.q}
                    onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                    placeholder="주문번호 / 고객명 / 상품명 / 규격"
                    className="admin-filter-bar__input"
                  />
                </div>
                <div className="admin-filter-bar__field">
                  <label className="admin-filter-bar__label">기간 시작</label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                    className="admin-filter-bar__input"
                  />
                </div>
                <div className="admin-filter-bar__field">
                  <label className="admin-filter-bar__label">기간 종료</label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                    className="admin-filter-bar__input"
                  />
                </div>
                <div className="admin-filter-bar__field">
                  <label className="admin-filter-bar__label">결제상태</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
                    className="admin-filter-bar__input"
                  >
                    <option value="all">전체</option>
                    <option value="completed">결제완료</option>
                    <option value="canceled">취소</option>
                    <option value="refunded">환불</option>
                    <option value="pending">대기</option>
                  </select>
                </div>
                <div className="admin-filter-bar__field">
                  <label className="admin-filter-bar__label">주문상태</label>
                  <select
                    value={filters.orderStatus}
                    onChange={(e) => setFilters((f) => ({ ...f, orderStatus: e.target.value }))}
                    className="admin-filter-bar__input"
                  >
                    <option value="all">전체</option>
                    <option value="order_confirmed">주문확인</option>
                    <option value="preparing">준비중</option>
                    <option value="shipping">배송중</option>
                    <option value="completed">완료</option>
                    <option value="canceled">취소</option>
                    <option value="refunded">환불</option>
                  </select>
                </div>
                {bucket === "cancel_refund" ? (
                  <div className="admin-filter-bar__field">
                    <label className="admin-filter-bar__label">환불상태</label>
                    <select
                      value={filters.refundKind}
                      onChange={(e) => setFilters((f) => ({ ...f, refundKind: e.target.value }))}
                      className="admin-filter-bar__input"
                    >
                      <option value="all">전체</option>
                      <option value="canceled">전체취소</option>
                      <option value="refunded">환불</option>
                    </select>
                  </div>
                ) : null}
              </div>
              <div className="admin-filter-bar__actions">
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--md" onClick={resetFilters}>
                  초기화
                </button>
              </div>
            </div>

            <div className="admin-workspace-table-wrap">
              {filteredRows.length === 0 ? (
                <div className="admin-workspace-empty admin-settlement-detail__empty">
                  해당 기준에 포함되는 내역이 없습니다.
                </div>
              ) : (
                <table className="admin-table admin-settlement-detail__table">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>결제일</th>
                      <th>고객</th>
                      <th>상품/규격</th>
                      <th>수령방식</th>
                      <th>결제금액</th>
                      <th>취소/환불</th>
                      <th>예상 정산금</th>
                      <th>결제상태</th>
                      <th>주문상태</th>
                      <th>상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <SettlementRow key={row.id} row={row} onOpen={() => setOrderModalId(row.id)} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <ul className="admin-settlement-guide">
            <li>결제 완료 금액: 결제 완료 상태이며 취소·환불되지 않은 주문 합계 (결제일 기준)</li>
            <li>예상 정산금: 결제 완료 − 환불 (토스 수수료·실정산은 연동 후 반영)</li>
            <li>취소/환불 합계: {formatPriceWon(cancelRefund)} — 클레임·부분환불 상세는 클레임관리에서 확인</li>
          </ul>
        </>
      )}

      <AdminOrderDetailModal orderId={orderModalId} onClose={() => setOrderModalId(null)} />
    </div>
  );
}

function SettlementRow({ row, onOpen }: { row: AdminSettlementRow; onOpen: () => void }) {
  return (
    <tr>
      <td>
        <AdminOrderNumberButton orderId={row.id} orderNumber={row.orderNumber} onOpen={() => onOpen()} />
      </td>
      <td>{formatPaymentDate(row.paymentAt)}</td>
      <td className="admin-table__customer-name">{row.customerName}</td>
      <td>
        <span className="admin-table__product-name">{row.productName}</span>
        <span className="admin-table__meta">{row.batteryCode}</span>
      </td>
      <td>{row.fulfillmentLabel}</td>
      <td>{formatPriceWon(row.finalAmount)}</td>
      <td>{row.cancelRefundAmount > 0 ? formatPriceWon(row.cancelRefundAmount) : "—"}</td>
      <td>{row.estimatedSettlementAmount > 0 ? formatPriceWon(row.estimatedSettlementAmount) : "—"}</td>
      <td>{row.paymentStatusLabel}</td>
      <td>{row.orderStatusLabel}</td>
      <td>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onOpen}>
          상세
        </button>
      </td>
    </tr>
  );
}

function KpiCard({
  label,
  value,
  tone,
  numericAmount,
  active,
  onClick,
}: {
  label: string;
  value: string;
  tone: "info" | "warn" | "primary" | "default" | "metric";
  numericAmount?: number;
  active: boolean;
  onClick: () => void;
}) {
  const isZero = tone !== "metric" && numericAmount === 0;
  const toneKey =
    isZero ? "muted" : tone === "warn" ? "warn" : tone === "primary" ? "primary" : tone === "info" ? "info" : tone === "metric" ? "default" : "default";

  return (
    <button
      type="button"
      className={`admin-kpi-card admin-kpi-card--${toneKey}${tone === "metric" ? " admin-kpi-card--metric" : ""}${active ? " admin-kpi-card--active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="admin-kpi-card__label">{label}</span>
      <span className={`admin-kpi-card__value${isZero ? " admin-kpi-card__value--zero" : ""}`}>{value}</span>
    </button>
  );
}

function formatPaymentDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function toSettlementInput(row: AdminSettlementRow) {
  return {
    id: row.id,
    channel: "commerce" as const,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt,
    updatedAt: row.createdAt,
    customerName: row.customerName,
    customerPhone: "",
    customerType: "guest" as const,
    orderTypeLabel: "자사몰",
    productName: row.productName,
    batteryCode: row.batteryCode,
    fulfillmentType: "",
    fulfillmentLabel: row.fulfillmentLabel,
    finalAmount: row.finalAmount,
    paymentStatus: row.paymentStatus,
    paymentStatusLabel: row.paymentStatusLabel,
    orderStatus: row.orderStatus,
    orderStatusLabel: row.orderStatusLabel,
    isTestOrder: false,
    paymentAt: row.paymentAt,
  };
}
