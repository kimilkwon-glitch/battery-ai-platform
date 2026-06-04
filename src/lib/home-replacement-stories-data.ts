import { HUB_REVIEWS, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";
import { storeLinks } from "@/lib/external-links";
export type HomeReplacementStoryCard = {
  id: string;
  authorLabel: string;
  vehicleLabel: string;
  rating: number;
  quote: string;
  badges: [string, string];
  workInfo: {
    placeLine: string;
    vehicleLine: string;
    batteryLine: string;
    servicesLine: string;
  };
  href: string;
};

/** 메인에 처음 노출할 후기 카드 수 (더보기로 전체 연결) */
export const HOME_REPLACEMENT_STORIES_VISIBLE_COUNT = 2;

export const HOME_REPLACEMENT_STORIES_TITLE = "배터리매니저에서 교체한 고객 이야기";

export const HOME_REPLACEMENT_STORIES_DESC =
  "덕천점·학장점에서 진행된 배터리 교체 경험을 확인해보세요. 방전·시동지연·장기주차 차량까지, 실제 작업 사례로 확인할 수 있습니다.";

export const HOME_REPLACEMENT_REVIEWS_HREF = HUB_REVIEWS;

/** 작업 사례 — 네이버 블로그(지점 운영 사례). 전용 사례 페이지 추가 시 교체 */
export const HOME_REPLACEMENT_WORK_CASES_HREF = storeLinks.deokcheon.blog;

/** 예시 후기 — 과장 수치 없음, 실제 리뷰 연동 시 이 목록을 데이터 소스로 교체 */
export const HOME_REPLACEMENT_STORY_CARDS: HomeReplacementStoryCard[] = [
  {
    id: "story-1",
    authorLabel: "김** 고객님",
    vehicleLabel: "현대 그랜저 IG",
    rating: 5,
    quote: "시동이 늦게 걸렸는데 점검 후 바로 교체해서 편했습니다.",
    badges: ["점검 결과를 바로 안내받았어요", "빠르게 교체해주셨어요"],
    workInfo: {
      placeLine: "덕천점 방문 교체",
      vehicleLine: "현대 그랜저 IG",
      batteryLine: "AGM80L",
      servicesLine: "엔진룸 기본 클리닝 · 워셔액 · 공기압 점검",
    },
    href: `${HUB_REVIEWS}?battery=AGM80L`,
  },
  {
    id: "story-2",
    authorLabel: "이** 고객님",
    vehicleLabel: "쏘렌토 MQ4",
    rating: 5,
    quote: "방전으로 연락드렸는데 시간 맞춰 출장 와주셔서 좋았습니다.",
    badges: ["원하는 장소에서 교체했어요", "친절하게 안내받았어요"],
    workInfo: {
      placeLine: "학장점 출장 교체",
      vehicleLine: "쏘렌토 MQ4",
      batteryLine: "AGM70L",
      servicesLine: "출장 교체 · 기본 점검",
    },
    href: `${HUB_REVIEWS}?battery=AGM70L`,
  },
  {
    id: "story-3",
    authorLabel: "박** 고객님",
    vehicleLabel: "기아 모닝 JA",
    rating: 5,
    quote: "퇴근 후에도 이용할 수 있어서 편했습니다.",
    badges: ["야간에도 이용 가능했어요", "픽업·반납이 편했어요"],
    workInfo: {
      placeLine: "학장점 야간 무인",
      vehicleLine: "기아 모닝 JA",
      batteryLine: "40L",
      servicesLine: "픽업·반납 · 야간 무인 교체",
    },
    href: HUB_STORE_ANCHORS.hakjang,
  },
];
