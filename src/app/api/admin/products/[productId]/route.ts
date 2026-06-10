import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import {
  getAdminProductDetail,
  pathSegmentToProductId,
} from "@/lib/admin/products/products-admin-service";
import {
  loadProductPriceHistory,
  saveProductOverride,
} from "@/lib/admin/products/product-overrides-store";
import type {
  AdminProductOverride,
  AdminProductReviewStatus,
  AdminProductSaleStatus,
} from "@/types/admin-product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteCtx = { params: Promise<{ productId: string }> };

function parsePatchBody(body: unknown): AdminProductOverride & { reason?: string } {
  const b = body as Record<string, unknown>;
  const patch: AdminProductOverride & { reason?: string } = {};

  if (typeof b.displayName === "string") patch.displayName = b.displayName;
  if (typeof b.adminName === "string") patch.adminName = b.adminName;
  if (typeof b.seoNameCandidate === "string") patch.seoNameCandidate = b.seoNameCandidate;
  if (typeof b.memo === "string") patch.memo = b.memo;
  if (typeof b.description === "string") patch.description = b.description;
  if (typeof b.cautions === "string") patch.cautions = b.cautions;

  if (b.internetPrice === null) patch.internetPrice = null;
  else if (typeof b.internetPrice === "number") patch.internetPrice = b.internetPrice;

  if (b.onsitePrice === null) patch.onsitePrice = null;
  else if (typeof b.onsitePrice === "number") patch.onsitePrice = b.onsitePrice;

  if (typeof b.visible === "boolean") patch.visible = b.visible;
  if (typeof b.sellable === "boolean") patch.sellable = b.sellable;

  const sale = b.saleStatus;
  if (sale === "selling" || sale === "hidden" || sale === "stopped") {
    patch.saleStatus = sale as AdminProductSaleStatus;
  }

  const review = b.reviewStatusOverride;
  const reviewStatuses: AdminProductReviewStatus[] = [
    "ok",
    "needs_review",
    "price_missing",
    "image_missing",
    "detail_missing",
    "notation_check",
    "sales_excluded",
  ];
  if (typeof review === "string" && reviewStatuses.includes(review as AdminProductReviewStatus)) {
    patch.reviewStatusOverride = review as AdminProductReviewStatus;
  }

  if (typeof b.reason === "string") patch.reason = b.reason;
  return patch;
}

export async function GET(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { productId: segment } = await ctx.params;
  const productId = pathSegmentToProductId(segment);
  const detail = getAdminProductDetail(productId);
  if (!detail) {
    return NextResponse.json({ ok: false, message: "제품을 찾을 수 없습니다." }, { status: 404 });
  }

  const history = loadProductPriceHistory(productId);
  return NextResponse.json({ ok: true, item: detail, priceHistory: history });
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { productId: segment } = await ctx.params;
  const productId = pathSegmentToProductId(segment);
  const existing = getAdminProductDetail(productId);
  if (!existing) {
    return NextResponse.json({ ok: false, message: "제품을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const patch = parsePatchBody(body);
    const { reason, ...overridePatch } = patch;
    const saved = saveProductOverride(productId, overridePatch, {
      changedBy: "admin",
      reason,
    });
    const detail = getAdminProductDetail(productId);
    return NextResponse.json({ ok: true, override: saved, item: detail });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
