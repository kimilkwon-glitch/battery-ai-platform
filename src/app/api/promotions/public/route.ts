import { NextResponse } from "next/server";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import { listActivePromotions } from "@/lib/promotion/promotion-store.postgres";
import { toPublicPromotionCard } from "@/lib/promotion/promotion-public-mapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit")) || CONTENT_DISPLAY_LIMITS.benefitsPageSize),
  );
  const mainOnly = searchParams.get("mainOnly") === "1";
  const benefitsOnly = searchParams.get("benefitsOnly") === "1";

  try {
    const promos = await listActivePromotions();
    let filtered = promos
      .map((p) => toPublicPromotionCard(p))
      .filter((p) => p.displayStatus === "active");

    if (mainOnly) {
      filtered = filtered.filter((p) => p.showOnMain);
    } else if (benefitsOnly) {
      filtered = filtered.filter((p) => p.showOnBenefitsPage);
    } else {
      filtered = filtered.filter((p) => p.showOnMain || p.showOnBenefitsPage);
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      ok: true,
      items,
      total,
      page,
      limit,
      hasMore: offset + items.length < total,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "혜택 목록을 불러오지 못했습니다.", items: [], total: 0, page: 1, hasMore: false },
      { status: 500 },
    );
  }
}
