import {
  BadgeCheck,
  ClipboardCheck,
  MapPin,
  MapPinned,
  MessageCircleQuestion,
  Moon,
  ShieldAlert,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { HUB_QA, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";

export type HomeQuickIconItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  accent: "blue" | "sky" | "indigo" | "slate";
};

const guideById = Object.fromEntries(GUIDE_HUB_ITEMS.map((g) => [g.id, g])) as Record<
  string,
  (typeof GUIDE_HUB_ITEMS)[number]
>;

/** 메인 빠른 아이콘 8개 — 가이드 4 + Q&A + 덕천·학장·야간 무인 */
export const HOME_QUICK_ICON_ITEMS: HomeQuickIconItem[] = [
  {
    id: "maintenance",
    label: guideById.maintenance.label,
    description: guideById.maintenance.description,
    href: guideById.maintenance.href,
    Icon: ClipboardCheck,
    accent: "blue",
  },
  {
    id: "symptoms",
    label: guideById.symptoms.label,
    description: guideById.symptoms.description,
    href: guideById.symptoms.href,
    Icon: Stethoscope,
    accent: "sky",
  },
  {
    id: "fault",
    label: guideById.fault.label,
    description: guideById.fault.description,
    href: guideById.fault.href,
    Icon: ShieldAlert,
    accent: "indigo",
  },
  {
    id: "as",
    label: guideById.as.label,
    description: guideById.as.description,
    href: guideById.as.href,
    Icon: BadgeCheck,
    accent: "blue",
  },
  {
    id: "qa",
    label: "Q&A",
    description: "자주 묻는 질문 확인",
    href: HUB_QA,
    Icon: MessageCircleQuestion,
    accent: "sky",
  },
  {
    id: "deokcheon",
    label: "덕천점",
    description: "부산 북구 만덕대로 24",
    href: HUB_STORE_ANCHORS.deokcheon,
    Icon: MapPin,
    accent: "slate",
  },
  {
    id: "hakjang",
    label: "학장점",
    description: "부산 사상구 대동로 68",
    href: HUB_STORE_ANCHORS.hakjang,
    Icon: MapPinned,
    accent: "slate",
  },
  {
    id: "hakjang-night",
    label: "학장점 야간 무인",
    description: "퇴근 후 픽업·반납 가능",
    // TODO: 전용 야간 무인 안내 페이지 추가 시 href 교체
    href: HUB_STORE_ANCHORS.hakjang,
    Icon: Moon,
    accent: "indigo",
  },
];
