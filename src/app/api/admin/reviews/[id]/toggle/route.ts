import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { toggleCustomerReviewStatus } from "@/lib/cms/customer-review-store.postgres";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  const updated = await toggleCustomerReviewStatus(id);
  if (!updated) {
    return NextResponse.json({ ok: false, message: "후기를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: updated });
}
