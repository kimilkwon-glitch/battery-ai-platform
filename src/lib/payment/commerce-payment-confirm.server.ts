import "server-only";

import { hookAlimtalkOrderCreated } from "@/lib/notifications/alimtalk-hooks.server";
import { assertOrderPaymentAccess } from "@/lib/payment/order-payment-access.server";
import {
  canRecordPaymentFail,
  isPaymentStatusTerminal,
} from "@/lib/payment/commerce-payment-transition.server";
import {
  pgClaimPaymentConfirmOperation,
  pgFinalizePaymentConfirmAtomically,
  pgFindOrderIdByPaymentKey,
  pgMarkPaymentReconcileNeeded,
  type TossApprovedPayment,
} from "@/lib/payment/commerce-payment-confirm-persist.postgres";
import { storeCommerceOrderGet, storeCommerceOrderUpdate } from "@/lib/payment/commerce-order-store";
import {
  confirmTossPayment,
  getTossPayment,
  isTossPaymentsConfigured,
  type TossConfirmSuccess,
} from "@/lib/payment/toss-payments.server";
import { validateOrderForPayment } from "@/lib/payment/validate-order-for-payment";
import {
  hasPromotionUsagesForOrder,
  recordPromotionUsages,
} from "@/lib/promotion/promotion-store.postgres";
import type {
  CommerceOrderRecord,
  PaymentConfirmRequestBody,
  PaymentConfirmResponse,
  PaymentFailRequestBody,
} from "@/types/commerce-payment";

export type ConfirmPaymentSource = "browser" | "webhook" | "reconcile";

export type ConfirmStoreDeps = {
  claimOperation?: typeof pgClaimPaymentConfirmOperation;
  finalizeAtomically?: typeof pgFinalizePaymentConfirmAtomically;
  markReconcileNeeded?: typeof pgMarkPaymentReconcileNeeded;
  findOrderIdByPaymentKey?: typeof pgFindOrderIdByPaymentKey;
  getOrder?: typeof storeCommerceOrderGet;
  updateOrder?: typeof storeCommerceOrderUpdate;
  confirmToss?: typeof confirmTossPayment;
  getTossPayment?: typeof getTossPayment;
  hasPromotionUsages?: typeof hasPromotionUsagesForOrder;
  recordPromotions?: typeof recordPromotionUsages;
  onPaymentCompleted?: (order: CommerceOrderRecord, firstTransition: boolean) => void;
};

let confirmStoreDeps: ConfirmStoreDeps = {};

export function __setConfirmStoreDepsForTests(deps: ConfirmStoreDeps): void {
  confirmStoreDeps = deps;
}

export function __resetConfirmStoreDepsForTests(): void {
  confirmStoreDeps = {};
}

function deps(): Required<
  Pick<
    ConfirmStoreDeps,
    | "claimOperation"
    | "finalizeAtomically"
    | "markReconcileNeeded"
    | "findOrderIdByPaymentKey"
    | "getOrder"
    | "updateOrder"
    | "confirmToss"
    | "getTossPayment"
    | "hasPromotionUsages"
    | "recordPromotions"
  >
> & {
  onPaymentCompleted: NonNullable<ConfirmStoreDeps["onPaymentCompleted"]>;
} {
  return {
    claimOperation: confirmStoreDeps.claimOperation ?? pgClaimPaymentConfirmOperation,
    finalizeAtomically:
      confirmStoreDeps.finalizeAtomically ?? pgFinalizePaymentConfirmAtomically,
    markReconcileNeeded:
      confirmStoreDeps.markReconcileNeeded ?? pgMarkPaymentReconcileNeeded,
    findOrderIdByPaymentKey:
      confirmStoreDeps.findOrderIdByPaymentKey ?? pgFindOrderIdByPaymentKey,
    getOrder: confirmStoreDeps.getOrder ?? storeCommerceOrderGet,
    updateOrder: confirmStoreDeps.updateOrder ?? storeCommerceOrderUpdate,
    confirmToss: confirmStoreDeps.confirmToss ?? confirmTossPayment,
    getTossPayment: confirmStoreDeps.getTossPayment ?? getTossPayment,
    hasPromotionUsages:
      confirmStoreDeps.hasPromotionUsages ?? hasPromotionUsagesForOrder,
    recordPromotions: confirmStoreDeps.recordPromotions ?? recordPromotionUsages,
    onPaymentCompleted:
      confirmStoreDeps.onPaymentCompleted ??
      ((order, firstTransition) => {
        if (firstTransition) hookAlimtalkOrderCreated(order);
      }),
  };
}

