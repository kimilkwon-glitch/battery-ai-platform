/** 관리자 운영 콘솔 네비게이션 */

export const ADMIN_ROUTES = {
  hub: "/admin",
  orders: "/admin/orders",
  commerceOrders: "/admin/commerce-orders",
  guestOrders: "/admin/guest-orders",
  photoRequests: "/admin/photo-requests",
  vehicles: "/admin/vehicles",
  batteries: "/admin/batteries",
  matching: "/admin/matching",
  products: "/admin/products",
  content: "/admin/content",
  assets: "/admin/assets",
  vehicleImageReview: "/admin/vehicle-image-review",
  ctaLinks: "/admin/cta-links",
  aliases: "/admin/aliases",
  reports: "/admin/reports",
  settings: "/admin/settings",
  /** 기존 경로 유지 */
  orderRequests: "/admin/order-requests",
  inquiries: "/admin/inquiries",
  coupons: "/admin/coupons",
} as const;

export type AdminNavItem = {
  href: string;
  label: string;
  group?: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: ADMIN_ROUTES.hub, label: "대시보드", group: "운영" },
  { href: ADMIN_ROUTES.orders, label: "주문 관리", group: "주문" },
  { href: ADMIN_ROUTES.commerceOrders, label: "자사몰 결제 주문", group: "주문" },
  { href: ADMIN_ROUTES.guestOrders, label: "비회원 주문", group: "주문" },
  { href: ADMIN_ROUTES.photoRequests, label: "사진 확인 요청", group: "주문" },
  { href: ADMIN_ROUTES.orderRequests, label: "상담 주문 (기존)", group: "주문" },
  { href: ADMIN_ROUTES.vehicles, label: "차량 DB", group: "DB" },
  { href: ADMIN_ROUTES.batteries, label: "배터리 DB", group: "DB" },
  { href: ADMIN_ROUTES.matching, label: "매칭 검수", group: "DB" },
  { href: ADMIN_ROUTES.products, label: "제품 관리", group: "DB" },
  { href: ADMIN_ROUTES.content, label: "콘텐츠", group: "콘텐츠" },
  { href: ADMIN_ROUTES.assets, label: "이미지/에셋", group: "에셋" },
  { href: ADMIN_ROUTES.vehicleImageReview, label: "차량 이미지 검수", group: "에셋" },
  { href: ADMIN_ROUTES.ctaLinks, label: "CTA/링크 점검", group: "에셋" },
  { href: ADMIN_ROUTES.aliases, label: "검색어/별칭", group: "검색" },
  { href: ADMIN_ROUTES.reports, label: "오류/검수 리포트", group: "리포트" },
  { href: ADMIN_ROUTES.settings, label: "설정", group: "설정" },
];

export const ADMIN_NAV_GROUPS = [
  "운영",
  "주문",
  "DB",
  "콘텐츠",
  "에셋",
  "검색",
  "리포트",
  "설정",
] as const;
