/** 결제 흐름 URL — PG 연동 전 라우트 상수 */

export const CHECKOUT_PAGE = "/checkout" as const;
export const CHECKOUT_REVIEW_PAGE = "/checkout/review" as const;
export const PAYMENT_READY_PAGE = "/payment/ready" as const;
export const PAYMENT_SUCCESS_PAGE = "/payment/success" as const;
export const PAYMENT_FAIL_PAGE = "/payment/fail" as const;

export const API_ORDERS_CREATE = "/api/orders/create" as const;
export const API_PAYMENTS_PREPARE = "/api/payments/prepare" as const;
export const API_PAYMENTS_CONFIRM = "/api/payments/confirm" as const;
export const API_PAYMENTS_FAIL = "/api/payments/fail" as const;

export function paymentReadyUrl(orderId: string, paymentRequestId: string): string {
  const sp = new URLSearchParams({ orderId, paymentRequestId });
  return `${PAYMENT_READY_PAGE}?${sp.toString()}`;
}

export function paymentSuccessUrl(orderId?: string, paymentRequestId?: string): string {
  const sp = new URLSearchParams();
  if (orderId) sp.set("orderId", orderId);
  if (paymentRequestId) sp.set("paymentRequestId", paymentRequestId);
  const q = sp.toString();
  return q ? `${PAYMENT_SUCCESS_PAGE}?${q}` : PAYMENT_SUCCESS_PAGE;
}

export function paymentFailUrl(orderId?: string, code?: string): string {
  const sp = new URLSearchParams();
  if (orderId) sp.set("orderId", orderId);
  if (code) sp.set("code", code);
  const q = sp.toString();
  return q ? `${PAYMENT_FAIL_PAGE}?${q}` : PAYMENT_FAIL_PAGE;
}
