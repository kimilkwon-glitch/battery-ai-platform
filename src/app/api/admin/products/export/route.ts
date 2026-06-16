import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { productsToCsv } from "@/lib/admin/products/product-csv";
import { buildAdminProductRows } from "@/lib/admin/products/products-admin-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");

  try {
    let rows = await buildAdminProductRows();
    if (filter === "price_missing") {
      rows = rows.filter((r) => r.reviewStatus === "price_missing");
    } else if (filter === "image_missing") {
      rows = rows.filter((r) => !r.hasHeroImage);
    } else if (filter === "detail_missing") {
      rows = rows.filter((r) => !r.hasDetailPage);
    }

    const csv = productsToCsv(rows);
    const filename =
      filter === "price_missing"
        ? "products-price-missing.csv"
        : filter === "image_missing"
          ? "products-image-missing.csv"
          : filter === "detail_missing"
            ? "products-detail-missing.csv"
            : "products-export.csv";

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "CSV 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
