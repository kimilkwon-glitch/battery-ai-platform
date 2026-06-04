import { HUB_REVIEWS, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";
import { storeLinks } from "@/lib/external-links";
import { REVIEWS_MOCK } from "@/lib/reviews-mock-data";
import { reviewPrimaryImage } from "@/lib/review-card-utils";

export type HomeReplacementStoryCard = {
  id: string;
  authorLabel: string;
  placeLabel: string;
  rating: number;
  quote: string;
  vehicle?: string;
  battery?: string;
  serviceLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  href: string;
};

const mockImage = (reviewId: string) => {
  const item = REVIEWS_MOCK.find((r) => r.id === reviewId);
  return item ? reviewPrimaryImage(item) : undefined;
};

/** 메인 교체 후기 쇼케이스 — 리뷰 목록 데이터와 연계(표시 문구는 메인용 요약) */
export const HOME_REPLACEMENT_STORIES_TITLE = "실제 교체 후기와 작업 사례";

export const HOME_REPLACEMENT_STORIES_DESC =
  "덕천점·학장점에서 진행된 실제 배터리 교체 경험을 확인해보세요. 차량별 교체 사례와 고객 후기를 함께 볼 수 있습니다.";

export const HOME_REPLACEMENT_REVIEWS_HREF = HUB_REVIEWS;

/** 작업 사례 — 네이버 블로그(지점 운영 사례). 전용 사례 페이지 추가 시 교체 */
export const HOME_REPLACEMENT_WORK_CASES_HREF = storeLinks.deokcheon.blog;

export const HOME_REPLACEMENT_STORY_CARDS: HomeReplacementStoryCard[] = [
  {
    id: "story-1",
    authorLabel: "김** 고객님",
    placeLabel: "덕천점 방문",
    rating: 5,
    quote: "시동이 늦게 걸렸는데 빠르게 점검받고 교체했습니다.",
    vehicle: "그랜저 IG",
    battery: "AGM80L",
    serviceLabel: "내방 교체",
    imageSrc: mockImage("rv-1") ?? "/assets/batteries/AGM80L/01-main.png",
    imageAlt: "그랜저 IG AGM80L 교체",
    href: `${HUB_REVIEWS}?battery=AGM80L`,
  },
  {
    id: "story-2",
    authorLabel: "이** 고객님",
    placeLabel: "학장점 출장",
    rating: 5,
    quote: "방전 때문에 연락드렸는데 시간 맞춰 출장 와주셔서 편했습니다.",
    vehicle: "쏘렌토 MQ4",
    battery: "AGM70L",
    serviceLabel: "출장 교체",
    imageSrc: mockImage("rv-1") ?? "/assets/batteries/AGM80L/01-main.png",
    imageAlt: "쏘렌토 MQ4 AGM70L 교체",
    href: `${HUB_REVIEWS}?battery=AGM70L`,
  },
  {
    id: "story-3",
    authorLabel: "박** 고객님",
    placeLabel: "학장점 야간 무인",
    rating: 5,
    quote: "퇴근 후에도 픽업할 수 있어서 편했습니다.",
    serviceLabel: "픽업·반납",
    imageSrc: "/assets/stores/hakjang.jpg",
    imageAlt: "학장점 야간 무인 시스템",
    href: HUB_STORE_ANCHORS.hakjang,
  },
];
