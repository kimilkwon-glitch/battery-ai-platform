import { NextResponse } from "next/server";
import {
  toCustomerOrderRequestLookup,
  validateLookupInput,
} from "@/lib/order-request/order-request-lookup";
import { lookupOrderRequest } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NOT_FOUND_MESSAGE =
  "주문번호와 연락처를 확인할 수 없습니다. 입력 정보를 다시 확인하거나 고객센터로 문의해 주세요.";

/**
 * POST — 상담 주문 요청 조회 (접수번호 + 연락처, 13차)
 * 연락처는 query string에 넣지 않음. 응답은 고객 공개 필드만.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 400 });
  }

  const validated = validateLookupInput(body);
  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, errors: validated.errors },
      { status: 422 },
    );
  }

  try {
    const record = await lookupOrderRequest(
      validated.requestNumber,
      validated.phone,
    );
    if (!record) {
      return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      lookup: toCustomerOrderRequestLookup(record),
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "조회 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
