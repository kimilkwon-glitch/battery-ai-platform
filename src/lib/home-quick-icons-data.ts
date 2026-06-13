import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { HUB_QA, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";

export type HomeQuickIconAccent =
  | "mint"
  | "teal"
  | "coral"
  | "lilac"
  | "sky"
  | "skyblue"
  | "bluegray"
  | "indigo";

export type HomeQuickIconVariant = "default" | "vehicle";

export type HomeQuickIconItem = {
  id: string;
  label: string;
  /** 모바일 compact 가로 스크롤용 짧은 라벨 */
  mobileLabel: string;
  /** PC 카드에서 2줄 제목 (한 글자씩 떨어짐 방지) */
  titleMobileLines?: [string, string];
  description: string;
  href: string;
  imageSrc: string;
  accent: HomeQuickIconAccent;
  /** 아이콘 뒤 파스텔 배경칩 — PNG 자체가 아닌 wrapper 전용 */
  chipBg: string;
  iconVariant?: HomeQuickIconVariant;
};

const guideById = Object.fromEntries(GUIDE_HUB_ITEMS.map((g) => [g.id, g])) as Record<
  string,
  (typeof GUIDE_HUB_ITEMS)[number]
>;

const QUICK_ICON_BASE = "/assets/quick-icons";
/** 투명 PNG 재처리 후 CDN/브라우저 캐시 무효화 */
const QUICK_ICON_ASSET_V = "20260530-true-alpha";

/** 메인 빠른 아이콘 8개 — 가이드 4 + Q&A + 덕천·학장·야간 무인 */
export const HOME_QUICK_ICON_ITEMS: HomeQuickIconItem[] = [
  {
    id: "maintenance",
    label: guideById.maintenance.label,
    mobileLabel: "점검팁",
    description: "배터리 수명 관리",
    href: guideById.maintenance.href,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-maintenance-tip.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "mint",
    chipBg: "#E8F6F0",
  },
  {
    id: "symptoms",
    label: guideById.symptoms.label,
    mobileLabel: "증상진단",
    description: "시동지연·방전 확인",
    href: guideById.symptoms.href,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-symptom-diagnosis.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "teal",
    chipBg: "#E6F4FB",
  },
  {
    id: "fault",
    label: guideById.fault.label,
    mobileLabel: "불량안내",
    description: "교체 필요 신호 확인",
    href: guideById.fault.href,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-battery-fault.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "coral",
    chipBg: "#FFF0E8",
  },
  {
    id: "as",
    label: guideById.as.label,
    mobileLabel: "AS",
    description: "보증·교환 안내",
    href: guideById.as.href,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-as-warranty.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "lilac",
    chipBg: "#F2EEF9",
  },
  {
    id: "qa",
    label: "Q&A",
    mobileLabel: "Q&A",
    description: "자주 묻는 질문",
    href: HUB_QA,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-qna.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "sky",
    chipBg: "#EBF3FC",
  },
  {
    id: "deokcheon",
    label: "덕천점",
    mobileLabel: "덕천점",
    description: "부산 북구 의성로 122",
    href: HUB_STORE_ANCHORS.deokcheon,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-deokcheon-ray.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "skyblue",
    chipBg: "#E5F5F2",
    iconVariant: "vehicle",
  },
  {
    id: "hakjang",
    label: "학장점",
    mobileLabel: "학장점",
    description: "부산 사상구 학감대로 171",
    href: HUB_STORE_ANCHORS.hakjang,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-hakjang-starex.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "bluegray",
    chipBg: "#EEF2F6",
    iconVariant: "vehicle",
  },
  {
    id: "customer-center",
    label: "고객센터",
    mobileLabel: "고객센터",
    description: "주문·배송·반품 문의",
    href: CUSTOMER_CENTER_HUB,
    imageSrc: `${QUICK_ICON_BASE}/quick-icon-qna.png?v=${QUICK_ICON_ASSET_V}`,
    accent: "indigo",
    chipBg: "#EDF3FA",
  },
];
