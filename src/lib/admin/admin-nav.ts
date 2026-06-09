/** 관리자 운영 콘솔 네비게이션 */

export const ADMIN_ROUTES = {
  hub: "/admin",
  orders: "/admin/orders",
  /** @deprecated — /admin/orders 로 통합 */
  commerceOrders: "/admin/commerce-orders",
  commerceClaims: "/admin/commerce-claims",
  /** @deprecated — /admin/orders?guest=1 */
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
  /** @deprecated — /admin/orders?channel=consultation */
  orderRequests: "/admin/order-requests",
  inquiries: "/admin/inquiries",
  /** @deprecated — /admin/inquiries?type=consultation */
  batteryTalk: "/admin/battery-talk",
  /** @deprecated — /admin/inquiries?type=product */
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
  | "시스템";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: ADMIN_ROUTES.hub, label: "대시보드", group: "운영 현황" },
  { href: ADMIN_ROUTES.orders, label: "주문 관리", group: "주문/고객" },
  { href: ADMIN_ROUTES.commerceClaims, label: "취소/반품/환불", group: "주문/고객" },
  { href: ADMIN_ROUTES.inquiries, label: "문의 관리", group: "주문/고객" },
  { href: ADMIN_ROUTES.products, label: "제품 관리", group: "상품/DB" },
  { href: ADMIN_ROUTES.batteries, label: "배터리 DB", group: "상품/DB" },
  { href: ADMIN_ROUTES.vehicles, label: "차량 DB", group: "상품/DB" },
  { href: ADMIN_ROUTES.photoRequests, label: "사진 확인 요청", group: "상품/DB" },
  { href: ADMIN_ROUTES.content, label: "콘텐츠 관리", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.banners, label: "배너/에셋 관리", group: "콘텐츠/마케팅" },
  { href: ADMIN_ROUTES.settings, label: "설정", group: "시스템" },
];

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  "운영 현황",
  "주문/고객",
  "상품/DB",
  "콘텐츠/마케팅",
  "시스템",
];

/** 현재 경로가 속한 그룹 */
export function adminNavGroupForPath(pathname: string): AdminNavGroup | null {
  const normalized =
    pathname === ADMIN_ROUTES.commerceOrders ||
    pathname === ADMIN_ROUTES.guestOrders ||
    pathname === ADMIN_ROUTES.orderRequests
      ? ADMIN_ROUTES.orders
      : pathname === ADMIN_ROUTES.batteryTalk || pathname === ADMIN_ROUTES.productQna
        ? ADMIN_ROUTES.inquiries
        : pathname;

  const item = ADMIN_NAV_ITEMS.find(
    (i) =>
      normalized === i.href ||
      (i.href !== ADMIN_ROUTES.hub && normalized.startsWith(i.href)),
  );
  return item?.group ?? null;
}
