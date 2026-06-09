/**
 * 토스페이먼츠 환불 API — 연동 전 stub
 * 실제 live API 호출은 paymentKey·시크릿 키 연결 후 별도 작업
 */

export type TossRefundRequest = {
  orderId: string;
  paymentKey?: string | null;
  cancelAmount: number;
  cancelReason: string;
};

export type TossRefundResult = {
  ok: boolean;
  stub: boolean;
  message: string;
};

/** 실제 토스/PG 환불 API 연동 여부 (연동 후 true로 전환) */
export function isPgRefundIntegrated(): boolean {
  return false;
}

/** @internal PG 연동 후 구현 */
export async function requestTossPaymentRefund(
  input: TossRefundRequest,
): Promise<TossRefundResult> {
  void input;
  if (isPgRefundIntegrated()) {
    return {
      ok: false,
      stub: false,
      message: "PG 환불 연동 구현 필요",
    };
  }
  return {
    ok: false,
    stub: true,
    message: "PG 환불 API 미연동 — 클레임 상태만 변경됩니다.",
  };
}
