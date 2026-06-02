import type { ReviewBadgeId, ReviewItem } from "@/lib/reviews-mock-data";

/** 메인 탭 — 작업 유형 중심 */
export type ReviewMainFilterId = "all" | "outbound" | "visit" | "self";

export const REVIEW_MAIN_FILTER_OPTIONS: { id: ReviewMainFilterId; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "outbound", label: "출장방문" },
  { id: "visit", label: "매장방문" },
  { id: "self", label: "셀프교체" },
];

/** 2차 칩 — 지점·규격·증상 (메인 필터보다 작게) */
export const REVIEW_TOPIC_FILTER_OPTIONS: { id: ReviewBadgeId; label: string }[] = [
  { id: "deokcheon", label: "덕천점" },
  { id: "hakjang", label: "학장점" },
  { id: "agm", label: "AGM" },
  { id: "din", label: "DIN" },
  { id: "porter2", label: "포터2" },
  { id: "hybrid", label: "하이브리드" },
  { id: "discharge", label: "방전" },
  { id: "slow_start", label: "시동지연" },
];

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

export function reviewMatchesTopicFilter(item: ReviewItem, topic: ReviewBadgeId | null): boolean {
  if (!topic) return true;
  return item.badges.includes(topic);
}
