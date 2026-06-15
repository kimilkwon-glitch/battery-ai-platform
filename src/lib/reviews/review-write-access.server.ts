import "server-only";

import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import { assertGuestOrderAccess } from "@/lib/security/guest-order-access.server";
import {
  storeCommerceOrderGet,
  storeCommerceOrderLookupByRef,
} from "@/lib/payment/commerce-order-store";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export type ReviewWriteAccessInput = {
  orderId?: string | null;
  orderNumber?: string | null;
  contact?: string | null;
};

export async function resolveReviewWriteOrder(
  request: Request,
  input: ReviewWriteAccessInput,
): Promise<
  { ok: true; order: CommerceOrderRecord } | { ok: false; status: number; message: string }
> {
  const session = await getVerifiedCustomerSessionFromRequest(request);
  let order = input.orderId?.trim() ? await storeCommerceOrderGet(input.orderId.trim()) : null;

  if (!order && input.orderNumber?.trim() && input.contact?.trim()) {
    const ref = await storeCommerceOrderLookupByRef(input.orderNumber.trim());
    const inputDigits = normalizePhoneDigits(input.contact.trim());
    const storedDigits = ref ? normalizePhoneDigits(ref.customerPhone) : "";
    if (ref && storedDigits === inputDigits) {
      order = ref;
    }
  }

  if (!order) {
    return { ok: false, status: 404, message: "주문 정보를 불러올 수 없습니다." };
  }

  if (session?.userId) {
    if (order.userId && order.userId !== session.userId) {
      return { ok: false, status: 403, message: "본인 주문만 확인할 수 있습니다." };
    }
    return { ok: true, order };
  }

  if (input.orderNumber?.trim() && input.contact?.trim()) {
    const inputDigits = normalizePhoneDigits(input.contact.trim());
    const storedDigits = normalizePhoneDigits(order.customerPhone);
    if (inputDigits.length >= 9 && inputDigits === storedDigits) {
      return { ok: true, order };
    }
  }

  if (await assertGuestOrderAccess(request, order.orderId, order)) {
    return { ok: true, order };
  }

  return { ok: false, status: 403, message: "후기 작성 권한이 없습니다." };
}
