import "server-only";
import { isTossTestModeFlag } from "@/lib/payment/payment-config";

const DEFAULT_TOSS_API_BASE = "https://api.tosspayments.com";

export type TossConfirmPayload = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type TossConfirmSuccess = {
  ok: true;
  paymentKey: string;
  orderId: string;
  orderName: string;
  method: string;
  status: string;
  totalAmount: number;
  approvedAt: string;
  receiptUrl?: string;
};

export type TossConfirmFailure = {
  ok: false;
  code?: string;
  message: string;
  httpStatus: number;
};

export function getTossSecretKey(): string | null {
  const key = process.env.TOSS_SECRET_KEY?.trim();
  return key || null;
}

export function getTossApiBaseUrl(): string {
  return process.env.TOSS_API_BASE_URL?.trim().replace(/\/$/, "") || DEFAULT_TOSS_API_BASE;
}

export function isTossTestMode(): boolean {
  return isTossTestModeFlag();
}

export function isTossPaymentsConfigured(): boolean {
  return Boolean(getTossSecretKey() && getTossClientKeyPublic());
}

/** 서버 환불·취소 API — secret key만 필요 (client key 불필요) */
export function isTossRefundApiConfigured(): boolean {
  return Boolean(getTossSecretKey());
}

export function getTossClientKeyPublic(): string | null {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() || null;
}

function tossBasicAuthHeader(secretKey: string): string {
  const encoded = Buffer.from(`${secretKey}:`, "utf8").toString("base64");
  return `Basic ${encoded}`;
}

export type TossHttpDeps = {
  fetchFn?: typeof fetch;
};

let tossHttpDeps: TossHttpDeps = {};

/** @internal verify 스크립트·단위 테스트용 fetch 주입 */
export function __setTossHttpDepsForTests(deps: TossHttpDeps): void {
  tossHttpDeps = deps;
}

export function __resetTossHttpDepsForTests(): void {
  tossHttpDeps = {};
}

function resolveFetch(): typeof fetch {
  return tossHttpDeps.fetchFn ?? fetch;
}

export type TossCancelRecord = {
  transactionKey?: string;
  canceledAt?: string;
  cancelAmount?: number;
  cancelReason?: string;
};

export type TossPaymentSnapshot = {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  balanceAmount?: number;
  cancels?: TossCancelRecord[];
};

export type TossCancelPayload = {
  paymentKey: string;
  cancelReason: string;
  /** 전액 취소 시 생략 */
  cancelAmount?: number;
  idempotencyKey?: string;
};

export type TossCancelSuccess = {
  ok: true;
  paymentKey: string;
  status: string;
  totalAmount: number;
  balanceAmount: number;
  cancel: TossCancelRecord;
};

export type TossCancelFailure = {
  ok: false;
  code?: string;
  message: string;
  httpStatus: number;
};

export type TossGetPaymentResult =
  | { ok: true; payment: TossPaymentSnapshot }
  | { ok: false; code?: string; message: string; httpStatus: number };

async function parseTossJson<T>(response: Response): Promise<T & TossApiErrorBody> {
  return (await response.json()) as T & TossApiErrorBody;
}

export async function getTossPayment(
  paymentKey: string,
  deps?: TossHttpDeps,
): Promise<TossGetPaymentResult> {
  const secretKey = getTossSecretKey();
  if (!secretKey) {
    return {
      ok: false,
      message: "결제 설정이 완료되지 않았습니다.",
      httpStatus: 503,
      code: "TOSS_NOT_CONFIGURED",
    };
  }

  const fetchFn = deps?.fetchFn ?? resolveFetch();
  const url = `${getTossApiBaseUrl()}/v1/payments/${encodeURIComponent(paymentKey)}`;

  try {
    const response = await fetchFn(url, {
      method: "GET",
      headers: {
        Authorization: tossBasicAuthHeader(secretKey),
      },
    });
    const data = await parseTossJson<TossPaymentSnapshot>(response);
    if (!response.ok) {
      return {
        ok: false,
        code: data.code,
        message: data.message || "결제 조회에 실패했습니다.",
        httpStatus: response.status,
      };
    }
    return { ok: true, payment: data };
  } catch {
    return {
      ok: false,
      message: "결제 조회 중 오류가 발생했습니다.",
      httpStatus: 502,
      code: "TOSS_NETWORK_ERROR",
    };
  }
}