function toApproved(toss: TossConfirmSuccess): TossApprovedPayment {
  return {
    paymentKey: toss.paymentKey,
    orderId: toss.orderId,
    method: toss.method,
    status: toss.status,
    totalAmount: toss.totalAmount,
    approvedAt: toss.approvedAt,
    receiptUrl: toss.receiptUrl,
  };
}

function buildConfirmResponse(
  order: CommerceOrderRecord,
  amount: number,
  alreadyConfirmed = false,
): PaymentConfirmResponse {
  return {
    ok: true,
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    amount,
    paymentStatus: "completed",
    orderStatus: order.orderStatus === "payment_pending" ? "payment_completed" : order.orderStatus,
    productName: order.productName,
    brand: order.brand,
    customerName: order.customerName,
    vehicleName: order.vehicleName,
    fulfillmentType: order.fulfillmentType,
    alreadyConfirmed,
  };
}

async function recordPromotionsOnce(order: CommerceOrderRecord): Promise<void> {
  const d = deps();
  const alreadyRecorded = await d.hasPromotionUsages(order.orderId);
  if (alreadyRecorded || !order.appliedPromotions?.length) return;
  await d.recordPromotions(
    order.appliedPromotions.map((p) => ({
      promotionId: p.promotionId,
      memberId: order.userId ?? null,
      orderId: order.orderId,
      discountAmount: p.discountAmount,
      couponCode: p.code,
    })),
  );
}

export async function finalizeApprovedCommercePayment(input: {
  orderId: string;
  paymentKey: string;
  approved: TossApprovedPayment;
  source: ConfirmPaymentSource;
  statusNote?: string;
}): Promise<
  | { ok: true; order: CommerceOrderRecord; firstTransition: boolean }
  | { ok: false; status: number; message: string; code?: string }
> {
  const d = deps();
  const note =
    input.statusNote ??
    (input.source === "webhook"
      ? "토스 웹훅 결제 확정"
      : input.source === "reconcile"
        ? "결제 상태 재동기화"
        : `토스 결제 승인 (${input.approved.method})`);

  const result = await d.finalizeAtomically({
    orderId: input.orderId,
    paymentKey: input.paymentKey,
    approved: input.approved,
    statusNote: note,
    source: input.source,
  });

  if (!result.ok) {
    return {
      ok: false,
      status: 409,
      message: result.message,
      code: result.code,
    };
  }

  if (result.transitioned) {
    await recordPromotionsOnce(result.order);
  }

  d.onPaymentCompleted(result.order, result.transitioned);

  return {
    ok: true,
    order: result.order,
    firstTransition: result.transitioned,
  };
}

async function resolveTossApprovedState(input: {
  paymentKey: string;
  orderId: string;
  serverAmount: number;
  skipConfirmCall?: boolean;
}): Promise<
  | { ok: true; approved: TossApprovedPayment; via: "confirm" | "query" }
  | { ok: false; status: number; message: string; code?: string; reconcile?: boolean }
> {
  const d = deps();

  if (!input.skipConfirmCall) {
    const tossResult = await d.confirmToss({
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: input.serverAmount,
    });

    if (tossResult.ok) {
      if (tossResult.orderId !== input.orderId) {
        return {
          ok: false,
          status: 400,
          message: "결제 주문 정보가 일치하지 않습니다.",
          code: "TOSS_ORDER_MISMATCH",
        };
      }
      if (Math.abs(tossResult.totalAmount - input.serverAmount) >= 1) {
        return {
          ok: false,
          status: 400,
          message: "결제 금액이 일치하지 않습니다.",
          code: "AMOUNT_MISMATCH",
        };
      }
      return { ok: true, approved: toApproved(tossResult), via: "confirm" };
    }

    const retriableCodes = new Set([
      "ALREADY_PROCESSED_PAYMENT",
      "DUPLICATE_REQUEST",
      "PAYMENT_ALREADY_DONE",
    ]);
    if (!retriableCodes.has(tossResult.code ?? "")) {
      return {
        ok: false,
        status: tossResult.httpStatus >= 400 ? tossResult.httpStatus : 402,
        message: "결제 승인에 실패했습니다. 다시 시도해 주세요.",
        code: tossResult.code,
      };
    }
  }

  const queried = await d.getTossPayment(input.paymentKey);
  if (!queried.ok) {
    return {
      ok: false,
      status: queried.httpStatus >= 400 ? queried.httpStatus : 502,
      message: "결제 상태를 확인할 수 없습니다.",
      code: queried.code,
      reconcile: true,
    };
  }

  const payment = queried.payment;
  const approvedStatus = payment.status?.toUpperCase();
  if (approvedStatus !== "DONE") {
    return {
      ok: false,
      status: 402,
      message: "결제 승인이 완료되지 않았습니다.",
      code: "TOSS_NOT_APPROVED",
    };
  }

  if (payment.orderId !== input.orderId) {
    return {
      ok: false,
      status: 400,
      message: "결제 주문 정보가 일치하지 않습니다.",
      code: "TOSS_ORDER_MISMATCH",
    };
  }

  if (Math.abs(payment.totalAmount - input.serverAmount) >= 1) {
    return {
      ok: false,
      status: 400,
      message: "결제 금액이 일치하지 않습니다.",
      code: "AMOUNT_MISMATCH",
    };
  }

  return {
    ok: true,
    approved: {
      paymentKey: payment.paymentKey,
      orderId: payment.orderId,
      method: "card",
      status: payment.status,
      totalAmount: payment.totalAmount,
      approvedAt: new Date().toISOString(),
    },
    via: "query",
  };
}

