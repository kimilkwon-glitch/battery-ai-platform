import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { previewProductCsvImport } from "@/lib/admin/products/product-csv";
import { buildAdminProductRows } from "@/lib/admin/products/products-admin-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { ok: false, message: "파일이 없습니다." },
        { status: 400 },
      );
    }
    const text = await file.text();
    const rows = previewProductCsvImport(text, buildAdminProductRows());
    return NextResponse.json({ ok: true, rows });
  } catch {
    return NextResponse.json(
      { ok: false, message: "CSV 검증에 실패했습니다." },
      { status: 500 },
    );
  }
}
