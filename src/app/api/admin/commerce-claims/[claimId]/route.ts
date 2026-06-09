import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  claimGetById,
  claimListHistories,
  claimUpdate,
} from "@/lib/claims/claim-store";
import { isPgRefundIntegrated, requestTossPaymentRefund } from "@/lib/payment/toss-refund-stub";
import { storeCommerceOrderGet, storeCommerceOrderUpdate } from "@/lib/payment/commerce-order-store";
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

  const patch: Parameters<typeof claimUpdate>[1] = {};
  if (body.adminMemo !== undefined) patch.adminMemo = body.adminMemo;
  if (body.customerReply !== undefined) patch.customerReply = body.customerReply;
  if (body.needsCustomerNotice !== undefined) patch.needsCustomerNotice = body.needsCustomerNotice;
  if (body.assignedTo !== undefined) patch.assignedTo = body.assignedTo;

  let history: Parameters<typeof claimUpdate>[2];
  if (body.claimStatus && body.claimStatus !== existing.claimStatus) {
    patch.claimStatus = body.claimStatus;
    const now = new Date().toISOString();
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

    if (body.claimStatus === "REFUNDED") {
      const order = await storeCommerceOrderGet(existing.orderId);
      if (order) {
        const refundResult = await requestTossPaymentRefund({
          orderId: order.orderId,
          paymentKey: order.paymentKey,
          cancelAmount: existing.estimatedRefundAmount ?? order.finalAmount ?? 0,
          cancelReason: `클레임 ${existing.id}`,
        });
        const pgRefunded = refundResult.ok && !refundResult.stub;
        const historyNote = pgRefunded
          ? `PG 환불 완료 (${claimId})`
          : `클레임 내부 환불완료 표시 (${claimId}) — 실제 결제 취소/환불은 PG 관리자 또는 토스 연동 후 별도 처리`;
        if (history) {
          history.memo = history.memo
            ? `${history.memo}\n${refundResult.message}`
            : refundResult.message;
        }
        await storeCommerceOrderUpdate(existing.orderId, {
          ...(pgRefunded
            ? { orderStatus: "refunded" as const, paymentStatus: "refunded" as const }
            : {}),
          statusHistory: [
            ...order.statusHistory,
            {
              status: pgRefunded ? "refunded" : order.orderStatus,
              paymentStatus: pgRefunded ? "refunded" : order.paymentStatus,
              note: historyNote,
              at: now,
            },
          ],
        });
      }
    }
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
    const histories = await claimListHistories(claimId);
    return NextResponse.json({ ok: true, claim, histories });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
