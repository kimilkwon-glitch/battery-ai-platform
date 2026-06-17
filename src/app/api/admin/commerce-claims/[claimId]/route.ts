import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { isAdminTestCommerceOrder } from "@/lib/admin/admin-test-data-filter";
import {
  canApproveClaimRefund,
  REFUND_ELIGIBLE_CLAIM_STATUSES,
} from "@/lib/claims/claim-transition.server";
import {
  claimGetById,
  claimListHistories,
  claimTransitionStatus,
  claimUpdate,
} from "@/lib/claims/claim-store";
import { isPgRefundIntegrated, requestTossPaymentRefund } from "@/lib/payment/toss-refund-stub";
import { storeCommerceOrderGet, storeCommerceOrderUpdate } from "@/lib/payment/commerce-order-store";
import { hookAlimtalkClaimStatusChange } from "@/lib/notifications/alimtalk-hooks.server";
import type { ClaimStatus } from "@/types/commerce-claim";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ claimId: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { claimId } = await ctx.params;
  const claim = await claimGetById(claimId);
  if (!claim) {
    return NextResponse.json({ ok: false, message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }
  const histories = await claimListHistories(claimId);
  const order = await storeCommerceOrderGet(claim.orderId);
  return NextResponse.json({ ok: true, claim, histories, order });
}

async function applyRefundSideEffects(input: {
  claimId: string;
  existing: NonNullable<Awaited<ReturnType<typeof claimGetById>>>;
  adminMemo?: string;
  now: string;
}): Promise<{ pgRefunded: boolean; refundMessage: string }> {
  const order = await storeCommerceOrderGet(input.existing.orderId);
  if (!order) {
    return { pgRefunded: false, refundMessage: "연결된 주문을 찾을 수 없습니다." };
  }

  const isTestOrder = isAdminTestCommerceOrder({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    requestMemo: order.requestMemo,
    productName: order.productName,
  });

  const refundResult = isTestOrder
    ? {
        ok: false as const,
        stub: true as const,
        message: "테스트/검수 주문 — PG 환불 skip",
      }
    : await requestTossPaymentRefund({
        orderId: order.orderId,
        paymentKey: order.paymentKey,
        cancelAmount: input.existing.estimatedRefundAmount ?? order.finalAmount ?? 0,
        cancelReason: `클레임 ${input.existing.id}`,
      });

  const pgRefunded = refundResult.ok && !refundResult.stub;
  const historyNote = pgRefunded
    ? `PG 환불 완료 (${input.claimId})`
    : `클레임 내부 환불완료 표시 (${input.claimId}) — 실제 결제 취소/환불은 PG 관리자 또는 토스 연동 후 별도 처리`;

  await storeCommerceOrderUpdate(input.existing.orderId, {
    ...(pgRefunded
      ? { orderStatus: "refunded" as const, paymentStatus: "refunded" as const }
      : {}),
    statusHistory: [
      ...order.statusHistory,
      {
        status: pgRefunded ? "refunded" : order.orderStatus,
        paymentStatus: pgRefunded ? "refunded" : order.paymentStatus,
        note: historyNote,
        at: input.now,
      },
    ],
  });

  return { pgRefunded, refundMessage: refundResult.message };
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { claimId } = await ctx.params;
  let body: {
    claimStatus?: ClaimStatus;
    adminMemo?: string;
    customerReply?: string;
    needsCustomerNotice?: boolean;
    assignedTo?: string;
    actorName?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const existing = await claimGetById(claimId);
  if (!existing) {
    return NextResponse.json({ ok: false, message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  if (body.claimStatus === "REFUNDED" && existing.claimStatus === "REFUNDED") {
    const histories = await claimListHistories(claimId);
    const order = await storeCommerceOrderGet(existing.orderId);
    return NextResponse.json({
      ok: true,
      claim: existing,
      histories,
      order,
      message: "이미 환불 처리된 요청입니다.",
    });
  }

  const now = new Date().toISOString();

  if (body.claimStatus === "REFUNDED" && existing.claimStatus !== "REFUNDED") {
    const order = await storeCommerceOrderGet(existing.orderId);
    if (order && !canApproveClaimRefund(order.orderStatus)) {
      return NextResponse.json(
        {
          ok: false,
          message: "배송·완료 진행 중인 주문은 환불 승인할 수 없습니다. 주문 상태를 확인해 주세요.",
          code: "REFUND_ORDER_STATE_CONFLICT",
        },
        { status: 409 },
      );
    }

    const transition = await claimTransitionStatus(claimId, {
      expectedStatuses: REFUND_ELIGIBLE_CLAIM_STATUSES,
      nextStatus: "REFUNDED",
      patch: {
        adminMemo: body.adminMemo ?? existing.adminMemo,
        customerReply: body.customerReply ?? existing.customerReply,
        needsCustomerNotice: body.needsCustomerNotice ?? existing.needsCustomerNotice,
        assignedTo: body.assignedTo ?? existing.assignedTo,
        completedAt: now,
      },
      history: {
        previousStatus: existing.claimStatus,
        nextStatus: "REFUNDED",
        memo: body.adminMemo,
        actorType: "admin",
        actorName: body.actorName ?? "관리자",
      },
    });

    if (!transition.ok) {
      if (transition.claim?.claimStatus === "REFUNDED") {
        const histories = await claimListHistories(claimId);
        const linkedOrder = await storeCommerceOrderGet(existing.orderId);
        return NextResponse.json({
          ok: true,
          claim: transition.claim,
          histories,
          order: linkedOrder,
          message: "이미 환불 처리된 요청입니다.",
        });
      }
      return NextResponse.json(
        { ok: false, message: transition.message, code: transition.code },
        { status: transition.status },
      );
    }

    if (transition.transitioned) {
      const side = await applyRefundSideEffects({
        claimId,
        existing,
        adminMemo: body.adminMemo,
        now,
      });
      void side;
      const order = await storeCommerceOrderGet(transition.claim.orderId);
      if (order) {
        hookAlimtalkClaimStatusChange({
          order,
          claimId: transition.claim.id,
          claimStatus: "REFUNDED",
        });
      }
    }

    const histories = await claimListHistories(claimId);
    return NextResponse.json({ ok: true, claim: transition.claim, histories });
  }

  const patch: Parameters<typeof claimUpdate>[1] = {};
  if (body.adminMemo !== undefined) patch.adminMemo = body.adminMemo;
  if (body.customerReply !== undefined) patch.customerReply = body.customerReply;
  if (body.needsCustomerNotice !== undefined) patch.needsCustomerNotice = body.needsCustomerNotice;
  if (body.assignedTo !== undefined) patch.assignedTo = body.assignedTo;

  let history: Parameters<typeof claimUpdate>[2];
  if (body.claimStatus && body.claimStatus !== existing.claimStatus) {
    patch.claimStatus = body.claimStatus;
    if (body.claimStatus === "REVIEWING" && !existing.reviewedAt) {
      patch.reviewedAt = now;
    }
    if (["COMPLETED", "REFUNDED", "REJECTED"].includes(body.claimStatus)) {
      patch.completedAt = now;
    }
    history = {
      previousStatus: existing.claimStatus,
      nextStatus: body.claimStatus,
      memo: body.adminMemo,
      actorType: "admin",
      actorName: body.actorName ?? "관리자",
    };

    if (body.claimStatus === "APPROVED" && existing.claimType === "CANCEL") {
      const order = await storeCommerceOrderGet(existing.orderId);
      if (order) {
        const pgIntegrated = isPgRefundIntegrated();
        const paymentWasCompleted = order.paymentStatus === "completed";
        const cancelNote = pgIntegrated
          ? `클레임 취소 승인 (${claimId})`
          : `클레임 취소 승인 (${claimId}) — 주문 내부 취소 처리. 실제 결제 취소/환불은 PG 관리자 또는 토스 연동 후 별도 처리`;
        await storeCommerceOrderUpdate(existing.orderId, {
          orderStatus: "canceled",
          ...(pgIntegrated && paymentWasCompleted
            ? { paymentStatus: "canceled" as const }
            : {}),
          statusHistory: [
            ...order.statusHistory,
            {
              status: "canceled",
              paymentStatus:
                pgIntegrated && paymentWasCompleted ? "canceled" : order.paymentStatus,
              note: cancelNote,
              at: now,
            },
          ],
        });
      }
    }
  }

  try {
    const claim = await claimUpdate(claimId, patch, history);
    if (!claim) {
      return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
    }
    if (body.claimStatus && body.claimStatus !== existing.claimStatus) {
      const order = await storeCommerceOrderGet(claim.orderId);
      if (order) {
        hookAlimtalkClaimStatusChange({
          order,
          claimId: claim.id,
          claimStatus: body.claimStatus,
        });
      }
    }
    const histories = await claimListHistories(claimId);
    return NextResponse.json({ ok: true, claim, histories });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
