import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import {
  createCustomerReview,
  listCustomerReviewsAdmin,
} from "@/lib/cms/customer-review-store.postgres";
import type { CustomerReviewCreateInput } from "@/types/customer-review";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Number(searchParams.get("limit")) || CONTENT_DISPLAY_LIMITS.adminListPageSize;
  try {
    const result = await listCustomerReviewsAdmin(page, limit);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false, message: "후기 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const body = (await request.json()) as CustomerReviewCreateInput;
  if (!body.authorName?.trim() || !body.content?.trim()) {
    return NextResponse.json({ ok: false, message: "작성자와 후기 내용을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await createCustomerReview(body);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "후기를 저장하지 못했습니다." }, { status: 500 });
  }
}
