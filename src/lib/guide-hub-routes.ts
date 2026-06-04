import { ClipboardList, HelpCircle, ShieldAlert, Stethoscope } from "lucide-react";

/** 배터리 가이드 하위 4개 — 상단 메가메뉴·모바일 공통 */
export const GUIDE_HUB_ITEMS = [
  {
    id: "maintenance",
    label: "점검·관리 팁",
    href: "/guides?cat=maintenance",
    description: "배터리 수명 관리와 기본 점검 방법",
    Icon: ClipboardList,
  },
  {
    id: "symptoms",
    label: "증상 진단",
    href: "/guides?cat=symptoms",
    description: "시동지연·방전·블랙박스 방전 증상 확인",
    Icon: Stethoscope,
  },
  {
    id: "fault",
    label: "배터리 불량 안내",
    href: "/guides?cat=fault",
    description: "교체 필요 신호와 불량 의심 기준",
    Icon: ShieldAlert,
  },
  {
    id: "as",
    label: "AS",
    href: "/guides?cat=as",
    description: "보증, 교환, 상담 안내",
    Icon: HelpCircle,
  },
] as const;

export function isGuideHubPath(pathname: string): boolean {
  return (
    pathname === "/guides" ||
    pathname.startsWith("/guides/") ||
    pathname === "/guide" ||
    pathname.startsWith("/guide/")
  );
}
