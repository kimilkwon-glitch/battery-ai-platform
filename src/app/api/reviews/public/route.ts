import { NextResponse } from "next/server";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import { reviewToReviewItem, reviewToStoryCard } from "@/lib/cms/cms-mappers";
import { listCustomerReviewsPaginated } from "@/lib/cms/customer-review-store.postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit")) || CONTENT_DISPLAY_LIMITS.reviewsPageSize),
  );
  const mainOnly = searchParams.get("mainOnly") === "1";
  const featuredOnly = searchParams.get("featuredOnly") === "1";
  const battery = searchParams.get("battery") ?? undefined;

  try {
    const result = await listCustomerReviewsPaginated(page, limit, {
      mainOnly,
      featuredOnly,
      batteryCode: battery,
    });
    return NextResponse.json({
      ok: true,
      items: result.items.map(reviewToReviewItem),
      storyCards: result.items.map(reviewToStoryCard),
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "후기를 불러오지 못했습니다.", items: [], storyCards: [], total: 0, page: 1, hasMore: false },
      { status: 500 },
    );
  }
}
