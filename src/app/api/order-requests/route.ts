import { NextResponse } from "next/server";
import { operationalErrorResponse } from "@/lib/db/operational-api-errors";
import { validateCreateOrderRequestInput } from "@/lib/order-request/order-request-validation";
import { createOrderRequest } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 상담 주문 요청 생성 (11차)
 * 저장: Postgres (DATABASE_URL) · dev만 JSON fallback
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
  } catch (err) {
    return operationalErrorResponse(
      err,
      "접수 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      "order_requests",
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}
