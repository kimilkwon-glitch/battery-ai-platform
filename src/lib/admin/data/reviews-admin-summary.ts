import "server-only";

import { cache } from "react";
import { listCustomerReviewsAdmin } from "@/lib/cms/customer-review-store.postgres";
import type { CustomerReviewRecord } from "@/types/customer-review";

import { isAdminTestReview } from "@/lib/admin/dashboard-panel";

export type AdminReviewsSummary = {
  dbReady: boolean;
  newReviews: number;
  replyPending: number;
  lowRating: number;
  photoReviews: number;
  recentReviews: CustomerReviewRecord[];
  productionReviews: CustomerReviewRecord[];
};

async function loadAdminReviewsSummaryImpl(): Promise<AdminReviewsSummary> {
  try {
    const result = await listCustomerReviewsAdmin(1, 200);
    const production = result.items.filter((r) => !isAdminTestReview(r));
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const newReviews = production.filter(
      (r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active",
    ).length;
    const replyPending = production.filter((r) => !r.operatorReply?.trim() && r.status === "active")
      .length;
    const lowRating = production.filter((r) => r.rating <= 3 && r.status === "active").length;
    const photoReviews = production.filter(
      (r) => (r.images?.length ?? 0) > 0 || Boolean(r.imageUrl),
    ).length;

    return {
      dbReady: true,
      newReviews,
      replyPending,
      lowRating,
      photoReviews,
      recentReviews: production.slice(0, 5),
      productionReviews: production,
    };
  } catch {
    return {
      dbReady: false,
      newReviews: 0,
      replyPending: 0,
      lowRating: 0,
      photoReviews: 0,
      recentReviews: [],
      productionReviews: [],
    };
  }
}

export const loadAdminReviewsSummary = cache(loadAdminReviewsSummaryImpl);
