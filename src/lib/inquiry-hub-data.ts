import type { QuestionCategory } from "./qnaMatcher";
import { aiHref, compareHref } from "./platform-data";

export const inquirySearchChips = [
  "AGM80L 대신 DIN74L 가능?",
  "BMS 등록 꼭 해야 하나요?",
  "EV6 12V 방전 원인",
  "포터2 100R 확인",
  "스타리아 AGM80R",
  "AGM70L vs AGM80L",
] as const;

export const inquiryLeftRecommendations = [
  { question: "AGM80L 대신 DIN74L 가능?", category: "호환" },
  { question: "BMS 등록 안 하면 어떻게 되나요?", category: "BMS" },
  { question: "A6 블랙박스 방전", category: "방전" },
] as const;

export const inquiryScopeItems = [
  "원인 분석",
  "호환 규격",
  "추천 배터리",
  "BMS/IBS 여부",
  "교체 시기",
  "관련 가이드",
] as const;

export type FeaturedSimilarQuestion = {
  id: string;
  questionType: QuestionCategory;
  title: string;
  tags: string[];
  summary: string;
  vehicleId?: string;
  batteryCode?: string;
  imageKind: "vehicle" | "battery";
  href: string;
};

export const featuredSimilarQuestions: FeaturedSimilarQuestion[] = [
  {
    id: "seltos-upgrade",
    questionType: "업그레이드",
    title: "셀토스 AGM60L에서 AGM70L 업그레이드 가능한가요?",
    tags: ["셀토스", "AGM60L", "AGM70L", "업그레이드"],
    summary: "장착 공간과 충전 제어 조건을 먼저 확인하는 것이 좋습니다.",
    vehicleId: "seltos",
    batteryCode: "AGM60L",
    imageKind: "vehicle",
    href: aiHref("셀토스 AGM60L에서 AGM70L 업그레이드 가능한가요?"),
  },
  {
    id: "agm-din",
    questionType: "호환",
    title: "AGM80L 대신 DIN74L을 넣어도 되나요?",
    tags: ["AGM80L", "DIN74L", "ISG", "호환"],
    summary: "ISG 차량은 AGM 규격 유지가 안전합니다.",
    batteryCode: "AGM80L",
    imageKind: "battery",
    href: aiHref("AGM80L 대신 DIN74L 가능?"),
  },
  {
    id: "porter-year",
    questionType: "연식",
    title: "포터2 2020년식은 90R인가요 100R인가요?",
    tags: ["포터2", "2020년식", "90R", "100R"],
    summary: "2020년 이후 연식은 100R 기준으로 확인하는 것이 좋습니다.",
    vehicleId: "porter2-new",
    batteryCode: "100R",
    imageKind: "vehicle",
    href: aiHref("포터2 2020년식 100R"),
  },
  {
    id: "staria-lpg",
    questionType: "단자 방향",
    title: "스타리아 LPG는 AGM80R이 맞나요?",
    tags: ["스타리아", "LPG", "AGM80R", "단자 방향"],
    summary: "스타리아 LPG는 AGM80R 기준으로 확인합니다.",
    vehicleId: "staria-us4",
    batteryCode: "AGM80R",
    imageKind: "vehicle",
    href: aiHref("스타리아 LPG AGM80R"),
  },
];

export const inquiryRecentPopular = [
  {
    title: "그랜저 IG AGM80L에서 AGM95L 업그레이드 가능한가요?",
    category: "업그레이드",
    href: aiHref("그랜저 IG AGM80L AGM95L 업그레이드"),
  },
  {
    title: "BMW G30 배터리 등록 꼭 해야 하나요?",
    category: "BMS",
    href: aiHref("BMW G30 BMS 등록"),
  },
  {
    title: "쏘렌토 MQ4 하이브리드 배터리 규격",
    category: "차종/규격",
    href: aiHref("쏘렌토 MQ4 하이브리드 배터리"),
  },
  {
    title: "겨울철 CCA 저하는 어떻게 확인하나요?",
    category: "점검",
    href: aiHref("겨울철 CCA 저하 확인"),
  },
] as const;

export const inquiryComparisons = [
  { a: "AGM70L", b: "AGM80L", href: compareHref("AGM70L", "AGM80L") },
  { a: "AGM80L", b: "DIN74L", href: compareHref("AGM80L", "DIN74L") },
  { a: "AGM80L", b: "AGM95L", href: compareHref("AGM80L", "AGM95L") },
  { a: "90R", b: "100R", href: compareHref("90R", "100R") },
] as const;

export const inquiryChecklist = ["차량명", "연식", "연료", "현재 배터리 사진", "단자 방향"] as const;

export const inquiryNextActions = [
  {
    title: "차량별 규격 확인",
    description: "차종·연식·연료 기준으로 추천 배터리를 확인합니다.",
    href: "/vehicles",
    icon: "vehicle" as const,
  },
  {
    title: "배터리 비교",
    description: "AGM70L vs AGM80L처럼 규격 차이를 비교합니다.",
    href: compareHref("AGM70L", "AGM80L"),
    icon: "battery" as const,
  },
  {
    title: "사진으로 규격 확인",
    description: "배터리 라벨과 단자 방향을 보고 오주문을 줄입니다.",
    href: "/analysis/photo",
    icon: "camera" as const,
  },
  {
    title: "증상으로 확인",
    description: "시동 지연, 방전, 경고등 증상 기준으로 확인합니다.",
    href: "/diagnosis",
    icon: "symptom" as const,
  },
] as const;
