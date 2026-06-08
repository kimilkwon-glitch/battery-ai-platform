import { randomBytes } from "node:crypto";
import { computeServerOrderAmount } from "@/lib/payment/compute-order-amount";
import {
  isCommerceOrderCreateEnabled,
  isCommerceOrderStoreEnabled,
  isTossPaymentEnabled,
} from "@/lib/payment/payment-config";
import {
  paymentFailUrl,
  paymentSuccessUrl,
} from "@/lib/payment/payment-routes";
import {
  confirmTossPayment,
  getTossClientKeyPublic,
  isTossPaymentsConfigured,
  isTossTestMode,
} from "@/lib/payment/toss-payments.server";
import { validateOrderForPayment } from "@/lib/payment/validate-order-for-payment";
import {
  storeCommerceOrderCountByPrefix,
  storeCommerceOrderCreate,
  storeCommerceOrderGet,
  storeCommerceOrderUpdate,
} from "@/lib/payment/commerce-order-store";
import type {
  CommerceOrderRecord,
  CreateOrderRequestBody,
  PaymentConfirmRequestBody,
  PaymentConfirmResponse,
  PaymentFailRequestBody,
  PaymentPrepareRequestBody,
  PaymentPrepareResponse,
} from "@/types/commerce-payment";

function normalizeMobilePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("82") && digits.length > 10) {
    digits = `0${digits.slice(2)}`;
  }
  return digits;
}

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

function formatStructuredAddress(parts: {
  postalCode?: string;
  address1?: string;
  address2?: string;
  fallback?: string;
}): string | undefined {
  const structured = [parts.postalCode?.trim(), parts.address1?.trim(), parts.address2?.trim()]
    .filter(Boolean)
    .join(" ");
  if (structured) return structured;
  return parts.fallback?.trim() || undefined;
}

