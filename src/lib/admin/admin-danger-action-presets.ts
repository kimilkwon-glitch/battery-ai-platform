import type { AdminDangerActionConfig } from "@/components/admin/AdminDangerActionDialog";
import { paymentStatusLabel, orderStatusLabel } from "@/lib/orders/commerce-order-mine";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { ClaimType } from "@/types/commerce-claim";
import { CLAIM_TYPE_LABELS } from "@/types/commerce-claim";

export type OrderDangerSummary = {
  orderNumber: string;
  customerName: string;
  productName: string;
  batteryCode?: string;
  finalAmount?: number | null;
  orderStatusLabel: string;
  paymentStatusLabel: string;
  claimStatusLabel?: string;
};

function orderRows(o: OrderDangerSummary): AdminDangerActionConfig["summaryRows"] {
  return [
    { label: "주문번호", value: o.orderNumber },
    { label: "고객", value: o.customerName },
    { label: "상품", value: o.batteryCode ? `${o.productName} · ${o.batteryCode}` : o.productName },
    {
      label: "결제금액",
      value: o.finalAmount != null ? `${o.finalAmount.toLocaleString("ko-KR")}원` : "—",
    },
    { label: "주문상태", value: o.orderStatusLabel },
    { label: "결제상태", value: o.paymentStatusLabel },
    ...(o.claimStatusLabel ? [{ label: "클레임상태", value: o.claimStatusLabel }] : []),
  ];
}

const PG_CANCEL_WARNING =
  "이 작업은 주문 내부 상태만 취소로 변경합니다. 실제 Toss 결제 취소·환불은 처리되지 않습니다.";
const PG_REFUND_WARNING =
  "내부 상태만 환불완료로 변경되며 실제 결제금액은 환불되지 않습니다. PG 환불은 Toss 관리자 또는 API 연동 후 별도 처리해야 합니다.";
const SWEETTRACKER_WARNING =
  "스윗트래커 배송조회 API가 호출됩니다. 조회 건수가 사용됩니다. 테스트 주문은 서버에서 자동 skip됩니다.";

export function commerceOrderToDangerSummary(order: CommerceOrderRecord): OrderDangerSummary {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    productName: order.productName,
    batteryCode: order.batteryCode,
    finalAmount: order.finalAmount,
    orderStatusLabel: orderStatusLabel(order.orderStatus),
    paymentStatusLabel: paymentStatusLabel(order.paymentStatus),
  };
}

export function unifiedRowToDangerSummary(row: UnifiedAdminOrderRow): OrderDangerSummary {
  return {
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    productName: row.productName,
    batteryCode: row.batteryCode,
    finalAmount: row.finalAmount,
    orderStatusLabel: row.orderStatusLabel,
    paymentStatusLabel: row.paymentStatusLabel,
  };
}

export function dangerConfigOrderCancel(o: OrderDangerSummary): AdminDangerActionConfig {
  return {
    actionKey: "order_cancel",
    title: "주문 취소",
    severity: "danger",
    summaryRows: orderRows(o),
    warnings: [PG_CANCEL_WARNING, "고객 알림톡이 발송될 수 있습니다. (테스트 주문은 skip)"],
    confirmLabel: "주문 취소 확정",
    requireReason: true,
    reasonLabel: "취소 사유",
    reversible: false,
  };
}

export function dangerConfigInternalRefund(o: OrderDangerSummary): AdminDangerActionConfig {
  return {
    actionKey: "internal_refund",
    title: "내부 환불완료 처리",
    severity: "danger",
    summaryRows: orderRows(o),
    warnings: [PG_REFUND_WARNING, "정산·매출 집계에 반영될 수 있습니다. (테스트 주문은 제외)"],
    confirmLabel: "내부 환불완료 처리",
    requireReason: true,
    reasonLabel: "처리 사유",
    reversible: false,
  };
}

export function dangerConfigClaimStatus(
  o: OrderDangerSummary,
  actionLabel: string,
  claimType: string,
): AdminDangerActionConfig {
  const isRefund = actionLabel.includes("환불");
  const isReject = actionLabel.includes("거절");
  return {
    actionKey: `claim_${actionLabel}`,
    title: actionLabel,
    severity: isReject ? "danger" : isRefund ? "danger" : "warning",
    summaryRows: orderRows(o),
    warnings: [
      `${claimType} 클레임 상태가 변경됩니다.`,
      isRefund ? PG_REFUND_WARNING : isReject ? "거절 사유가 고객 안내에 사용될 수 있습니다." : PG_CANCEL_WARNING,
    ],
    confirmLabel: `${actionLabel} 확정`,
    requireReason: isReject || isRefund,
    reasonLabel: isReject ? "거절 사유" : "처리 사유",
    reversible: false,
  };
}

