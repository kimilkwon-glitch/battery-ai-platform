import type { IconKey } from "@/lib/icon-map";

/** 안내 페이지 URL 단일 소스 */

export const HUB_ORDER_CHECKLIST = "/order-checklist";
export const HUB_SYMPTOMS = "/symptoms";
export const HUB_PHOTO_CHECK = "/photo-check";
export const HUB_SERVICE = "/service";

export const PLATFORM_HUB_LINKS: readonly {
  title: string;
  description: string;
  href: string;
  iconKey: IconKey;
}[] = [
  {
    title: "주문 전 체크리스트",
    description: "차종·연식·단자·규격 — 오주문 방지 5가지",
    href: HUB_ORDER_CHECKLIST,
    iconKey: "checklist",
  },
  {
    title: "증상별 안내",
    description: "시동 지연·방전·EV 보조 12V",
    href: HUB_SYMPTOMS,
    iconKey: "symptom",
  },
  {
    title: "사진 확인 안내",
    description: "라벨·단자·트레이 — 보조 확인",
    href: HUB_PHOTO_CHECK,
    iconKey: "photoCheck",
  },
  {
    title: "규격 비교",
    description: "헷갈리는 규격 차이를 나란히 보기",
    href: "/compare",
    iconKey: "compare",
  },
  {
    title: "매장·택배 안내",
    description: "내방·출장·택배 중 맞는 방법",
    href: HUB_SERVICE,
    iconKey: "store",
  },
  {
    title: "Q&A·가이드",
    description: "비슷한 질문과 오주문 방지 글",
    href: "/guides",
    iconKey: "guide",
  },
];
