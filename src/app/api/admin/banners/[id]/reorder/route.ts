import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { reorderMainBanner } from "@/lib/cms/main-banner-store.postgres";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  let body: { direction?: "up" | "down" };
  try {
    body = (await request.json()) as { direction?: "up" | "down" };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (body.direction !== "up" && body.direction !== "down") {
    return NextResponse.json({ ok: false, message: "direction은 up 또는 down이어야 합니다." }, { status: 400 });
  }
  try {
    const items = await reorderMainBanner(id, body.direction);
    if (!items) {
      return NextResponse.json({ ok: false, message: "배너를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "순서 변경에 실패했습니다." }, { status: 500 });
  }
}
