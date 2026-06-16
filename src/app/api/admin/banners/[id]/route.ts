import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  countActiveMainBanners,
  deleteMainBanner,
  getMainBannerById,
  updateMainBanner,
} from "@/lib/cms/main-banner-store.postgres";
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

export async function DELETE(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  const existing = await getMainBannerById(id);
  if (!existing) {
    return NextResponse.json({ ok: false, message: "배너를 찾을 수 없습니다." }, { status: 404 });
  }
  const activeCount = await countActiveMainBanners();
  if (existing.status === "active" && activeCount <= 1) {
    return NextResponse.json(
      {
        ok: false,
        message: "노출 중인 배너가 1개뿐입니다. 삭제 전 숨김 처리하거나 다른 배너를 먼저 노출해 주세요.",
      },
      { status: 409 },
    );
  }
  const deleted = await deleteMainBanner(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, message: "배너 삭제에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id, blobDeleted: false });
}
