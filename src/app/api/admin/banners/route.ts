import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import { createMainBanner, listMainBannersPaginated } from "@/lib/cms/main-banner-store.postgres";
import type { MainBannerCreateInput } from "@/types/main-banner";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Number(searchParams.get("limit")) || CONTENT_DISPLAY_LIMITS.adminListPageSize;
  try {
    const result = await listMainBannersPaginated(page, limit);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false, message: "배너 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: MainBannerCreateInput;
  try {
    body = (await request.json()) as MainBannerCreateInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "배너 제목을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await createMainBanner(body);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "배너를 저장하지 못했습니다." }, { status: 500 });
  }
}
