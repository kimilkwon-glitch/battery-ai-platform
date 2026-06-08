import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { buildAdminProductRows } from "@/lib/admin/products/products-admin-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  try {
    const rows = buildAdminProductRows();
    return NextResponse.json({ ok: true, items: rows });
  } catch {
    return NextResponse.json(
      { ok: false, message: "제품 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
