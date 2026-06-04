import type { ReviewBadgeId, ReviewItem } from "@/lib/reviews-mock-data";

/** 메인 탭 — 작업 유형 중심 */
export type ReviewMainFilterId = "all" | "outbound" | "visit" | "self";

export const REVIEW_MAIN_FILTER_OPTIONS: { id: ReviewMainFilterId; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "outbound", label: "출장 교체" },
  { id: "visit", label: "매장 방문" },
  { id: "self", label: "직접 교체" },
];

/** 2차 칩 — 고객 후기 성격 (메인 필터보다 작게) */
export const REVIEW_MOOD_FILTER_OPTIONS: { id: ReviewBadgeId; label: string }[] = [
  { id: "affordable", label: "가격이 합리적이에요" },
  { id: "good_value", label: "가격 대비 만족" },
  { id: "kind", label: "친절한 안내" },
  { id: "easy_explain", label: "설명이 쉬웠어요" },
  { id: "fast_fix", label: "빠른 작업" },
  { id: "revisit", label: "비용 안내가 명확했어요" },
  { id: "spec_easy", label: "규격 확인이 편했어요" },
  { id: "accurate_consult", label: "상담이 정확했어요" },
];

/** @deprecated REVIEW_MOOD_FILTER_OPTIONS 사용 */
export const REVIEW_TOPIC_FILTER_OPTIONS = REVIEW_MOOD_FILTER_OPTIONS;

const MOOD_BADGE_IDS = new Set<ReviewBadgeId>([
  "affordable",
  "good_value",
  "kind",
  "easy_explain",
  "fast_fix",
  "revisit",
  "spec_easy",
  "accurate_consult",
]);

const BRANCH_BADGE_IDS = new Set<ReviewBadgeId>(["deokcheon", "hakjang"]);
const SERVICE_BADGE_IDS = new Set<ReviewBadgeId>(["outbound", "visit", "delivery"]);
export function isReviewMoodBadge(id: ReviewBadgeId): boolean {
  return MOOD_BADGE_IDS.has(id);
}

export function reviewMatchesMainFilter(item: ReviewItem, filter: ReviewMainFilterId): boolean {
  if (filter === "all") return true;
  if (filter === "outbound") return item.badges.includes("outbound");
  if (filter === "visit") return item.badges.includes("visit");
  return item.badges.includes("delivery");
}

/** 카드 노출용 — 지점·작업유형 + 후기 성격 태그만 (최대 4개) */
export function reviewCardDisplayBadgeIds(badges: ReviewBadgeId[]): ReviewBadgeId[] {
  const branch = badges.filter((b) => BRANCH_BADGE_IDS.has(b));
  const service = badges.filter((b) => SERVICE_BADGE_IDS.has(b));
  const mood = badges.filter((b) => MOOD_BADGE_IDS.has(b));
  const ordered = [...branch.slice(0, 1), ...service.slice(0, 1), ...mood.slice(0, 2)];
  return ordered.slice(0, 4);
}

export function reviewMatchesMoodFilter(item: ReviewItem, mood: ReviewBadgeId | null): boolean {
  if (!mood) return true;
  return item.badges.includes(mood);
}

/** @deprecated reviewMatchesMoodFilter 사용 */
export function reviewMatchesTopicFilter(item: ReviewItem, topic: ReviewBadgeId | null): boolean {
  return reviewMatchesMoodFilter(item, topic);
}
