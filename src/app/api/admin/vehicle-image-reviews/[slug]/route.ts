import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { upsertVehicleImageReview } from "@/lib/vehicle-image-review-store";
import type { VehicleImageReviewStatus } from "@/lib/vehicle-image-review-shared";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { slug } = await ctx.params;
  let body: {
    status?: VehicleImageReviewStatus;
    adminMemo?: string;
    selectedReferenceUrl?: string | null;
    candidateImageUrl?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.status && body.adminMemo === undefined) {
    return NextResponse.json({ ok: false, message: "변경할 항목이 없습니다." }, { status: 400 });
  }

  try {
    const item = await upsertVehicleImageReview({
      slug,
      status: body.status ?? "reviewing",
      adminMemo: body.adminMemo ?? "",
      selectedReferenceUrl: body.selectedReferenceUrl,
      candidateImageUrl: body.candidateImageUrl,
    });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