export async function runCommercePaymentConfirm(input: {
  source: ConfirmPaymentSource;
  request?: Request;
  body: PaymentConfirmRequestBody;
}): Promise<
  | { ok: true; data: PaymentConfirmResponse }
  | { ok: false; status: number; message: string; code?: string }
> {
  const paymentKey = input.body.paymentKey?.trim();
  const orderId = input.body.orderId?.trim();
  const amount = input.body.amount;

  if (!paymentKey || !orderId || amount == null || Number.isNaN(Number(amount))) {
    return {
      ok: false,
      status: 400,
      message: "결제 확인에 필요한 정보가 없습니다.",
    };
  }

  const d = deps();
  const order = await d.getOrder(orderId);
  if (!order) {
    return { ok: false, status: 404, message: "주문 정보를 찾을 수 없습니다." };
  }

  if (input.source === "browser") {
    if (!input.request) {
      return { ok: false, status: 500, message: "결제 확인 요청이 올바르지 않습니다." };
    }
    const access = await assertOrderPaymentAccess(input.request, order, {
      paymentRequestId: input.body.paymentRequestId,
    });
    if (!access.ok) {
      return { ok: false, status: access.status, message: access.message, code: "ACCESS_DENIED" };
    }
  }

  if (order.paymentStatus === "completed") {
    const boundKey = order.paymentKey?.trim();
    if (boundKey && boundKey === paymentKey) {
      return {
        ok: true,
        data: buildConfirmResponse(
          order,
          order.paidAmount ?? order.finalAmount ?? Number(amount),
          true,
        ),
      };
    }
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
    return {
      ok: false,
      status: 400,
      message: "결제 금액이 일치하지 않습니다.",
      code: "AMOUNT_MISMATCH",
    };
  }

  const boundOrderId = await d.findOrderIdByPaymentKey(paymentKey);
  if (boundOrderId && boundOrderId !== orderId) {
    return {
      ok: false,
      status: 409,
      message: "결제 키가 다른 주문에 연결되어 있습니다.",
      code: "PAYMENT_KEY_BOUND_TO_OTHER_ORDER",
    };
  }

  const claim = await d.claimOperation({
    orderId,
    paymentKey,
    paymentRequestId: input.body.paymentRequestId,
  });

  if (!claim.ok) {
    return {
      ok: false,
      status: claim.status,
      message: claim.message,
      code: claim.code,
    };
  }

  if (claim.outcome === "idempotent_completed") {
    return {
      ok: true,
      data: buildConfirmResponse(
        claim.order,
        claim.order.paidAmount ?? claim.order.finalAmount ?? serverAmount,
        true,
      ),
    };
  }

  const skipConfirmCall = claim.outcome === "resume_processing";
  const tossState = await resolveTossApprovedState({
    paymentKey,
    orderId,
    serverAmount,
    skipConfirmCall,
  });

  if (!tossState.ok) {
    if (tossState.reconcile) {
      await d.markReconcileNeeded({
        orderId,
        paymentKey,
        note: "결제 승인됐으나 내부 저장 확인 필요 (Toss 조회 실패)",
      });
    } else if (tossState.code !== "TOSS_NOT_APPROVED") {
      await d.updateOrder(orderId, {
        paymentStatus: "failed",
        orderStatus: "payment_failed",
        paymentFailCode: tossState.code,
        paymentFailReason: tossState.message,
        statusHistory: [
          ...order.statusHistory,
          {
            status: "payment_failed",
            paymentStatus: "failed",
            note: tossState.message,
            at: new Date().toISOString(),
          },
        ],
      });
    }
    return {
      ok: false,
      status: tossState.status,
      message: tossState.message,
      code: tossState.code,
    };
  }

  const finalized = await finalizeApprovedCommercePayment({
    orderId,
    paymentKey,
    approved: tossState.approved,
    source: input.source,
  });

  if (!finalized.ok) {
    await d.markReconcileNeeded({
      orderId,
      paymentKey,
      note: "결제 승인됐으나 내부 저장 확인 필요 (DB finalize 실패)",
    });
    return {
      ok: false,
      status: 503,
      message:
        "결제는 승인되었으나 주문 저장 확인이 필요합니다. 재시도하거나 고객센터로 문의해 주세요.",
      code: "FINALIZE_RECONCILE_NEEDED",
    };
  }

  return {
    ok: true,
    data: buildConfirmResponse(
      finalized.order,
      tossState.approved.totalAmount,
      !finalized.firstTransition,
    ),
  };
}

