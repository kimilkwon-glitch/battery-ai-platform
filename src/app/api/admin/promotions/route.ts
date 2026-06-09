import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import {
  countPromotionUsages,
  createPromotion,
  listPromotions,
} from "@/lib/promotion/promotion-store.postgres";
import { seedDefaultPromotions } from "@/lib/promotion/seed-default-promotions";
import type { PromotionCreateInput } from "@/types/promotion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  try {
    await seedDefaultPromotions();
    const items = await listPromotions();
    const withUsage = await Promise.all(
      items.map(async (p) => ({
        ...p,
        usageCount: await countPromotionUsages(p.id),
      })),
    );
    return NextResponse.json({ ok: true, items: withUsage });
  } catch {
    return NextResponse.json(
      { ok: false, message: "혜택 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  let body: PromotionCreateInput;
  try {
    body = (await request.json()) as PromotionCreateInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "혜택명을 입력해 주세요." }, { status: 400 });
  }

  if (!body.type || !body.discountType || body.discountValue == null) {
    return NextResponse.json({ ok: false, message: "할인 정보를 입력해 주세요." }, { status: 400 });
  }

  if (body.type === "coupon_code" && !body.code?.trim()) {
    return NextResponse.json({ ok: false, message: "쿠폰코드를 입력해 주세요." }, { status: 400 });
  }

  try {
    const created = await createPromotion(body);
    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("unique") ? "이미 사용 중인 쿠폰코드입니다." : "혜택을 저장하지 못했습니다.";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
