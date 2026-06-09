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
  stub: true;
  message: string;
};

/** @internal PG 연동 후 구현 */
export async function requestTossPaymentRefund(
  input: TossRefundRequest,
): Promise<TossRefundResult> {
  void input;
  return {
    ok: false,
    stub: true,
    message: "환불 API 연동 전 — 내부 상태만 변경됩니다.",
  };
}
