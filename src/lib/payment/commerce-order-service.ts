import { randomBytes } from "node:crypto";
import { computeServerOrderAmount } from "@/lib/payment/compute-order-amount";
import { isCommerceOrderCreateEnabled } from "@/lib/payment/payment-config";
import {
  paymentFailUrl,
  paymentSuccessUrl,
} from "@/lib/payment/payment-routes";
import {
  storeCommerceOrderCountByPrefix,
  storeCommerceOrderCreate,
  storeCommerceOrderGet,
  storeCommerceOrderUpdate,
} from "@/lib/payment/commerce-order-store";
import type {
  CommerceOrderRecord,
  CreateOrderRequestBody,
  PaymentFailRequestBody,
  PaymentPrepareRequestBody,
  PaymentPrepareResponse,
} from "@/types/commerce-payment";

const STORE_LABELS: Record<string, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
};

export function generateCommerceOrderId(): string {
  return `co_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export function generatePaymentRequestId(): string {
  return `pr_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export async function generateCommerceOrderNumber(date = new Date()): Promise<string> {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const prefix = `BM-${y}${m}${d}-`;
  const count = await storeCommerceOrderCountByPrefix(prefix);
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function resolveAddress(body: CreateOrderRequestBody): string | undefined {
  if (body.fulfillmentType === "delivery") return body.addressInfo?.deliveryAddress?.trim();
  if (body.fulfillmentType === "visit_install") return body.addressInfo?.visitRegion?.trim();
  return undefined;
}

function resolveStore(body: CreateOrderRequestBody): string | undefined {
  const id = body.selectedStore ?? body.addressInfo?.storeId;
  if (id === "deokcheon" || id === "hakjang") return STORE_LABELS[id];
  return undefined;
}

export async function createCommerceOrder(
  body: CreateOrderRequestBody,
): Promise<
  | { ok: true; order: CommerceOrderRecord }
  | { ok: false; status: number; message: string; errors?: string[] }
> {
  if (!isCommerceOrderCreateEnabled()) {
    return {
      ok: false,
      status: 503,
      message: "현재 주문 접수를 준비 중입니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const amounts = computeServerOrderAmount(body.cartItems, body.fulfillmentType);
  if (amounts.finalAmount == null) {
    return {
      ok: false,
      status: 400,
      message: "결제 예정금액을 계산할 수 없습니다. 수령/장착 방식을 확인해 주세요.",
    };
  }

  const clientAmount = body.priceSummary?.clientFinalAmount;
  if (
    clientAmount != null &&
    Math.abs(clientAmount - amounts.finalAmount) >= 1
  ) {
    return {
      ok: false,
      status: 400,
      message: "결제 예정금액이 변경되었습니다. 주문서를 다시 확인해 주세요.",
      errors: ["AMOUNT_MISMATCH"],
    };
  }

  const primary = body.cartItems[0]!;
  const now = new Date().toISOString();
  const orderId = generateCommerceOrderId();
  const orderNumber = await generateCommerceOrderNumber();

  const record: CommerceOrderRecord = {
    orderId,
    orderNumber,
    orderStatus: "payment_pending",
    paymentStatus: "not_started",
    customerName: body.customerInfo.name.trim(),
    customerPhone: body.customerInfo.phone.trim(),
    customerEmail: body.customerInfo.email?.trim(),
    customerType: body.customerInfo.customerType ?? "member",
    vehicleName: body.vehicleInfo?.name,
    vehicleYear: body.vehicleInfo?.year,
    vehicleFuel: body.vehicleInfo?.fuelType,
    plateSuffix: body.vehicleInfo?.plateSuffix,
    productName: primary.productName,
    brand: primary.brandName,
    batteryCode: primary.batterySpec,
    internetPrice: amounts.internetPrice,
    onsitePrice: amounts.onsitePrice,
    fulfillmentType: body.fulfillmentType as CommerceOrderRecord["fulfillmentType"],
    returnBatteryOption: body.returnBatteryOption,
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
    finalAmount: amounts.finalAmount,
    address: resolveAddress(body),
    store: resolveStore(body),
    requestMemo: body.requestMemo?.trim() || body.customerInfo.orderMemo?.trim(),
    itemsJson: body.cartItems,
    priceLines: amounts.priceLines,
    statusHistory: [
      {
        status: "payment_pending",
        paymentStatus: "not_started",
        note: "결제 대기 주문 생성",
        at: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const saved = await storeCommerceOrderCreate(record);
  return { ok: true, order: saved };
}

export async function prepareCommercePayment(
  body: PaymentPrepareRequestBody,
  origin: string,
): Promise<
  | { ok: true; data: PaymentPrepareResponse }
  | { ok: false; status: number; message: string }
> {
  const order = await storeCommerceOrderGet(body.orderId);
  if (!order) {
    return { ok: false, status: 404, message: "주문 정보를 찾을 수 없습니다." };
  }

  if (order.finalAmount == null) {
    return { ok: false, status: 400, message: "결제 금액을 확인할 수 없습니다." };
  }

  if (
    body.clientAmount != null &&
    Math.abs(body.clientAmount - order.finalAmount) >= 1
  ) {
    return {
      ok: false,
      status: 400,
      message: "결제 예정금액이 일치하지 않습니다. 주문서를 다시 확인해 주세요.",
    };
  }

  const paymentRequestId = generatePaymentRequestId();
  const updated = await storeCommerceOrderUpdate(order.orderId, {
    paymentRequestId,
    paymentStatus: "preparing",
    orderStatus: "payment_pending",
    statusHistory: [
      ...order.statusHistory,
      {
        status: "payment_pending",
        paymentStatus: "preparing",
        note: "결제 준비",
        at: new Date().toISOString(),
      },
    ],
  });

  const o = updated ?? order;
  const successUrl = `${origin}${paymentSuccessUrl(o.orderId, paymentRequestId)}`;
  const failUrl = `${origin}${paymentFailUrl(o.orderId)}`;
  const returnUrl = `${origin}/payment/ready?orderId=${encodeURIComponent(o.orderId)}&paymentRequestId=${encodeURIComponent(paymentRequestId)}`;

  return {
    ok: true,
    data: {
      ok: true,
      paymentRequestId,
      orderId: o.orderId,
      orderNumber: o.orderNumber,
      amount: o.finalAmount!,
      orderName: `${o.productName} (${o.batteryCode})`,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      fulfillmentType: o.fulfillmentType,
      successUrl,
      failUrl,
      returnUrl,
      message: "결제 준비가 완료되었습니다.",
    },
  };
}

export async function recordCommercePaymentFail(
  body: PaymentFailRequestBody,
): Promise<{ ok: boolean; message: string }> {
  const order = await storeCommerceOrderGet(body.orderId);
  if (!order) return { ok: false, message: "주문 정보를 찾을 수 없습니다." };

  const reason = body.errorMessage?.trim() || "결제가 완료되지 않았습니다.";
  await storeCommerceOrderUpdate(order.orderId, {
    paymentStatus: "failed",
    orderStatus: "payment_failed",
    paymentFailReason: reason,
    statusHistory: [
      ...order.statusHistory,
      {
        status: "payment_failed",
        paymentStatus: "failed",
        note: reason,
        at: new Date().toISOString(),
      },
    ],
  });

  return { ok: true, message: "결제 실패 정보가 기록되었습니다." };
}

export async function getCommerceOrder(orderId: string): Promise<CommerceOrderRecord | null> {
  return storeCommerceOrderGet(orderId);
}
