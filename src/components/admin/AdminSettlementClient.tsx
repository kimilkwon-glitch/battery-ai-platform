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
    <div className="space-y-5">
      <div className="admin-panel border-amber-100 bg-amber-50/60 p-4">
        <p className="text-sm font-semibold text-amber-900">
          토스 결제 연동 후 실제 정산 데이터와 연결됩니다. 현재는 주문·결제 데이터 기준 요약만 표시합니다.
        </p>
      </div>

      {!summary.dbReady ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-600">
          주문 DB가 연결되지 않았습니다. DATABASE_URL 설정 후 다시 확인하세요.
        </p>
      ) : (
        <>
          <div className="admin-dashboard-section__grid admin-dashboard-section__grid--5">
            <StatCard label="오늘 결제금액" value={formatPriceWon(summary.todayPaidAmount)} tone="info" />
            <StatCard label="이번 달 결제금액" value={formatPriceWon(summary.monthPaidAmount)} tone="info" />
            <StatCard label="누적 결제 완료" value={formatPriceWon(summary.paidAmount)} tone="default" />
            <StatCard label="취소 금액" value={formatPriceWon(summary.canceledAmount)} tone="warn" />
            <StatCard label="환불 금액" value={formatPriceWon(summary.refundedAmount)} tone="warn" />
          </div>
          <div className="admin-dashboard-section__grid">
            <StatCard label="주문 건수(실제)" value={summary.orderCount.toLocaleString("ko-KR")} />
            <StatCard
              label="예상 정산금"
              value={formatPriceWon(summary.estimatedSettlement)}
              tone="primary"
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
}: {
  label: string;
  value: string;
  tone?: "default" | "info" | "warn" | "primary";
}) {
  const toneClass =
    tone === "info"
      ? "admin-stat-card__value--info"
      : tone === "warn"
        ? "admin-stat-card__value--warning"
        : tone === "primary"
          ? "admin-stat-card__value--info"
          : "admin-stat-card__value--default";
  return (
    <div className="admin-stat-card">
      <p className="admin-stat-card__label">{label}</p>
      <p className={`admin-stat-card__value ${toneClass}`}>{value}</p>
    </div>
  );
}
