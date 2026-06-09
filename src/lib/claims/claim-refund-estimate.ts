import type { CommerceOrderRecord } from "@/types/commerce-payment";

/** 환불 예상금액 — 내부 안내용 (가격 정책 변경 없음) */
export function estimateClaimRefundAmount(order: CommerceOrderRecord): number | null {
  if (order.finalAmount == null) return null;
  return order.finalAmount;
}

export function claimRefundPolicyLines(order: CommerceOrderRecord): string[] {
  const lines = [
    `상품금액·할인 반영 후 결제금액: ${order.finalAmount != null ? `${order.finalAmount.toLocaleString("ko-KR")}원` : "확인 중"}`,
    `배송비: ${order.deliveryFee.toLocaleString("ko-KR")}원`,
  ];
  if (order.promotionDiscountTotal && order.promotionDiscountTotal > 0) {
    lines.push(`할인금액: ${order.promotionDiscountTotal.toLocaleString("ko-KR")}원`);
  }
  lines.push("반품 배송비 또는 왕복 배송비가 차감될 수 있습니다.");
  if (order.returnBatteryOption === "no_return" || (order.batteryReturnFee ?? 0) > 0) {
    lines.push("폐전지 미반납 시 추가 비용이 발생할 수 있습니다.");
  }
  return lines;
}
