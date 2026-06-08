import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { getMainBannerById, updateMainBanner } from "@/lib/cms/main-banner-store.postgres";
import type { MainBannerUpsertInput } from "@/types/main-banner";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  const body = (await request.json()) as MainBannerUpsertInput;
  const updated = await updateMainBanner(id, body);
  if (!updated) {
    return NextResponse.json({ ok: false, message: "배너를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: updated });
}

export async function GET(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  const item = await getMainBannerById(id);
  if (!item) return NextResponse.json({ ok: false, message: "배너를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}