export async function confirmCommercePayment(
  request: Request,
  body: PaymentConfirmRequestBody,
): Promise<
  | { ok: true; data: PaymentConfirmResponse }
  | { ok: false; status: number; message: string; code?: string }
> {
  return runCommercePaymentConfirm({ source: "browser", request, body });
}

export async function recordCommercePaymentFail(
  request: Request,
  body: PaymentFailRequestBody,
): Promise<{ ok: boolean; message: string; status?: number; code?: string }> {
  const order = await deps().getOrder(body.orderId);
  if (!order) return { ok: false, message: "주문 정보를 찾을 수 없습니다.", status: 404 };

  const access = await assertOrderPaymentAccess(request, order, {
    paymentRequestId: body.paymentRequestId,
  });
  if (!access.ok) {
    return {
      ok: false,
      message: access.message,
      status: access.status,
      code: "ACCESS_DENIED",
    };
  }

  if (isPaymentStatusTerminal(order.paymentStatus)) {
    return {
      ok: false,
      message: "이미 결제가 완료된 주문입니다.",
      status: 409,
      code: "ALREADY_PAID",
    };
  }

  if (!canRecordPaymentFail(order.paymentStatus)) {
    return {
      ok: false,
      message: "결제 실패를 기록할 수 없는 주문 상태입니다.",
      status: 409,
      code: "STATE_BLOCKED",
    };
  }

  const code = body.errorCode?.trim() ?? "";
  const isCancel =
    code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL" || /취소|cancel/i.test(code);
  const reason =
    body.errorMessage?.trim() ||
    (isCancel ? "결제가 취소되었습니다." : "결제가 완료되지 않았습니다.");
  const paymentStatus = isCancel ? "canceled" : "failed";
  const orderStatus = "payment_failed";

  await deps().updateOrder(order.orderId, {
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

export function isTossPaymentWebhookActive(): boolean {
  return (
    process.env.TOSS_PAYMENT_WEBHOOK_ENABLED === "true" && isTossPaymentsConfigured()
  );
}

export type TossWebhookEvent = {
  eventType?: string;
  createdAt?: string;
  data?: {
    paymentKey?: string;
    orderId?: string;
    status?: string;
  };
};

export async function handleTossPaymentWebhookEvent(
  event: TossWebhookEvent,
): Promise<{ ok: boolean; status: number; message: string; code?: string }> {
  if (!isTossPaymentWebhookActive()) {
    return {
      ok: false,
      status: 503,
      message: "웹훅이 아직 활성화되지 않았습니다.",
      code: "WEBHOOK_DISABLED",
    };
  }

  const paymentKey = event.data?.paymentKey?.trim();
  const orderId = event.data?.orderId?.trim();
  if (!paymentKey || !orderId) {
    return { ok: false, status: 400, message: "웹훅 payload가 올바르지 않습니다." };
  }

  const status = event.data?.status?.toUpperCase();
  if (status && status !== "DONE") {
    return { ok: true, status: 200, message: "ignored_non_done_status" };
  }

  const order = await deps().getOrder(orderId);
  if (!order) {
    return { ok: false, status: 404, message: "주문을 찾을 수 없습니다." };
  }

  if (order.paymentStatus === "completed") {
    return { ok: true, status: 200, message: "idempotent_completed" };
  }

  const validation = validateOrderForPayment(order);
  if (!validation.ok) {
    return { ok: false, status: 400, message: validation.message };
  }

  const tossState = await resolveTossApprovedState({
    paymentKey,
    orderId,
    serverAmount: validation.finalAmount,
    skipConfirmCall: true,
  });

  if (!tossState.ok) {
    return {
      ok: false,
      status: tossState.status,
      message: tossState.message,
      code: tossState.code,
    };
  }

  const claim = await deps().claimOperation({ orderId, paymentKey });
  if (claim.ok && claim.outcome === "idempotent_completed") {
    return { ok: true, status: 200, message: "idempotent_completed" };
  }
  if (!claim.ok) {
    if (claim.code === "PAYMENT_KEY_BOUND_TO_OTHER_ORDER") {
      return {
        ok: false,
        status: claim.status,
        message: claim.message,
        code: claim.code,
      };
    }
    const refreshed = await deps().getOrder(orderId);
    if (refreshed?.paymentStatus === "completed") {
      return { ok: true, status: 200, message: "idempotent_completed" };
    }
    if (claim.code !== "CONFIRM_IN_PROGRESS") {
      return {
        ok: false,
        status: claim.status,
        message: claim.message,
        code: claim.code,
      };
    }
  }

  const finalized = await finalizeApprovedCommercePayment({
    orderId,
    paymentKey,
    approved: tossState.approved,
    source: "webhook",
  });

  if (!finalized.ok) {
    await deps().markReconcileNeeded({
      orderId,
      paymentKey,
      note: "웹훅: 결제 승인됐으나 내부 저장 확인 필요",
    });
    return {
      ok: false,
      status: 503,
      message: finalized.message,
      code: finalized.code,
    };
  }

  return { ok: true, status: 200, message: "completed" };
}

export async function reconcileCommerceOrderPayment(orderId: string): Promise<
  | { ok: true; message: string; order: CommerceOrderRecord; transitioned: boolean }
  | { ok: false; status: number; message: string; code?: string }
> {
  if (!isTossPaymentsConfigured()) {
    return {
      ok: false,
      status: 503,
      message: "Toss 결제 연동이 활성화되지 않았습니다.",
      code: "TOSS_NOT_CONFIGURED",
    };
  }

  const order = await deps().getOrder(orderId);
  if (!order) {
    return { ok: false, status: 404, message: "주문을 찾을 수 없습니다." };
  }

  if (order.paymentStatus === "completed") {
    return {
      ok: true,
      message: "이미 결제 완료 상태입니다.",
      order,
      transitioned: false,
    };
  }

  const paymentKey = order.paymentKey?.trim();
  if (!paymentKey) {
    return {
      ok: false,
      status: 400,
      message: "재확인할 paymentKey가 없습니다.",
      code: "NO_PAYMENT_KEY",
    };
  }

  const validation = validateOrderForPayment(order);
  if (!validation.ok) {
    return { ok: false, status: 400, message: validation.message };
  }

  const tossState = await resolveTossApprovedState({
    paymentKey,
    orderId,
    serverAmount: validation.finalAmount,
    skipConfirmCall: true,
  });

  if (!tossState.ok) {
    return {
      ok: false,
      status: tossState.status,
      message: tossState.message,
      code: tossState.code,
    };
  }

  const claim = await deps().claimOperation({ orderId, paymentKey });
  if (claim.ok && claim.outcome === "idempotent_completed") {
    return {
      ok: true,
      message: "이미 결제 완료 상태입니다.",
      order: claim.order,
      transitioned: false,
    };
  }
  if (!claim.ok && claim.code === "PAYMENT_KEY_BOUND_TO_OTHER_ORDER") {
    return {
      ok: false,
      status: claim.status,
      message: claim.message,
      code: claim.code,
    };
  }

  const finalized = await finalizeApprovedCommercePayment({
    orderId,
    paymentKey,
    approved: tossState.approved,
    source: "reconcile",
  });

  if (!finalized.ok) {
    return {
      ok: false,
      status: 503,
      message: finalized.message,
      code: finalized.code,
    };
  }

  return {
    ok: true,
    message: finalized.firstTransition ? "결제 상태를 동기화했습니다." : "이미 결제 완료 상태입니다.",
    order: finalized.order,
    transitioned: finalized.firstTransition,
  };
}
