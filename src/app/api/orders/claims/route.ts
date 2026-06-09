import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { claimCreate, claimListByOrderId } from "@/lib/claims/claim-store";
import { estimateClaimRefundAmount } from "@/lib/claims/claim-refund-estimate";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import {
  storeCommerceOrderGet,
  storeCommerceOrderLookupByRef,
} from "@/lib/payment/commerce-order-store";
import type { ClaimReasonCode, ClaimType } from "@/types/commerce-claim";

export const dynamic = "force-dynamic";

type PostBody = {
  orderId?: string;
  orderNumber?: string;
  phone?: string;
  claimType?: ClaimType;
  reasonCode?: ClaimReasonCode;
  reasonText?: string;
  customerMessage?: string;
  customerName?: string;
  customerPhone?: string;
  attachmentUrls?: string[];
};

async function resolveOrder(body: PostBody) {
  if (body.orderId?.trim()) {
    return storeCommerceOrderGet(body.orderId.trim());
  }
  const ref = body.orderNumber?.trim();
  const phone = body.phone?.trim();
  if (!ref || !phone) return null;
  const record = await storeCommerceOrderLookupByRef(ref);
  if (!record) return null;
  const inputDigits = normalizePhoneDigits(phone);
  const storedDigits = normalizePhoneDigits(record.customerPhone);
  if (inputDigits.length < 9 || inputDigits !== storedDigits) return null;
  return record;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, message: "주문 정보가 필요합니다." }, { status: 400 });
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  const order = await storeCommerceOrderGet(orderId);
  if (!order) {
    return NextResponse.json({ ok: false, message: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  if (session?.userId) {
    if (order.userId && order.userId !== session.userId) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
    }
  }

  const claims = await claimListByOrderId(orderId);
  const publicClaims = claims.map((c) => ({
    id: c.id,
    claimType: c.claimType,
    claimStatus: c.claimStatus,
    reasonCode: c.reasonCode,
    customerMessage: c.customerMessage,
    customerReply: c.customerReply,
    requestedAt: c.requestedAt,
    updatedAt: c.updatedAt,
  }));
  return NextResponse.json({ ok: true, claims: publicClaims });
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.claimType || !body.reasonCode || !body.customerMessage?.trim()) {
    return NextResponse.json({ ok: false, message: "필수 항목을 입력해 주세요." }, { status: 400 });
  }
  if (!body.customerPhone?.trim()) {
    return NextResponse.json({ ok: false, message: "연락처를 입력해 주세요." }, { status: 400 });
  }

  const order = await resolveOrder(body);
  if (!order) {
    return NextResponse.json({ ok: false, message: "주문을 확인할 수 없습니다." }, { status: 404 });
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (session?.userId && order.userId && order.userId !== session.userId) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const claim = await claimCreate({
      order,
      claimType: body.claimType,
      reasonCode: body.reasonCode,
      reasonText: body.reasonText,
      customerMessage: body.customerMessage,
      customerName: body.customerName?.trim() || order.customerName,
      customerPhone: body.customerPhone.trim(),
      attachmentUrls: body.attachmentUrls,
      estimatedRefundAmount: estimateClaimRefundAmount(order),
    });
    return NextResponse.json({ ok: true, claimId: claim.id });
  } catch {
    return NextResponse.json({ ok: false, message: "요청 접수에 실패했습니다." }, { status: 500 });
  }
}
