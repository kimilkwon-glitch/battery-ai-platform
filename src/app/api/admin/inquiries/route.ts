import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import type { InquiryCategory, InquiryStatus } from "@/types/customer-inquiry";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as InquiryStatus | "all" | null;
  const category = searchParams.get("category") as InquiryCategory | "all" | null;
  const q = searchParams.get("q");

  try {
    const items = await inquiryList({ status, category, q });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "문의 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
