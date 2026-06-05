import { Badge } from "@/components/ui/badge";
import type { AdminReviewStatus } from "@/types/admin";

const LABELS: Record<AdminReviewStatus, string> = {
  ok: "정상",
  needs_review: "확인 필요",
  terminal_check: "단자 확인",
  agm_check: "AGM 확인",
  sales_excluded: "판매 제외 확인",
  image_needed: "이미지 필요",
  db_fix_needed: "규격 검수 필요",
};

const VARIANTS: Record<
  AdminReviewStatus,
  "success" | "warning" | "danger" | "info" | "muted"
> = {
  ok: "success",
  needs_review: "warning",
  terminal_check: "warning",
  agm_check: "warning",
  sales_excluded: "muted",
  image_needed: "danger",
  db_fix_needed: "danger",
};

export function AdminReviewBadge({ status }: { status: AdminReviewStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
