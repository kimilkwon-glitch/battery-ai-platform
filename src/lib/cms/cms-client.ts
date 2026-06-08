import type { PublicMainBanner } from "@/types/main-banner";
import type { PaginatedResult } from "@/types/customer-review";
import type { PublicPromotionCard } from "@/types/promotion";
import type { ReviewItem } from "@/lib/reviews-mock-data";
import type { HomeReplacementStoryCard } from "@/lib/home-replacement-stories-data";
import type { HeroSlide } from "@/lib/hero-slides-data";

export async function apiFetchPublicBanners(): Promise<{
  ok: boolean;
  items: PublicMainBanner[];
  slides: HeroSlide[];
}> {
  const res = await fetch("/api/banners/public", { credentials: "include" });
  if (!res.ok) return { ok: false, items: [], slides: [] };
  return res.json();
}

export async function apiFetchPublicReviews(params?: {
  page?: number;
  limit?: number;
  mainOnly?: boolean;
  featuredOnly?: boolean;
  battery?: string;
}): Promise<{
  ok: boolean;
  items: ReviewItem[];
  storyCards: HomeReplacementStoryCard[];
  total: number;
  page: number;
  hasMore: boolean;
}> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.mainOnly) q.set("mainOnly", "1");
  if (params?.featuredOnly) q.set("featuredOnly", "1");
  if (params?.battery) q.set("battery", params.battery);
  const res = await fetch(`/api/reviews/public?${q}`, { credentials: "include" });
  if (!res.ok) {
    return { ok: false, items: [], storyCards: [], total: 0, page: 1, hasMore: false };
  }
  return res.json();
}

export async function apiFetchPublicPromotionsPaginated(params?: {
  page?: number;
  limit?: number;
  mainOnly?: boolean;
  benefitsOnly?: boolean;
}): Promise<{
  ok: boolean;
  items: PublicPromotionCard[];
  total: number;
  page: number;
  hasMore: boolean;
}> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.mainOnly) q.set("mainOnly", "1");
  if (params?.benefitsOnly) q.set("benefitsOnly", "1");
  const res = await fetch(`/api/promotions/public?${q}`, { credentials: "include" });
  if (!res.ok) return { ok: false, items: [], total: 0, page: 1, hasMore: false };
  return res.json();
}

export type { PaginatedResult };
