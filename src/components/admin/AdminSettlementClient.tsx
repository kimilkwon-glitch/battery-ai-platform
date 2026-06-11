"use client";

import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminSettlementSummary } from "@/lib/admin/data/settlement-summary";

type Props = {
  summary: AdminSettlementSummary;
};

export function AdminSettlementClient({ summary }: Props) {
  return (
    <div className="admin-settlement space-y-4">
      <div className="admin-settlement__notice admin-panel">
        <p className="admin-settlement__notice-text">
          토스 결제 연동 후 실제 정산 데이터와 연결됩니다.
        </p>
        <p className="admin-settlement__notice-sub">
          현재는 주문/결제 기록 기준으로 확인 가능한 금액만 표시합니다.
        </p>
      </div>

      {!summary.dbReady ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-600">
          주문 DB가 연결되지 않았습니다. DATABASE_URL 설정 후 다시 확인하세요.
        </p>
      ) : (
        <>
          <div className="admin-dashboard-section__grid admin-dashboard-section__grid--5">
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
              value={formatPriceWon(summary.canceledAmount + summary.refundedAmount)}
              tone="warn"
              numericAmount={summary.canceledAmount + summary.refundedAmount}
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

          <div className="admin-dashboard-section__grid admin-dashboard-section__grid--4">
            <PlaceholderCard label="결제수단별 내역" note="토스 연동 후 표시" />
            <PlaceholderCard label="부가세 자료" note="토스 연동 후 표시" />
            <PlaceholderCard label="엑셀 다운로드" note="연동 후 제공" />
            <StatCard
              label="주문 건수(실제)"
              value={summary.orderCount.toLocaleString("ko-KR")}
              variant="metric"
            />
          </div>

          <section className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">정산 안내</h2>
              <Link href={ADMIN_ROUTES.orders} className="admin-panel__link">
                주문관리에서 확인
              </Link>
            </div>
            <div className="space-y-2 p-4 text-sm font-medium text-slate-600">
              <p>· 결제 완료 금액: 결제 완료 상태이며 취소·환불되지 않은 주문 합계</p>
              <p>· 예상 정산금: 결제 완료 − 환불 (토스 수수료·실정산은 연동 후 반영)</p>
              <p>· 클레임·부분환불 상세는 클레임관리에서 확인하세요.</p>
            </div>
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
  const toneClass =
    isZero
      ? "admin-stat-card__value--zero"
      : tone === "warn"
        ? "admin-stat-card__value--warning"
        : tone === "primary"
          ? "admin-stat-card__value--primary"
          : tone === "info"
            ? "admin-stat-card__value--info"
            : "admin-stat-card__value--default";

  return (
    <div className={variant === "metric" ? "admin-stat-card admin-stat-card--metric" : "admin-stat-card"}>
      <p className="admin-stat-card__label">{label}</p>
      <p className={`admin-stat-card__value ${toneClass}`}>{value}</p>
    </div>
  );
}

function PlaceholderCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="admin-stat-card admin-stat-card--placeholder">
      <p className="admin-stat-card__label">{label}</p>
      <p className="admin-settlement__status">연동 예정</p>
      <p className="admin-stat-card__desc">{note}</p>
    </div>
  );
}
