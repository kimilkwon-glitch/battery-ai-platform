import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { listPromotionUsages } from "@/lib/promotion/promotion-store.postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 100;

  try {
    const items = await listPromotionUsages(id, limit);
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json(
      { ok: false, message: "사용 내역을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
