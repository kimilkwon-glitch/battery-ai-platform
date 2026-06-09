import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { listVehicleImageReviews } from "@/lib/vehicle-image-review-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  try {
    const items = await listVehicleImageReviews();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "검수 상태를 불러오지 못했습니다." }, { status: 500 });
  }
}
