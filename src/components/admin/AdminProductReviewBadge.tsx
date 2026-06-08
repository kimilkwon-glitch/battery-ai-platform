import { Badge } from "@/components/ui/badge";
import type { AdminProductReviewStatus, AdminProductSaleStatus } from "@/types/admin-product";

const REVIEW_LABELS: Record<AdminProductReviewStatus, string> = {
  ok: "정상",
  needs_review: "확인 필요",
  price_missing: "가격 누락",
  image_missing: "이미지 누락",
  detail_missing: "상세 누락",
  notation_check: "표기 확인",
  sales_excluded: "판매 제외",
};

const REVIEW_VARIANTS: Record<
  AdminProductReviewStatus,
  "success" | "warning" | "danger" | "info" | "muted"
> = {
  ok: "success",
  needs_review: "warning",
  price_missing: "danger",
  image_missing: "danger",
  detail_missing: "warning",
  notation_check: "warning",
  sales_excluded: "muted",
};

const SALE_LABELS: Record<AdminProductSaleStatus, string> = {
  selling: "판매중",
  hidden: "숨김",
  stopped: "판매중지",
};

export function AdminProductReviewBadge({ status }: { status: AdminProductReviewStatus }) {
  return <Badge variant={REVIEW_VARIANTS[status]}>{REVIEW_LABELS[status]}</Badge>;
}

export function AdminProductSaleBadge({ status }: { status: AdminProductSaleStatus }) {
  const variant =
    status === "selling" ? "success" : status === "hidden" ? "muted" : "warning";
  return <Badge variant={variant}>{SALE_LABELS[status]}</Badge>;
}
