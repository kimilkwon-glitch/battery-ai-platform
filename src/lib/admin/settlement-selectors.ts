import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";

export type SettlementKpiBucket =
  | "today_paid"
  | "month_paid"
  | "cancel_refund"
  | "estimated_settlement"
  | "paid_all"
  | "order_count";

export type SettlementRowInput = UnifiedAdminOrderRow & {
  paymentAt: string;
};

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function isSettlementPaid(row: SettlementRowInput): boolean {
  return row.paymentStatus === "completed" && !["canceled", "refunded"].includes(row.orderStatus);
}

export function isCanceledRow(row: SettlementRowInput): boolean {
  return row.paymentStatus === "canceled" || row.orderStatus === "canceled";
}

export function isRefundedRow(row: SettlementRowInput): boolean {
  return row.paymentStatus === "refunded" || row.orderStatus === "refunded";
}

export function cancelRefundAmount(row: SettlementRowInput): number {
  if (isCanceledRow(row) || isRefundedRow(row)) return row.finalAmount ?? 0;
  return 0;
}

export function estimatedSettlementAmount(row: SettlementRowInput): number {
  if (!isSettlementPaid(row)) return 0;
  return row.finalAmount ?? 0;
}

export function matchesSettlementBucket(
  row: SettlementRowInput,
  bucket: SettlementKpiBucket,
  now = new Date(),
): boolean {
  const paymentAt = new Date(row.paymentAt);
  switch (bucket) {
    case "today_paid":
      return isSettlementPaid(row) && paymentAt >= startOfDay(now);
    case "month_paid":
      return isSettlementPaid(row) && paymentAt >= startOfMonth(now);
    case "cancel_refund":
      return isCanceledRow(row) || isRefundedRow(row);
    case "estimated_settlement":
    case "paid_all":
      return isSettlementPaid(row);
    case "order_count":
      return true;
    default:
      return false;
  }
}

export function sumSettlementBucketAmount(
  rows: SettlementRowInput[],
  bucket: SettlementKpiBucket,
  now = new Date(),
): number {
  const matched = rows.filter((row) => matchesSettlementBucket(row, bucket, now));
  switch (bucket) {
    case "cancel_refund":
      return matched.reduce((sum, row) => sum + cancelRefundAmount(row), 0);
    case "estimated_settlement":
      return matched.reduce((sum, row) => sum + estimatedSettlementAmount(row), 0) -
        rows.filter(isRefundedRow).reduce((sum, row) => sum + cancelRefundAmount(row), 0);
    case "order_count":
      return matched.length;
    default:
      return matched.reduce((sum, row) => sum + (row.finalAmount ?? 0), 0);
  }
}

export function countSettlementBucket(
  rows: SettlementRowInput[],
  bucket: SettlementKpiBucket,
  now = new Date(),
): number {
  return rows.filter((row) => matchesSettlementBucket(row, bucket, now)).length;
}

export const SETTLEMENT_BUCKET_META: Record<
  SettlementKpiBucket,
  { label: string; description: string; periodLabel: string }
> = {
  today_paid: {
    label: "오늘 결제금액",
    description: "결제완료 · 취소/환불 제외 · 결제일 기준",
    periodLabel: "오늘",
  },
  month_paid: {
    label: "이번 달 결제금액",
    description: "결제완료 · 취소/환불 제외 · 결제일 기준",
    periodLabel: "이번 달",
  },
  cancel_refund: {
    label: "취소/환불 금액",
    description: "취소·환불 상태 주문/클레임 금액 합계",
    periodLabel: "전체",
  },
  estimated_settlement: {
    label: "예상 정산금",
    description: "결제완료 − 환불 (토스 실정산 연동 전 예상값)",
    periodLabel: "전체",
  },
  paid_all: {
    label: "누적 결제 완료",
    description: "결제완료 · 취소/환불 제외",
    periodLabel: "전체",
  },
  order_count: {
    label: "주문 건수(실제)",
    description: "운영 주문 전체 (최근 조회 범위)",
    periodLabel: "전체",
  },
};
