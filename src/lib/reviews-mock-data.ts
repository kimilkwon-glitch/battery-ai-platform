/**
 * 리뷰 샘플 데이터 — 실제 고객 후기가 아님. 운영 데이터 연동 전 UI 검증용.
 * TODO: 실제 후기·블로그 사례 API/DB 연동
 */

import { batteryDetailHref } from "@/lib/canonical-battery-code";

export type ReviewBadgeId =
  | "deokcheon"
  | "hakjang"
  | "outbound"
  | "visit"
  | "delivery"
  | "agm"
  | "din"
  | "porter2"
  | "hybrid"
  | "discharge"
  | "slow_start";

export type ReviewItem = {
  id: string;
  rating: number;
  authorMasked: string;
  date: string;
  badges: ReviewBadgeId[];
  vehicle: string;
  batteryCode: string;
  body: string;
  operatorReply?: string;
  operatorSummary?: string;
  productHref: string;
  blogHref?: string;
};

export const REVIEW_BADGE_LABELS: Record<ReviewBadgeId, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
  outbound: "출장교체",
  visit: "매장방문",
  delivery: "택배주문",
  agm: "AGM",
  din: "DIN",
  porter2: "포터2",
  hybrid: "하이브리드",
  discharge: "방전",
  slow_start: "시동지연",
};

export const REVIEW_FILTER_OPTIONS: { id: "all" | ReviewBadgeId; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "deokcheon", label: "덕천점" },
  { id: "hakjang", label: "학장점" },
  { id: "outbound", label: "출장교체" },
  { id: "visit", label: "매장방문" },
  { id: "delivery", label: "택배주문" },
  { id: "agm", label: "AGM" },
  { id: "din", label: "DIN" },
  { id: "porter2", label: "포터2" },
  { id: "hybrid", label: "하이브리드" },
  { id: "discharge", label: "방전" },
  { id: "slow_start", label: "시동지연" },
];

/** 샘플 8건 — AGM95L·100R 교차 연결 없음 */
export const REVIEWS_MOCK: ReviewItem[] = [
  {
    id: "rv-1",
    rating: 5,
    authorMasked: "김*수",
    date: "2025-11-12",
    badges: ["deokcheon", "visit", "agm"],
    vehicle: "쏘렌토 MQ4",
    batteryCode: "AGM80L",
    body: "연식·ISG 여부를 먼저 확인해 주셔서 오주문 없이 교체했습니다. 매장 대기 시간도 짧았습니다.",
    operatorReply: "차종·연료·ISG 확인 후 장착 안내드렸습니다. 이용해 주셔서 감사합니다.",
    operatorSummary: "AGM80L · ISG 차량 매장 교체",
    productHref: batteryDetailHref("AGM80L"),
  },
  {
    id: "rv-2",
    rating: 5,
    authorMasked: "박*영",
    date: "2025-10-28",
    badges: ["hakjang", "outbound", "porter2"],
    vehicle: "포터2",
    batteryCode: "CMF100R",
    body: "100R 규격 확인 후 출장 교체했습니다. 단자 방향까지 다시 확인해 주셔서 안심했습니다.",
    operatorReply: "포터2 연식 기준 CMF100R 확인 후 출장 작업 완료.",
    operatorSummary: "CMF100R · 포터2 출장",
    productHref: batteryDetailHref("CMF100R"),
  },
  {
    id: "rv-3",
    rating: 4,
    authorMasked: "이*진",
    date: "2025-10-05",
    badges: ["hakjang", "delivery", "din"],
    vehicle: "그랜저 IG",
    batteryCode: "DIN74L",
    body: "택배 수령 전 규격·반납 여부를 전화로 다시 확인해 주셨습니다.",
    operatorSummary: "DIN74L · 택배 발송 전 확인",
    productHref: batteryDetailHref("DIN74L"),
  },
  {
    id: "rv-4",
    rating: 5,
    authorMasked: "최*미",
    date: "2025-09-20",
    badges: ["deokcheon", "outbound", "hybrid", "slow_start"],
    vehicle: "아반떼 CN7",
    batteryCode: "AGM60L",
    body: "시동 지연 증상으로 문의했고, ISG·AGM 규격을 설명해 주셔서 이해하기 쉬웠습니다.",
    productHref: batteryDetailHref("AGM60L"),
  },
  {
    id: "rv-5",
    rating: 5,
    authorMasked: "정*호",
    date: "2025-09-02",
    badges: ["deokcheon", "visit", "agm"],
    vehicle: "팰리세이드",
    batteryCode: "AGM95L",
    body: "대형 SUV AGM95L 교체. 다른 규격과 헷갈릴 수 있는 부분을 미리 안내해 주셨습니다.",
    operatorReply: "AGM95L 단독 규격 기준으로 안내·교체 완료.",
    productHref: batteryDetailHref("AGM95L"),
  },
  {
    id: "rv-6",
    rating: 4,
    authorMasked: "한*우",
    date: "2025-08-15",
    badges: ["hakjang", "visit", "discharge"],
    vehicle: "레이",
    batteryCode: "CMF80L",
    body: "블랙박스 방전으로 방문했습니다. 용량·단자 확인 후 교체했습니다.",
    productHref: batteryDetailHref("CMF80L"),
  },
  {
    id: "rv-7",
    rating: 5,
    authorMasked: "윤*아",
    date: "2025-07-30",
    badges: ["delivery", "agm"],
    vehicle: "스타리아",
    batteryCode: "AGM70L",
    body: "반납/미반납 옵션 설명이 명확해서 선택하기 편했습니다.",
    productHref: batteryDetailHref("AGM70L"),
  },
  {
    id: "rv-8",
    rating: 5,
    authorMasked: "오*석",
    date: "2025-07-08",
    badges: ["hakjang", "outbound", "porter2"],
    vehicle: "포터2",
    batteryCode: "GB100R",
    body: "로케트 GB100R로 교체. 라벨 사진 보내 확인 후 작업해 주셨습니다.",
    productHref: batteryDetailHref("GB100R"),
  },
];

export function reviewsForBatteryCode(code: string, limit = 3): ReviewItem[] {
  const norm = code.trim().toUpperCase();
  return REVIEWS_MOCK.filter((r) => r.batteryCode.toUpperCase() === norm).slice(0, limit);
}
