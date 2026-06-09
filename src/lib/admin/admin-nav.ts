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
  vehicleReferenceReview: "/admin/vehicle-reference-review",
  ctaLinks: "/admin/cta-links",
  aliases: "/admin/aliases",
  reports: "/admin/reports",
  settings: "/admin/settings",
  orderRequests: "/admin/order-requests",
  inquiries: "/admin/inquiries",
  batteryTalk: "/admin/battery-talk",
  productQna: "/admin/product-qna",
  coupons: "/admin/coupons",
  promotions: "/admin/promotions",
  banners: "/admin/banners",
  notices: "/admin/notices",
  reviews: "/admin/reviews",
} as const;

export type AdminNavItem = {
  href: string;
  label: string;
  group: AdminNavGroup;
};

export type AdminNavGroup =
  | "운영 현황"
  | "주문/고객"
  | "상품/DB"
  | "콘텐츠/마케팅"
  | "이미지/에셋"
  | "시스템";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: ADMIN_ROUTES.hub, label: "대시보드", group: "운영 현황" },
  { href: ADMIN_ROUTES.orders, label: "주문 관리", group: "주문/고객" },
  { href: ADMIN_ROUTES.commerceOrders, label: "자사몰 결제 주문", group: "주문/고객" },
  { href: ADMIN_ROUTES.guestOrders, label: "비회원 주문", group: "주문/고객" },
  { href: ADMIN_ROUTES.orderRequests, label: "상담 주문", group: "주문/고객" },
  { href: ADMIN_ROUTES.inquiries, label: "고객 문의", group: "주문/고객" },
  { href: ADMIN_ROUTES.batteryTalk, label: "배터리톡", group: "주문/고객" },
  { href: ADMIN_ROUTES.productQna, label: "상품 문의", group: "주문/고객" },
  { href: ADMIN_ROUTES.photoRequests, label: "사진 확인 요청", group: "주문/고객" },
  { href: ADMIN_ROUTES.products, label: "제품 관리", group: "상품/DB" },
  { href: ADMIN_ROUTES.batteries, label: "배터리 DB", group: "상품/DB" },
  { href: ADMIN_ROUTES.vehicles, label: "차량 DB", group: "상품/DB" },
  { href: ADMIN_ROUTES.matching, label: "매칭 검수", group: "상품/DB" },
  { href: ADMIN_ROUTES.banners, label: "메인 배너", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.promotions, label: "쿠폰/혜택 관리", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.reviews, label: "고객 후기", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.content, label: "콘텐츠", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.notices, label: "공지/안내", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.ctaLinks, label: "CTA/링크 점검", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.assets, label: "이미지/에셋", group: "이미지/에셋" },
  { href: ADMIN_ROUTES.vehicleImageReview, label: "차량 이미지 검수", group: "이미지/에셋" },
  { href: ADMIN_ROUTES.vehicleReferenceReview, label: "차량 레퍼런스 검수", group: "이미지/에셋" },
  { href: ADMIN_ROUTES.aliases, label: "검색어/별칭", group: "시스템" },
  { href: ADMIN_ROUTES.reports, label: "오류/검수 리포트", group: "시스템" },
  { href: ADMIN_ROUTES.settings, label: "설정", group: "시스템" },
];

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  "운영 현황",
  "주문/고객",
  "상품/DB",
  "콘텐츠/마케팅",
  "이미지/에셋",
  "시스템",
];

/** 현재 경로가 속한 그룹 */
export function adminNavGroupForPath(pathname: string): AdminNavGroup | null {
  const item = ADMIN_NAV_ITEMS.find(
    (i) => pathname === i.href || (i.href !== ADMIN_ROUTES.hub && pathname.startsWith(i.href)),
  );
  return item?.group ?? null;
}

