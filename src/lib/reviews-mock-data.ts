/**
 * 리뷰 목록 데이터 — 운영 DB 연동 전 정적 후기 카드용.
 * images 없음/빈 배열이면 카드에 이미지 영역을 렌더하지 않음.
 */

import { batteryDetailHref } from "@/lib/canonical-battery-code";

export type ReviewBranchName = "덕천점" | "학장점";
export type ReviewServiceType = "내방교체" | "출장교체" | "택배주문";

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

/** 고객 후기 카드 — 사진은 선택( images ) */
export type ReviewItem = {
  id: string;
  rating: number;
  customerName?: string;
  vehicleName?: string;
  branchName?: ReviewBranchName;
  serviceType?: ReviewServiceType;
  batteryCode?: string;
  content: string;
  images?: string[];
  createdAt?: string;
  badges: ReviewBadgeId[];
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

const REVIEW_PHOTO = {
  agm80lMain: "/assets/batteries/AGM80L/01-main.png",
  agm80lLabel: "/assets/batteries/AGM80L/07-front-label.png",
  agm95lMain: "/assets/batteries/AGM95L/01-main.jpg",
  cmf100rMain: "/assets/batteries/CMF100R/01-main.png",
  cmf100rLabel: "/assets/batteries/CMF100R/07-front-label.png",
  gb100rMain: "/assets/batteries/GB100R/01-main.png",
  deokcheon: "/assets/stores/deokcheon.jpg",
  hakjang: "/assets/stores/hakjang.jpg",
} as const;

/** 고객 후기 카드 — AGM95L·100R 직접 비교 CTA 없음 */
export const REVIEWS_MOCK: ReviewItem[] = [
  {
    id: "rv-1",
    rating: 5,
    customerName: "김*수",
    createdAt: "2025-11-12",
    branchName: "덕천점",
    serviceType: "내방교체",
    badges: ["deokcheon", "visit", "agm"],
    vehicleName: "쏘렌토 MQ4",
    batteryCode: "AGM80L",
    content:
      "연식·ISG 여부를 먼저 확인해 주셔서 오주문 없이 교체했습니다. 매장 대기 시간도 짧았습니다.",
    images: [
      REVIEW_PHOTO.agm80lMain,
      REVIEW_PHOTO.agm80lLabel,
      REVIEW_PHOTO.agm95lMain,
      REVIEW_PHOTO.deokcheon,
      REVIEW_PHOTO.cmf100rMain,
    ],
    operatorReply: "차종·연료·ISG 확인 후 장착 안내드렸습니다. 이용해 주셔서 감사합니다.",
    operatorSummary: "AGM80L · ISG 차량 매장 교체",
    productHref: batteryDetailHref("AGM80L"),
  },
  {
    id: "rv-2",
    rating: 5,
    customerName: "박*영",
    createdAt: "2025-10-28",
    branchName: "학장점",
    serviceType: "출장교체",
    badges: ["hakjang", "outbound", "porter2"],
    vehicleName: "포터2",
    batteryCode: "CMF100R",
    content:
      "100R 규격 확인 후 출장 교체했습니다. 단자 방향까지 다시 확인해 주셔서 안심했습니다.",
    images: [REVIEW_PHOTO.cmf100rMain, REVIEW_PHOTO.cmf100rLabel, REVIEW_PHOTO.hakjang],
    operatorReply: "포터2 연식 기준 CMF100R 확인 후 출장 작업 완료.",
    operatorSummary: "CMF100R · 포터2 출장",
    productHref: batteryDetailHref("CMF100R"),
  },
  {
    id: "rv-3",
    rating: 4,
    customerName: "이*진",
    createdAt: "2025-10-05",
    branchName: "학장점",
    serviceType: "택배주문",
    badges: ["hakjang", "delivery", "din"],
    vehicleName: "그랜저 IG",
    batteryCode: "DIN74L",
    content: "택배 수령 전 규격·반납 여부를 전화로 다시 확인해 주셨습니다.",
    operatorSummary: "DIN74L · 택배 발송 전 확인",
    productHref: batteryDetailHref("DIN74L"),
  },
  {
    id: "rv-4",
    rating: 5,
    customerName: "최*미",
    createdAt: "2025-09-20",
    branchName: "덕천점",
    serviceType: "출장교체",
    badges: ["deokcheon", "outbound", "hybrid", "slow_start"],
    vehicleName: "아반떼 CN7",
    batteryCode: "AGM60L",
    content:
      "시동 지연 증상으로 문의했고, ISG·AGM 규격을 설명해 주셔서 이해하기 쉬웠습니다.",
    productHref: batteryDetailHref("AGM60L"),
  },
  {
    id: "rv-5",
    rating: 5,
    customerName: "정*호",
    createdAt: "2025-09-02",
    branchName: "덕천점",
    serviceType: "내방교체",
    badges: ["deokcheon", "visit", "agm"],
    vehicleName: "팰리세이드",
    batteryCode: "AGM95L",
    content:
      "대형 SUV AGM95L 교체. 다른 규격과 헷갈릴 수 있는 부분을 미리 안내해 주셨습니다.",
    images: [REVIEW_PHOTO.agm95lMain],
    operatorReply: "AGM95L 단독 규격 기준으로 안내·교체 완료.",
    productHref: batteryDetailHref("AGM95L"),
  },
  {
    id: "rv-6",
    rating: 4,
    customerName: "한*우",
    createdAt: "2025-08-15",
    branchName: "학장점",
    serviceType: "내방교체",
    badges: ["hakjang", "visit", "discharge"],
    vehicleName: "레이",
    batteryCode: "CMF80L",
    content: "블랙박스 방전으로 방문했습니다. 용량·단자 확인 후 교체했습니다.",
    productHref: batteryDetailHref("CMF80L"),
  },
  {
    id: "rv-7",
    rating: 5,
    customerName: "윤*아",
    createdAt: "2025-07-30",
    serviceType: "택배주문",
    badges: ["delivery", "agm"],
    vehicleName: "스타리아",
    batteryCode: "AGM70L",
    content: "반납/미반납 옵션 설명이 명확해서 선택하기 편했습니다.",
    productHref: batteryDetailHref("AGM70L"),
  },
  {
    id: "rv-8",
    rating: 5,
    customerName: "오*석",
    createdAt: "2025-07-08",
    branchName: "학장점",
    serviceType: "출장교체",
    badges: ["hakjang", "outbound", "porter2"],
    vehicleName: "포터2",
    batteryCode: "GB100R",
    content: "로케트 GB100R로 교체. 라벨 사진 보내 확인 후 작업해 주셨습니다.",
    images: [REVIEW_PHOTO.gb100rMain, REVIEW_PHOTO.agm80lLabel],
    productHref: batteryDetailHref("GB100R"),
  },
];

export function reviewsForBatteryCode(code: string, limit = 3): ReviewItem[] {
  const norm = code.trim().toUpperCase();
  return REVIEWS_MOCK.filter((r) => (r.batteryCode ?? "").toUpperCase() === norm).slice(0, limit);
}
