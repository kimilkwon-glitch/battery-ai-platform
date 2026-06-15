/**
 * @deprecated 클라이언트 호출처 없음 — POST /api/order-requests/lookup 사용
 * GET — 410 Gone
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, _props: Props) {
  return NextResponse.json(
    {
      ok: false,
      message: "이 조회 API는 더 이상 사용되지 않습니다. 고객센터 상담 조회를 이용해 주세요.",
      deprecated: true,
    },
    { status: 410 },
  );
}
