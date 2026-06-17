import {
  API_ORDERS_CREATE,
  API_PAYMENTS_CONFIRM,
  API_PAYMENTS_FAIL,
  API_PAYMENTS_PREPARE,
} from "@/lib/payment/payment-routes";
import type {
  CreateOrderRequestBody,
  PaymentConfirmRequestBody,
  PaymentConfirmResponse,
  PaymentFailRequestBody,
  PaymentPrepareRequestBody,
  PaymentPrepareResponse,
} from "@/types/commerce-payment";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export type CreateOrderResponse =
  | {
      ok: true;
      order: Pick<
        CommerceOrderRecord,
        "orderId" | "orderNumber" | "finalAmount" | "orderStatus" | "paymentStatus" | "paymentRequestId"
      >;
    }
  | { ok: false; message: string; errors?: string[] };

export async function apiCreateCommerceOrder(
  body: CreateOrderRequestBody,
): Promise<CreateOrderResponse> {
  const res = await fetch(API_ORDERS_CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as CreateOrderResponse & { message?: string };
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      message: data.message ?? "주문 정보를 저장하지 못했습니다. 다시 시도해 주세요.",
      errors: "errors" in data ? data.errors : undefined,
    };
  }
  return data;
}

export async function apiPrepareCommercePayment(
  body: PaymentPrepareRequestBody,
): Promise<{ ok: true; data: PaymentPrepareResponse } | { ok: false; message: string }> {
  const res = await fetch(API_PAYMENTS_PREPARE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) {
    return {
      ok: false,
      message: data?.message ?? "결제 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
    };
  }
  return { ok: true, data: data as PaymentPrepareResponse };
}

export async function apiConfirmCommercePayment(
  body: PaymentConfirmRequestBody,
): Promise<
  { ok: true; data: PaymentConfirmResponse } | { ok: false; message: string; code?: string }
> {
  const res = await fetch(API_PAYMENTS_CONFIRM, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) {
    return {
      ok: false,
      message: data?.message ?? "결제 확인에 실패했습니다. 고객센터로 문의해 주세요.",
      code: data?.code,
    };
  }
  return { ok: true, data: data as PaymentConfirmResponse };
}

export async function apiRecordPaymentFail(
  body: PaymentFailRequestBody,
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(API_PAYMENTS_FAIL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return {
    ok: Boolean(data?.ok),
    message: data?.message ?? "요청을 처리하지 못했습니다.",
  };
}

export type OrderSummaryResponse = {
  ok: true;
  order: {
    orderId: string;
    orderNumber: string;
    orderStatus: CommerceOrderRecord["orderStatus"];
    paymentStatus: CommerceOrderRecord["paymentStatus"];
    customerName: string;
    customerPhone: string;
    productName: string;
    brand?: string;
    batteryCode: string;
    vehicleName?: string;
    vehicleYear?: string;
    vehicleFuel?: string;
    fulfillmentType: CommerceOrderRecord["fulfillmentType"];
    returnBatteryOption: CommerceOrderRecord["returnBatteryOption"];
    finalAmount: number | null;
    address?: string;
    store?: string;
    requestMemo?: string;
    priceLines: CommerceOrderRecord["priceLines"];
    paymentRequestId?: string;
  };
};

export async function apiFetchOrderSummary(
  orderId: string,
  paymentRequestId?: string,
): Promise<OrderSummaryResponse | { ok: false; message: string }> {
  const sp = new URLSearchParams();
  if (paymentRequestId) sp.set("paymentRequestId", paymentRequestId);
  const q = sp.toString();
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}${q ? `?${q}` : ""}`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) {
    return { ok: false, message: data?.message ?? "주문 정보를 불러오지 못했습니다." };
  }
  return data as OrderSummaryResponse;
}
