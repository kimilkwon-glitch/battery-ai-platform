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

export function getTossClientKeyPublic(): string | null {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() || null;
}

function tossBasicAuthHeader(secretKey: string): string {
  const encoded = Buffer.from(`${secretKey}:`, "utf8").toString("base64");
  return `Basic ${encoded}`;
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
    const response = await fetch(url, {
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
