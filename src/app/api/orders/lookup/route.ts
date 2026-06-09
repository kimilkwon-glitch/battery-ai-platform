import { NextResponse } from "next/server";
import { commerceOrderToGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import { storeCommerceOrderLookupByRef } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NOT_FOUND_MESSAGE =
  "주문번호와 연락처를 확인할 수 없습니다. 입력 정보를 다시 확인해 주세요.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const orderRef = String(b.orderId ?? b.orderNumber ?? "").trim();
  const phone = String(b.phone ?? "").trim();

  if (!orderRef || !phone) {
    return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 422 });
  }

  const inputDigits = normalizePhoneDigits(phone);
  if (inputDigits.length < 9) {
    return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 422 });
  }

  try {
    const record = await storeCommerceOrderLookupByRef(orderRef);
    if (!record) {
      return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    const storedDigits = normalizePhoneDigits(record.customerPhone);
    if (storedDigits !== inputDigits) {
      return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      lookup: commerceOrderToGuestLookupResult(record),
      orderId: record.orderId,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "조회 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
