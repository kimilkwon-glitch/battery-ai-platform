import { NextResponse } from "next/server";
import { getOrderRequestById } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/**
 * GET — 고객 단건 조회 (lookup token은 12차)
 */
export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "조회 토큰이 필요합니다." },
      { status: 401 },
    );
  }

  const record = await getOrderRequestById(id);
  if (!record) {
    return NextResponse.json({ ok: false, message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    request: {
      requestNumber: record.requestNumber,
      status: record.status,
      createdAt: record.createdAt,
      batterySpecSummary: record.batterySpecSummary,
    },
  });
}
