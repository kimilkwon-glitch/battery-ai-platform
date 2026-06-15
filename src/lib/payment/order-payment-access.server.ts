import "server-only";

import { timingSafeEqualUtf8 } from "@/lib/admin/adminCredentials";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import {
  assertGuestOrderAccess,
  verifyGuestOrderPhoneProof,
} from "@/lib/security/guest-order-access.server";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export type OrderPaymentAccessProof = {
  paymentRequestId?: string | null;
  orderNumber?: string | null;
  phone?: string | null;
};

/**
 * 결제·주문 조회용 — 회원 소유권, paymentRequestId 일치, 또는 검증된 비회원 접근
 */
export async function assertOrderPaymentAccess(
  request: Request,
  order: CommerceOrderRecord,
  proof: OrderPaymentAccessProof = {},
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (session?.userId && order.userId && session.userId === order.userId) {
    return { ok: true };
  }

  if (await assertGuestOrderAccess(request, order.orderId)) {
    return { ok: true };
  }

  if (verifyGuestOrderPhoneProof(order, proof.phone, proof.orderNumber)) {
    return { ok: true };
  }

  const prid = proof.paymentRequestId?.trim();
  const stored = order.paymentRequestId?.trim();
  if (prid && stored && timingSafeEqualUtf8(prid, stored)) {
    return { ok: true };
  }

  return { ok: false, status: 403, message: "주문 정보를 확인할 수 없습니다." };
}

/** 비회원 클레임·조회용 — 전화번호 일치 */
export async function assertOrderGuestPhoneAccess(
  order: CommerceOrderRecord,
  phone?: string | null,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const inputDigits = normalizePhoneDigits(phone ?? "");
  const storedDigits = normalizePhoneDigits(order.customerPhone);
  if (inputDigits.length < 9 || inputDigits !== storedDigits) {
    return { ok: false, status: 403, message: "주문 정보를 확인할 수 없습니다." };
  }
  return { ok: true };
}
