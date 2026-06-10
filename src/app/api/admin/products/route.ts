import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { encodeProductId } from "@/lib/admin/products/product-id";
import {
  buildAdminProductRows,
  getAdminProductDetail,
} from "@/lib/admin/products/products-admin-service";
import { saveProductOverride } from "@/lib/admin/products/product-overrides-store";
import type { AdminProductBrand, AdminProductSaleStatus } from "@/types/admin-product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BRANDS: AdminProductBrand[] = ["rocket", "solite", "delco", "atlas"];
const SALE_STATUSES: AdminProductSaleStatus[] = ["selling", "hidden", "stopped"];

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const brand = body.brand as AdminProductBrand;
    const batteryCode = typeof body.batteryCode === "string" ? body.batteryCode.trim().toUpperCase() : "";
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";

    if (!BRANDS.includes(brand) || !batteryCode || !displayName) {
      return NextResponse.json(
        { ok: false, message: "브랜드, 규격, 상품명은 필수입니다." },
        { status: 400 },
      );
    }

    const productId = encodeProductId(brand, batteryCode);
    const saleStatus =
      typeof body.saleStatus === "string" && SALE_STATUSES.includes(body.saleStatus as AdminProductSaleStatus)
        ? (body.saleStatus as AdminProductSaleStatus)
        : "selling";

    saveProductOverride(
      productId,
      {
        displayName,
        adminName: typeof body.adminName === "string" ? body.adminName.trim() : displayName,
        internetPrice:
          body.internetPrice === null
            ? null
            : typeof body.internetPrice === "number"
              ? body.internetPrice
              : undefined,
        onsitePrice:
          body.onsitePrice === null
            ? null
            : typeof body.onsitePrice === "number"
              ? body.onsitePrice
              : undefined,
        saleStatus,
        visible: typeof body.visible === "boolean" ? body.visible : true,
        sellable: typeof body.sellable === "boolean" ? body.sellable : saleStatus === "selling",
        description: typeof body.description === "string" ? body.description : "",
        memo: typeof body.memo === "string" ? body.memo : "",
      },
      { changedBy: "admin", reason: "제품 등록" },
    );

    const detail = getAdminProductDetail(productId);
    return NextResponse.json({ ok: true, item: detail });
  } catch {
    return NextResponse.json({ ok: false, message: "제품 등록에 실패했습니다." }, { status: 500 });
  }
}

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
