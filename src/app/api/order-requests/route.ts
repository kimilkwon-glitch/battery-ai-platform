import { NextResponse } from "next/server";
import { validateCreateOrderRequestInput } from "@/lib/order-request/order-request-validation";
import { createOrderRequest } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 상담 주문 요청 생성 (11차)
 * 저장: .data/order-requests.json (개발용, 운영 전 DB 교체 필요)
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["JSON 본문이 필요합니다."] }, { status: 400 });
  }

  const validated = validateCreateOrderRequestInput(body);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, errors: validated.errors }, { status: 422 });
  }

  try {
    const record = await createOrderRequest(validated.data);
    return NextResponse.json({
      ok: true,
      request: {
        id: record.id,
        requestNumber: record.requestNumber,
        status: record.status,
        createdAt: record.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["접수 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."] },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}
