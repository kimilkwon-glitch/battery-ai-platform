/** 기존 admin 페이지 간 네비게이션 (공유 layout 없음 — 링크만 통일) */

export const ADMIN_ROUTES = {
  hub: "/admin",
  content: "/admin/content",
  coupons: "/admin/coupons",
  inquiries: "/admin/inquiries",
  orderRequests: "/admin/order-requests",
} as const;

export const ADMIN_NAV_ITEMS: { href: string; label: string }[] = [
  { href: ADMIN_ROUTES.hub, label: "관리 홈" },
  { href: ADMIN_ROUTES.orderRequests, label: "상담 주문 요청" },
  { href: ADMIN_ROUTES.inquiries, label: "상담 접수" },
  { href: ADMIN_ROUTES.coupons, label: "쿠폰" },
  { href: ADMIN_ROUTES.content, label: "콘텐츠" },
];
