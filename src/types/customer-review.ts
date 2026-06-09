import type { ReviewBadgeId } from "@/lib/reviews-mock-data";

export type CustomerReviewStatus = "active" | "inactive" | "pending" | "hidden";

export type CustomerReviewSource = "own_store" | "naver_pay" | "admin_import";

export type CustomerReviewWorkInfo = {
  placeLine: string;
  vehicleLine: string;
  batteryLine: string;
  servicesLine: string;
};

export type CustomerReviewRecord = {
  id: string;
  authorName: string;
  vehicleName: string | null;
  branchName: string | null;
  serviceType: string | null;
  batteryCode: string | null;
  rating: number;
  content: string;
  summary: string | null;
  imageUrl: string | null;
  images: string[];
  badges: ReviewBadgeId[];
  homeBadges: string[];
  workInfo: CustomerReviewWorkInfo | null;
  operatorReply: string | null;
  operatorSummary: string | null;
  productHref: string | null;
  status: CustomerReviewStatus;
  featured: boolean;
  pinned: boolean;
  sortOrder: number;
  showOnMain: boolean;
  orderId: string | null;
  userId: string | null;
  reviewSource: CustomerReviewSource;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerReviewUpsertInput = Partial<
  Omit<CustomerReviewRecord, "id" | "createdAt" | "updatedAt">
>;

export type CustomerReviewCreateInput = CustomerReviewUpsertInput &
  Pick<CustomerReviewRecord, "authorName" | "content">;

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
