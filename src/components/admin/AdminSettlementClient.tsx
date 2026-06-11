"use client";

import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminSettlementSummary } from "@/lib/admin/data/settlement-summary";

type Props = {
  summary: AdminSettlementSummary;
};

export function AdminSettlementClient({ summary }: Props) {
  const cancelRefund = summary.canceledAmount + summary.refundedAmount;

  return (
    <div className="admin-settlement">
      <div className="admin-workspace-notice admin-workspace-notice--settlement">
        <p className="admin-workspace-notice__title">토스 정산 연동 후 실제 정산 데이터가 반영됩니다.</p>
        <p className="admin-workspace-notice__text">현재는 주문·결제 기록 기준 확인 가능 금액만 표시합니다.</p>
      </div>

      {!summary.dbReady ? (
        <p className="admin-workspace-empty">주문 DB가 연결되지 않았습니다. DATABASE_URL 설정 후 다시 확인하세요.</p>
      ) : (
        <>
          <div className="admin-kpi-grid admin-kpi-grid--5">
            <StatCard
              label="오늘 결제금액"
              value={formatPriceWon(summary.todayPaidAmount)}
              tone="info"
              numericAmount={summary.todayPaidAmount}
            />
            <StatCard
              label="이번 달 결제금액"
              value={formatPriceWon(summary.monthPaidAmount)}
              tone="info"
              numericAmount={summary.monthPaidAmount}
            />
            <StatCard
              label="취소/환불 금액"
              value={formatPriceWon(cancelRefund)}
              tone="warn"
              numericAmount={cancelRefund}
            />
            <StatCard
              label="예상 정산금"
              value={formatPriceWon(summary.estimatedSettlement)}
              tone="primary"
              numericAmount={summary.estimatedSettlement}
            />
            <StatCard
              label="누적 결제 완료"
              value={formatPriceWon(summary.paidAmount)}
              tone="default"
              numericAmount={summary.paidAmount}
            />
          </div>

          <div className="admin-kpi-grid admin-kpi-grid--4">
            <PlaceholderCard label="결제수단별 내역" note="토스 연동 후 표시" />
            <PlaceholderCard label="부가세 자료" note="토스 연동 후 표시" />
            <PlaceholderCard label="엑셀 다운로드" note="연동 후 제공" />
            <StatCard
              label="주문 건수(실제)"
              value={summary.orderCount.toLocaleString("ko-KR")}
              variant="metric"
            />
          </div>

          <section className="admin-panel admin-workspace-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">정산 안내</h2>
              <Link href={ADMIN_ROUTES.orders} className="admin-panel__link">
                주문관리에서 확인
              </Link>
            </div>
            <ul className="admin-settlement-guide">
              <li>결제 완료 금액: 결제 완료 상태이며 취소·환불되지 않은 주문 합계</li>
              <li>예상 정산금: 결제 완료 − 환불 (토스 수수료·실정산은 연동 후 반영)</li>
              <li>클레임·부분환불 상세는 클레임관리에서 확인하세요.</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
  variant = "money",
  numericAmount,
}: {
  label: string;
  value: string;
  tone?: "default" | "info" | "warn" | "primary";
  variant?: "money" | "metric";
  numericAmount?: number;
}) {
  const isZero = variant === "money" && numericAmount === 0;
  const toneKey =
    isZero ? "muted" : tone === "warn" ? "warn" : tone === "primary" ? "primary" : tone === "info" ? "info" : "default";

  return (
    <div className={`admin-kpi-card admin-kpi-card--${toneKey}${variant === "metric" ? " admin-kpi-card--metric" : ""}`}>
      <span className="admin-kpi-card__label">{label}</span>
      <span className={`admin-kpi-card__value${isZero ? " admin-kpi-card__value--zero" : ""}`}>{value}</span>
    </div>
  );
}

function PlaceholderCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="admin-kpi-card admin-kpi-card--placeholder">
      <span className="admin-kpi-card__label">{label}</span>
      <span className="admin-kpi-card__placeholder">연동 예정</span>
      <span className="admin-kpi-card__note">{note}</span>
    </div>
  );
}