export async function cancelTossPayment(
  payload: TossCancelPayload,
  deps?: TossHttpDeps,
): Promise<TossCancelSuccess | TossCancelFailure> {
  const secretKey = getTossSecretKey();
  if (!secretKey) {
    return {
      ok: false,
      message: "결제 설정이 완료되지 않았습니다.",
      httpStatus: 503,
      code: "TOSS_NOT_CONFIGURED",
    };
  }

  const fetchFn = deps?.fetchFn ?? resolveFetch();
  const url = `${getTossApiBaseUrl()}/v1/payments/${encodeURIComponent(payload.paymentKey)}/cancel`;
  const body: { cancelReason: string; cancelAmount?: number } = {
    cancelReason: payload.cancelReason,
  };
  if (payload.cancelAmount != null) {
    body.cancelAmount = payload.cancelAmount;
  }

  const headers: Record<string, string> = {
    Authorization: tossBasicAuthHeader(secretKey),
    "Content-Type": "application/json",
  };
  if (payload.idempotencyKey) {
    headers["Idempotency-Key"] = payload.idempotencyKey;
  }

  try {
    const response = await fetchFn(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await parseTossJson<
      TossPaymentSnapshot & { cancels?: TossCancelRecord[] }
    >(response);

    if (!response.ok) {
      return {
        ok: false,
        code: data.code,
        message: data.message || "결제 취소에 실패했습니다.",
        httpStatus: response.status,
      };
    }

    const latestCancel = data.cancels?.[data.cancels.length - 1];
    return {
      ok: true,
      paymentKey: data.paymentKey,
      status: data.status,
      totalAmount: data.totalAmount,
      balanceAmount: data.balanceAmount ?? 0,
      cancel: latestCancel ?? {
        cancelAmount: payload.cancelAmount,
        cancelReason: payload.cancelReason,
      },
    };
  } catch {
    return {
      ok: false,
      message: "결제 취소 처리 중 오류가 발생했습니다.",
      httpStatus: 502,
      code: "TOSS_NETWORK_ERROR",
    };
  }
}

export type TossFullCancelValidation =
  | { ok: true; totalCanceled: number }
  | { ok: false; code: string; message: string };

/** Toss 결제가 전액 취소되었고 DB 주문·금액과 일치하는지 검증 */
export function validateTossFullCancelAgainstOrder(
  payment: TossPaymentSnapshot,
  order: { orderId: string; paidAmount: number },
): TossFullCancelValidation {
  if (payment.orderId !== order.orderId) {
    return {
      ok: false,
      code: "TOSS_ORDER_MISMATCH",
      message: "PG 결제의 주문 식별값이 일치하지 않습니다.",
    };
  }

  const balance = payment.balanceAmount ?? 0;
  if (balance > 0) {
    return {
      ok: false,
      code: "PARTIAL_CANCEL_DETECTED",
      message: "부분 취소된 결제입니다. 전액 환불로 확정할 수 없습니다.",
    };
  }

  if (payment.totalAmount !== order.paidAmount) {
    return {
      ok: false,
      code: "TOSS_AMOUNT_MISMATCH",
      message: "PG 승인 금액과 주문 결제 금액이 일치하지 않습니다.",
    };
  }

  const cancelSum = (payment.cancels ?? []).reduce(
    (sum, row) => sum + (row.cancelAmount ?? 0),
    0,
  );
  if (cancelSum > 0 && cancelSum !== payment.totalAmount) {
    return {
      ok: false,
      code: "PARTIAL_CANCEL_AMOUNT",
      message: "취소 누적 금액이 결제 금액과 일치하지 않습니다.",
    };
  }

  const status = payment.status?.toUpperCase();
  const fullyCanceled =
    status === "CANCELED" ||
    (status === "PARTIAL_CANCELED" && balance === 0 && cancelSum === payment.totalAmount);

  if (!fullyCanceled) {
    return {
      ok: false,
      code: "NOT_FULLY_CANCELED",
      message: "PG 결제가 전액 취소 상태가 아닙니다.",
    };
  }

  return { ok: true, totalCanceled: cancelSum || payment.totalAmount };
}

/** @deprecated validateTossFullCancelAgainstOrder 사용 */
export function isTossPaymentFullyCanceled(payment: TossPaymentSnapshot): boolean {
  return validateTossFullCancelAgainstOrder(payment, {
    orderId: payment.orderId,
    paidAmount: payment.totalAmount,
  }).ok;
}

type TossApiErrorBody = {
  code?: string;
  message?: string;
};

type TossApiSuccessBody = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  method: string;
  status: string;
  totalAmount: number;
  approvedAt: string;
  receipt?: { url?: string };
};

export async function confirmTossPayment(
  payload: TossConfirmPayload,
): Promise<TossConfirmSuccess | TossConfirmFailure> {
  const secretKey = getTossSecretKey();
  if (!secretKey) {
    return {
      ok: false,
      message: "결제 설정이 완료되지 않았습니다.",
      httpStatus: 503,
      code: "TOSS_NOT_CONFIGURED",
    };
  }

  const url = `${getTossApiBaseUrl()}/v1/payments/confirm`;

  try {
    const response = await resolveFetch()(url, {
      method: "POST",
      headers: {
        Authorization: tossBasicAuthHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey: payload.paymentKey,
        orderId: payload.orderId,
        amount: payload.amount,
      }),
    });

    const data = (await response.json()) as TossApiSuccessBody & TossApiErrorBody;

    if (!response.ok) {
      return {
        ok: false,
        code: data.code,
        message: data.message || "결제 승인에 실패했습니다.",
        httpStatus: response.status,
      };
    }

    return {
      ok: true,
      paymentKey: data.paymentKey,
      orderId: data.orderId,
      orderName: data.orderName,
      method: data.method,
      status: data.status,
      totalAmount: data.totalAmount,
      approvedAt: data.approvedAt,
      receiptUrl: data.receipt?.url,
    };
  } catch {
    return {
      ok: false,
      message: "결제 승인 처리 중 오류가 발생했습니다.",
      httpStatus: 502,
      code: "TOSS_NETWORK_ERROR",
    };
  }
}