function resolveAddress(body: CreateOrderRequestBody): string | undefined {
  const info = body.addressInfo;
  if (body.fulfillmentType === "delivery") {
    return formatStructuredAddress({
      postalCode: info?.postalCode,
      address1: info?.address1,
      address2: info?.address2,
      fallback: info?.deliveryAddress,
    });
  }
  if (body.fulfillmentType === "visit_install") {
    return formatStructuredAddress({
      postalCode: info?.postalCode,
      address1: info?.address1,
      address2: info?.address2,
      fallback: info?.visitRegion,
    });
  }
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

  if (!isCommerceOrderStoreEnabled()) {
    return {
      ok: false,
      status: 503,
      message: "주문 저장소를 준비 중입니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const amounts = computeServerOrderAmount(
    body.cartItems,
    body.fulfillmentType,
    body.returnBatteryOption,
  );
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
    userId: body.customerInfo.userId?.trim() || undefined,
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
    batteryReturnFee: amounts.batteryReturnFee,
    finalAmount: amounts.finalAmount,
    postalCode: body.addressInfo?.postalCode?.trim(),
    address1: body.addressInfo?.address1?.trim(),
    address2: body.addressInfo?.address2?.trim(),
    address: resolveAddress(body),
    store: resolveStore(body),
    selectedStore: body.selectedStore ?? body.addressInfo?.storeId,
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

  try {
    const saved = await storeCommerceOrderCreate(record);
    return { ok: true, order: saved };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "주문 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function prepareCommercePayment(
  body: PaymentPrepareRequestBody,
  origin: string,
): Promise<
  | { ok: true; data: PaymentPrepareResponse }
  | { ok: false; status: number; message: string }
> {
  if (!isTossPaymentEnabled() || !isTossPaymentsConfigured()) {
    return {
      ok: false,
      status: 503,
      message: "결제 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!isCommerceOrderStoreEnabled()) {
    return {
      ok: false,
      status: 503,
      message: "주문 저장소를 준비 중입니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const order = await storeCommerceOrderGet(body.orderId);
  if (!order) {
    return { ok: false, status: 404, message: "주문 정보를 찾을 수 없습니다." };
  }

  if (order.paymentStatus === "completed") {
    return {
      ok: false,
      status: 400,
      message: "이미 결제가 완료된 주문입니다.",
    };
  }

  const validation = validateOrderForPayment(order);
  if (!validation.ok) {
    return { ok: false, status: 400, message: validation.message };
  }

  const serverAmount = validation.finalAmount;

  if (body.clientAmount != null && Math.abs(body.clientAmount - serverAmount) >= 1) {
    return {
      ok: false,
      status: 400,
      message: "결제 예정금액이 일치하지 않습니다. 주문서를 다시 확인해 주세요.",
    };
  }

  const clientKey = getTossClientKeyPublic();
  if (!clientKey) {
    return {
      ok: false,
      status: 503,
      message: "결제 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const paymentRequestId =
    body.paymentRequestId?.trim() && order.paymentRequestId === body.paymentRequestId.trim()
      ? order.paymentRequestId
      : generatePaymentRequestId();

  const now = new Date().toISOString();
  const patch: Partial<CommerceOrderRecord> = {
    paymentRequestId,
    paymentProvider: "toss",
    paymentStatus: "pending",
    orderStatus: "payment_pending",
    finalAmount: serverAmount,
    priceLines: validation.priceLines,
    internetPrice: validation.internetPrice,
    onsitePrice: validation.onsitePrice,
    deliveryFee: validation.deliveryFee,
    storeInstallDiscount: validation.storeInstallDiscount,
    statusHistory: [
      ...order.statusHistory,
      {
        status: "payment_pending",
        paymentStatus: "pending",
        note: "토스 결제 준비",
        at: now,
      },
    ],
  };

  const updated = await storeCommerceOrderUpdate(order.orderId, patch);
  const o = updated ?? { ...order, ...patch };

  const successUrl = `${origin}${paymentSuccessUrl(paymentRequestId)}`;
  const failUrl = `${origin}${paymentFailUrl(o.orderId)}`;
  const returnUrl = `${origin}/payment/ready?orderId=${encodeURIComponent(o.orderId)}&paymentRequestId=${encodeURIComponent(paymentRequestId)}`;
  const mobile = normalizeMobilePhone(o.customerPhone);

  return {
    ok: true,
    data: {
      ok: true,
      provider: "toss",
      paymentRequestId,
      orderId: o.orderId,
      orderNumber: o.orderNumber,
      amount: serverAmount,
      orderName: `${o.productName} (${o.batteryCode})`,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      customerMobilePhone: mobile,
      fulfillmentType: o.fulfillmentType,
      successUrl,
      failUrl,
      returnUrl,
      clientKey,
      testMode: isTossTestMode(),
      message: "결제 준비가 완료되었습니다.",
    },
  };
}

export async function confirmCommercePayment(
  body: PaymentConfirmRequestBody,
): Promise<
  | { ok: true; data: PaymentConfirmResponse }
  | { ok: false; status: number; message: string; code?: string }
> {
  const paymentKey = body.paymentKey?.trim();
  const orderId = body.orderId?.trim();
  const amount = body.amount;

  if (!paymentKey || !orderId || amount == null || Number.isNaN(Number(amount))) {
    return {
      ok: false,
      status: 400,
      message: "결제 확인에 필요한 정보가 없습니다.",
    };
  }

  const order = await storeCommerceOrderGet(orderId);
  if (!order) {
    return { ok: false, status: 404, message: "주문 정보를 찾을 수 없습니다." };
  }

  if (
    body.paymentRequestId?.trim() &&
    order.paymentRequestId &&
    order.paymentRequestId !== body.paymentRequestId.trim()
  ) {
    return {
      ok: false,
      status: 403,
      message: "결제 요청 정보가 일치하지 않습니다.",
    };
  }

  if (order.paymentStatus === "completed" && order.paymentKey === paymentKey) {
    return {
      ok: true,
      data: {
        ok: true,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        amount: order.paidAmount ?? order.finalAmount ?? Number(amount),
        paymentStatus: "completed",
        orderStatus: order.orderStatus,
        productName: order.productName,
        brand: order.brand,
        customerName: order.customerName,
        vehicleName: order.vehicleName,
        fulfillmentType: order.fulfillmentType,
        alreadyConfirmed: true,
      },
    };
  }

  if (order.paymentStatus === "completed") {
    return {
      ok: false,
      status: 409,
      message: "이미 결제가 완료된 주문입니다.",
      code: "ALREADY_PAID",
    };
  }

  const validation = validateOrderForPayment(order);
  if (!validation.ok) {
    return { ok: false, status: 400, message: validation.message };
  }

  const serverAmount = validation.finalAmount;
  if (Math.abs(serverAmount - Number(amount)) >= 1) {
    await storeCommerceOrderUpdate(order.orderId, {
      paymentStatus: "failed",
      orderStatus: "payment_failed",
      paymentFailCode: "AMOUNT_MISMATCH",
      paymentFailReason: "결제 금액이 일치하지 않습니다.",
      statusHistory: [
        ...order.statusHistory,
        {
          status: "payment_failed",
          paymentStatus: "failed",
          note: "결제 금액 불일치",
          at: new Date().toISOString(),
        },
      ],
    });
    return {
      ok: false,
      status: 400,
      message: "결제 금액이 일치하지 않습니다.",
      code: "AMOUNT_MISMATCH",
    };
  }

  const tossResult = await confirmTossPayment({
    paymentKey,
    orderId,
    amount: serverAmount,
  });

  if (!tossResult.ok) {
    const failNote = tossResult.message;
    await storeCommerceOrderUpdate(order.orderId, {
      paymentStatus: "failed",
      orderStatus: "payment_failed",
      paymentFailCode: tossResult.code,
      paymentFailReason: failNote,
      statusHistory: [
        ...order.statusHistory,
        {
          status: "payment_failed",
          paymentStatus: "failed",
          note: failNote,
          at: new Date().toISOString(),
        },
      ],
    });
    return {
      ok: false,
      status: tossResult.httpStatus >= 400 ? tossResult.httpStatus : 402,
      message: "결제 승인에 실패했습니다. 다시 시도해 주세요.",
      code: tossResult.code,
    };
  }

  const approvedAt = tossResult.approvedAt;
  const now = new Date().toISOString();
  await storeCommerceOrderUpdate(order.orderId, {
    paymentStatus: "completed",
    orderStatus: "payment_completed",
    paymentProvider: "toss",
    paymentKey: tossResult.paymentKey,
    pgTransactionId: tossResult.paymentKey,
    paidAmount: tossResult.totalAmount,
    paymentMethod: tossResult.method,
    approvedAt,
    receiptUrl: tossResult.receiptUrl,
    tossPaymentStatus: tossResult.status,
    paymentFailReason: undefined,
    paymentFailCode: undefined,
    statusHistory: [
      ...order.statusHistory,
      {
        status: "payment_completed",
        paymentStatus: "completed",
        note: `토스 결제 승인 (${tossResult.method})`,
        at: now,
      },
    ],
  });

  return {
    ok: true,
    data: {
      ok: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      amount: tossResult.totalAmount,
      paymentStatus: "completed",
      orderStatus: "payment_completed",
      productName: order.productName,
      brand: order.brand,
      customerName: order.customerName,
      vehicleName: order.vehicleName,
      fulfillmentType: order.fulfillmentType,
    },
  };
}

export async function recordCommercePaymentFail(
  body: PaymentFailRequestBody,
): Promise<{ ok: boolean; message: string }> {
  const order = await storeCommerceOrderGet(body.orderId);
  if (!order) return { ok: false, message: "주문 정보를 찾을 수 없습니다." };

  const code = body.errorCode?.trim() ?? "";
  const isCancel =
    code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL" || /취소|cancel/i.test(code);
  const reason =
    body.errorMessage?.trim() ||
    (isCancel ? "결제가 취소되었습니다." : "결제가 완료되지 않았습니다.");
  const paymentStatus = isCancel ? "canceled" : "failed";
  const orderStatus = isCancel ? "payment_failed" : "payment_failed";

  await storeCommerceOrderUpdate(order.orderId, {
    paymentStatus,
    orderStatus,
    paymentFailCode: code || undefined,
    paymentFailReason: reason,
    statusHistory: [
      ...order.statusHistory,
      {
        status: orderStatus,
        paymentStatus,
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
