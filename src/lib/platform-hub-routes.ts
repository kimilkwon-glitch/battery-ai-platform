/** 플랫폼 허브 페이지 — URL 단일 소스 */

export const HUB_ORDER_CHECKLIST = "/order-checklist";
export const HUB_SYMPTOMS = "/symptoms";
export const HUB_PHOTO_CHECK = "/photo-check";
export const HUB_SERVICE = "/service";

export const PLATFORM_HUB_LINKS = [
  {
    title: "오주문 방지 체크리스트",
    description: "주문 전 차종·연식·단자·규격 5가지 확인",
    href: HUB_ORDER_CHECKLIST,
  },
  {
    title: "증상 진단 허브",
    description: "시동지연·방전·EV 보조배터리 점검 흐름",
    href: HUB_SYMPTOMS,
  },
  {
    title: "사진 확인 안내",
    description: "라벨·단자·트레이 — 보조 검증 가이드",
    href: HUB_PHOTO_CHECK,
  },
  {
    title: "규격 비교 센터",
    description: "헷갈리는 규격 차이를 리포트로 비교",
    href: "/compare",
  },
  {
    title: "매장·택배 안내",
    description: "내방·출장·택배 중 맞는 방법 선택",
    href: HUB_SERVICE,
  },
  {
    title: "Q&A·가이드",
    description: "비슷한 고객 질문과 오주문 방지 글",
    href: "/guides",
  },
] as const;
