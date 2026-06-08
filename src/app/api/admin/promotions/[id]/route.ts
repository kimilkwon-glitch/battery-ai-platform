import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import {
  countPromotionUsages,
  getPromotionById,
  updatePromotion,
} from "@/lib/promotion/promotion-store.postgres";
import type { PromotionUpsertInput } from "@/types/promotion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { id } = await params;
  const item = await getPromotionById(id);
  if (!item) {
    return NextResponse.json({ ok: false, message: "혜택을 찾을 수 없습니다." }, { status: 404 });
  }

  const usageCount = await countPromotionUsages(id);
  return NextResponse.json({ ok: true, item: { ...item, usageCount } });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { id } = await params;
  let body: PromotionUpsertInput;
  try {
    body = (await request.json()) as PromotionUpsertInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const updated = await updatePromotion(id, body);
    if (!updated) {
      return NextResponse.json({ ok: false, message: "혜택을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item: updated });
  } catch {
    return NextResponse.json({ ok: false, message: "혜택을 저장하지 못했습니다." }, { status: 500 });
  }
}
