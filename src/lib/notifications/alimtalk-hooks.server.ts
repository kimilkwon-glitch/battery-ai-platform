import "server-only";

import { isAdminTestCommerceOrder } from "@/lib/admin/admin-test-data-filter";
import { isMemberProfileCompleteForCheckout } from "@/lib/auth/member-profile-complete";
import type { MemberRecord } from "@/lib/auth/member-types";
import { sendAlimtalkEvent } from "@/lib/notifications/alimtalk-service";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import { CLAIM_STATUS_LABELS } from "@/types/commerce-claim";
import type { ClaimStatus } from "@/types/commerce-claim";

function scheduleAlimtalk(task: Promise<unknown>): void {
  void task.catch((err) => {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[alimtalk] background task failed:", msg);
  });
}

function shouldSkipAlimtalkForOrder(order: {
  orderNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  requestMemo?: string | null;
  productName?: string | null;
}): boolean {
  return isAdminTestCommerceOrder({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    requestMemo: order.requestMemo,
    productName: order.productName,
  });
}

export function hookAlimtalkSignup(member: Pick<MemberRecord, "id" | "phone" | "name">): void {
  scheduleAlimtalk(
    sendAlimtalkEvent({
      eventType: "signup",
      entityType: "member",
      entityId: member.id,
      phone: member.phone,
      recipientName: member.name,
      userId: member.id,
    }),
  );
}

export function hookAlimtalkProfileCompleted(
  before: Pick<MemberRecord, "name" | "phone" | "zonecode" | "address" | "detailAddress"> | null,
  after: MemberRecord,
): void {
  const wasComplete = before ? isMemberProfileCompleteForCheckout(before) : false;
  const isComplete = isMemberProfileCompleteForCheckout(after);
  if (!wasComplete && isComplete) {
    hookAlimtalkSignup(after);
  }
}

export function hookAlimtalkOrderCreated(order: CommerceOrderRecord): void {
  if (shouldSkipAlimtalkForOrder(order)) return;
  scheduleAlimtalk(
    sendAlimtalkEvent({
      eventType: "order_created",
      entityType: "order",
      entityId: order.orderId,
      orderId: order.orderId,
      userId: order.userId ?? null,
      phone: order.customerPhone,
      recipientName: order.customerName,
      variables: {
        orderNumber: order.orderNumber,
        productName: order.productName,
        paymentAmount: order.paidAmount ?? order.finalAmount,
      },
    }),
  );
}

export function hookAlimtalkOrderConfirmed(order: CommerceOrderRecord): void {
  if (shouldSkipAlimtalkForOrder(order)) return;
  scheduleAlimtalk(
    sendAlimtalkEvent({
      eventType: "order_confirmed",
      entityType: "order",
      entityId: order.orderId,
      orderId: order.orderId,
      userId: order.userId ?? null,
      phone: order.customerPhone,
      recipientName: order.customerName,
      variables: {
        orderNumber: order.orderNumber,
        productName: order.productName,
      },
    }),
  );
}

export function hookAlimtalkOrderShipped(
  order: CommerceOrderRecord,
  carrier: string,
  trackingNumber: string,
): void {
  if (shouldSkipAlimtalkForOrder(order)) return;
  scheduleAlimtalk(
    sendAlimtalkEvent({
      eventType: "order_shipped",
      entityType: "order",
      entityId: order.orderId,
      orderId: order.orderId,
      userId: order.userId ?? null,
      phone: order.customerPhone,
      recipientName: order.customerName,
      variables: {
        orderNumber: order.orderNumber,
        carrier,
        trackingNumber,
      },
    }),
  );
}

export function hookAlimtalkCancelRefund(input: {
  order: Pick<
    CommerceOrderRecord,
    "orderId" | "orderNumber" | "customerPhone" | "customerName" | "userId"
  > & {
    requestMemo?: string | null;
    productName?: string | null;
  };
  processStatus: string;
  entityType: "order" | "claim";
  entityId: string;
}): void {
  if (shouldSkipAlimtalkForOrder(input.order)) return;
  scheduleAlimtalk(
    sendAlimtalkEvent({
      eventType: "cancel_refund",
      entityType: input.entityType,
      entityId: input.entityId,
      orderId: input.order.orderId,
      userId: input.order.userId ?? null,
      phone: input.order.customerPhone,
      recipientName: input.order.customerName,
      variables: {
        orderNumber: input.order.orderNumber,
        processStatus: input.processStatus,
      },
    }),
  );
}

export function claimStatusAlimtalkLabel(status: ClaimStatus): string {
  return CLAIM_STATUS_LABELS[status] ?? status;
}

export function hookAlimtalkOrderCanceled(order: CommerceOrderRecord): void {
  hookAlimtalkCancelRefund({
    order,
    processStatus: "주문 취소",
    entityType: "order",
    entityId: `${order.orderId}:canceled`,
  });
}

export function hookAlimtalkOrderRefunded(order: CommerceOrderRecord): void {
  hookAlimtalkCancelRefund({
    order,
    processStatus: "환불 완료",
    entityType: "order",
    entityId: `${order.orderId}:refunded`,
  });
}

export function hookAlimtalkClaimStatusChange(input: {
  order: Pick<
    CommerceOrderRecord,
    "orderId" | "orderNumber" | "customerPhone" | "customerName" | "userId"
  > & {
    requestMemo?: string | null;
    productName?: string | null;
  };
  claimId: string;
  claimStatus: ClaimStatus;
}): void {
  hookAlimtalkCancelRefund({
    order: input.order,
    processStatus: claimStatusAlimtalkLabel(input.claimStatus),
    entityType: "claim",
    entityId: `${input.claimId}:${input.claimStatus}`,
  });
}
