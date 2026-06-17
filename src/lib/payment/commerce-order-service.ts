import { randomBytes } from "node:crypto";
import { computeOrderAmountWithPromotions } from "@/lib/promotion/promotion-order-service";
import { buildOrderAmountBreakdown } from "@/lib/pricing/order-amount-breakdown";
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
  getTossClientKeyPublic,
  isTossPaymentsConfigured,
  isTossTestMode,
} from "@/lib/payment/toss-payments.server";
import { validateOrderForPayment } from "@/lib/payment/validate-order-for-payment";
import { assertOrderPaymentAccess } from "@/lib/payment/order-payment-access.server";
import {
  checkoutAttemptMemberMatches,
  isCheckoutAttemptReusable,
} from "@/lib/payment/commerce-order-create-idempotency.server";
import {
  isCheckoutAttemptUniqueViolation,
  isOrderNumberUniqueViolation,
  isPostgresUniqueViolation,
  MAX_ORDER_NUMBER_CREATE_RETRIES,
} from "@/lib/payment/commerce-order-create-retry.server";
import {
  storeCommerceOrderCountByPrefix,
  storeCommerceOrderCreate,
  storeCommerceOrderFindByCheckoutAttemptId,
  storeCommerceOrderGet,
  storeCommerceOrderUpdate,
} from "@/lib/payment/commerce-order-store";
import type {
  CommerceOrderRecord,
  CreateOrderRequestBody,
  PaymentPrepareRequestBody,
  PaymentPrepareResponse,
} from "@/types/commerce-payment";

export { confirmCommercePayment, recordCommercePaymentFail } from "@/lib/payment/commerce-payment-confirm.server";

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

/** 토스 orderName — 상품명 중심, 선택 정보는 과도하게 넣지 않음 */
export function buildCommerceOrderName(
  order: Pick<CommerceOrderRecord, "brand" | "productName" | "batteryCode">,
): string {
  const brand = order.brand?.trim();
  const code = order.batteryCode?.trim();
  if (brand && code) return `${brand} ${code} 자동차 배터리`;
  const name = order.productName?.trim();
  if (name) return name.replace(/\s*배터리\s*$/, " 자동차 배터리");
  return code ? `${code} 자동차 배터리` : "자동차 배터리";
}

export function generateCommerceOrderId(): string {
  return `co_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export function generatePaymentRequestId(): string {
  return `pr_${Date.now()}_${randomBytes(16).toString("hex")}`;
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

  const couponCode = body.promotion?.couponCode?.trim() || undefined;
  const memberId = body.customerInfo.userId?.trim() || undefined;

  const amounts = await computeOrderAmountWithPromotions(
    body.cartItems,
    body.fulfillmentType,
    body.returnBatteryOption,
    { memberId, couponCode },
  );

  if (couponCode && amounts.couponError) {
    return {
      ok: false,
      status: 400,
      message: amounts.couponError,
      errors: ["COUPON_INVALID"],
    };
  }

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

  const checkoutAttemptId = body.checkoutAttemptId?.trim() || undefined;
  if (checkoutAttemptId) {
    const existing = await storeCommerceOrderFindByCheckoutAttemptId(checkoutAttemptId);
    if (existing && isCheckoutAttemptReusable(existing)) {
      if (!checkoutAttemptMemberMatches(existing, memberId)) {
        return {
          ok: false,
          status: 403,
          message: "주문 정보를 확인할 수 없습니다.",
          errors: ["CHECKOUT_ATTEMPT_FORBIDDEN"],
        };
      }
      if (
        existing.finalAmount != null &&
        Math.abs(existing.finalAmount - amounts.finalAmount) >= 1
      ) {
        return {
          ok: false,
          status: 400,
          message: "결제 예정금액이 변경되었습니다. 주문서를 다시 확인해 주세요.",
          errors: ["AMOUNT_MISMATCH"],
        };
      }
      return { ok: true, order: existing };
    }
  }

  const primary = body.cartItems[0]!;
  const now = new Date().toISOString();
  const orderId = generateCommerceOrderId();
  const paymentRequestId = generatePaymentRequestId();
  const amountBreakdown = buildOrderAmountBreakdown(
    body.cartItems,
    body.fulfillmentType,
    body.returnBatteryOption,
  );

  const baseRecord = {
    orderId,
    checkoutAttemptId,
    orderStatus: "payment_pending" as const,
    paymentStatus: "not_started" as const,
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
    promotionDiscountTotal: amounts.promotionDiscountTotal,
    appliedPromotions: amounts.appliedPromotions,
    amountBreakdown,
    finalAmount: amounts.finalAmount,
    postalCode: body.addressInfo?.postalCode?.trim(),
    address1: body.addressInfo?.address1?.trim(),
    address2: body.addressInfo?.address2?.trim(),
    address: resolveAddress(body),
    store: resolveStore(body),
    selectedStore: body.selectedStore ?? body.addressInfo?.storeId,
    requestMemo: body.requestMemo?.trim() || body.customerInfo.orderMemo?.trim(),
    paymentRequestId,
    itemsJson: body.cartItems,
    priceLines: amounts.priceLines,
    statusHistory: [
      {
        status: "payment_pending" as const,
        paymentStatus: "not_started" as const,
        note: "결제 대기 주문 생성",
        at: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_CREATE_RETRIES; attempt += 1) {
    const orderNumber = await generateCommerceOrderNumber();
    const record: CommerceOrderRecord = { ...baseRecord, orderNumber };

    try {
      const saved = await storeCommerceOrderCreate(record);
      return { ok: true, order: saved };
    } catch (err) {
      if (checkoutAttemptId && isCheckoutAttemptUniqueViolation(err)) {
        const raced = await storeCommerceOrderFindByCheckoutAttemptId(checkoutAttemptId);
        if (raced && isCheckoutAttemptReusable(raced) && checkoutAttemptMemberMatches(raced, memberId)) {
          return { ok: true, order: raced };
        }
      }
      if (isOrderNumberUniqueViolation(err) && attempt < MAX_ORDER_NUMBER_CREATE_RETRIES - 1) {
        continue;
      }
      if (checkoutAttemptId && isPostgresUniqueViolation(err)) {
        const raced = await storeCommerceOrderFindByCheckoutAttemptId(checkoutAttemptId);
        if (raced && isCheckoutAttemptReusable(raced) && checkoutAttemptMemberMatches(raced, memberId)) {
          return { ok: true, order: raced };
        }
      }
      break;
    }
  }

  return {
    ok: false,
    status: 503,
    message: "주문 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  };
}

export async function prepareCommercePayment(
  request: Request,
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

  const access = await assertOrderPaymentAccess(request, order, {
    paymentRequestId: body.paymentRequestId,
    orderNumber: body.orderNumber,
    phone: body.phone,
  });
  if (!access.ok) {
    return { ok: false, status: access.status, message: access.message };
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

  const storedPrid = order.paymentRequestId?.trim();
  const clientPrid = body.paymentRequestId?.trim();
  const paymentRequestId =
    storedPrid && clientPrid && clientPrid === storedPrid
      ? storedPrid
      : storedPrid
        ? storedPrid
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
    promotionDiscountTotal: validation.promotionDiscountTotal,
    appliedPromotions: validation.appliedPromotions,
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
      orderName: buildCommerceOrderName(o),
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

export async function getCommerceOrder(orderId: string): Promise<CommerceOrderRecord | null> {
  return storeCommerceOrderGet(orderId);
}