export function dangerConfigClaimApproved(
  o: OrderDangerSummary,
  claimType: ClaimType,
): AdminDangerActionConfig {
  const typeLabel = CLAIM_TYPE_LABELS[claimType];
  const title =
    claimType === "RETURN"
      ? "반품 승인"
      : claimType === "EXCHANGE"
        ? "교환 승인"
        : claimType === "CANCEL"
          ? "취소 승인"
          : `${typeLabel} 승인`;
  return {
    actionKey: `claim_approve_${claimType}`,
    title,
    severity: "warning",
    summaryRows: orderRows(o),
    warnings: [
      `${typeLabel} 클레임이 승인됩니다.`,
      claimType === "CANCEL" ? PG_CANCEL_WARNING : "회수·환불 절차가 이어질 수 있습니다.",
      "고객 알림톡이 발송될 수 있습니다. (테스트 주문은 skip)",
    ],
    confirmLabel: `${title} 확정`,
    requireReason: true,
    reasonLabel: "처리 사유",
    reversible: false,
  };
}

export function dangerConfigClaimRejected(o: OrderDangerSummary): AdminDangerActionConfig {
  return {
    actionKey: "claim_reject",
    title: "클레임 거절",
    severity: "danger",
    summaryRows: orderRows(o),
    warnings: [
      "클레임이 거절 처리됩니다.",
      "거절 사유는 고객 안내에 사용될 수 있습니다.",
    ],
    confirmLabel: "클레임 거절 확정",
    requireReason: true,
    reasonLabel: "거절 사유",
    reversible: false,
  };
}

export function dangerConfigClaimRefunded(
  o: OrderDangerSummary,
  estimatedRefund?: number | null,
): AdminDangerActionConfig {
  const rows = orderRows(o);
  if (estimatedRefund != null) {
    rows.push({ label: "환불 예상금액", value: `${estimatedRefund.toLocaleString("ko-KR")}원` });
  }
  return {
    actionKey: "claim_refunded",
    title: "내부 환불완료 처리",
    severity: "danger",
    summaryRows: rows,
    warnings: [PG_REFUND_WARNING, "정산·매출 집계에 반영될 수 있습니다. (테스트 주문은 제외)"],
    confirmLabel: "내부 환불완료 처리",
    requireReason: true,
    reasonLabel: "처리 사유",
    reversible: false,
  };
}

export function dangerConfigAdminStatusRollback(o: OrderDangerSummary, label: string): AdminDangerActionConfig {
  return {
    actionKey: "status_rollback",
    title: label,
    severity: "warning",
    summaryRows: orderRows(o),
    warnings: [
      "발송완료 이후 상태를 관리자 보정으로 변경합니다.",
      "배송·정산 데이터와 불일치할 수 있습니다.",
    ],
    confirmLabel: `${label} 확정`,
    requireReason: true,
    reasonLabel: "보정 사유",
    reversible: false,
  };
}

export function dangerConfigTrackingChange(o: OrderDangerSummary): AdminDangerActionConfig {
  return {
    actionKey: "tracking_change",
    title: "송장번호 변경 · 발송처리",
    severity: "warning",
    summaryRows: orderRows(o),
    warnings: [
      "저장된 송장번호가 변경되고 주문상태가 배송중으로 변경될 수 있습니다.",
      "고객 발송 알림톡이 발송될 수 있습니다. (테스트 주문은 skip)",
    ],
    confirmLabel: "저장 / 발송처리 확정",
    requireReason: false,
    reversible: false,
  };
}

export function dangerConfigDeliverySync(count: number): AdminDangerActionConfig {
  return {
    actionKey: "delivery_sync",
    title: "배송조회 후 상태 반영",
    severity: "caution",
    summaryRows: [{ label: "대상", value: `${count}건` }],
    warnings: [SWEETTRACKER_WARNING],
    confirmLabel: "조회 후 상태 반영",
    requireReason: false,
    reversible: false,
  };
}

export function dangerConfigBulkShip(count: number): AdminDangerActionConfig {
  return {
    actionKey: "bulk_ship",
    title: "발송처리",
    severity: "warning",
    summaryRows: [{ label: "대상", value: `${count}건` }],
    warnings: [
      "선택한 주문의 내부 상태가 발송처리됩니다.",
      "고객 발송 알림톡이 발송될 수 있습니다. (테스트 주문은 skip)",
    ],
    confirmLabel: "발송처리 확정",
    requireReason: false,
    reversible: false,
  };
}

export function dangerConfigReviewReplyDelete(): AdminDangerActionConfig {
  return {
    actionKey: "review_reply_delete",
    title: "관리자 답글 삭제",
    severity: "danger",
    summaryRows: [],
    warnings: ["등록된 관리자 답글이 삭제됩니다.", "삭제 후 복구할 수 없습니다."],
    confirmLabel: "답글 삭제",
    requireReason: false,
    reversible: false,
  };
}
