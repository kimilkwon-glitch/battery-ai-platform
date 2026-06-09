import {
  CUSTOMER_CENTER_DELIVERY,
  CUSTOMER_CENTER_FAQ,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_RETURN_EXCHANGE,
  CUSTOMER_CENTER_USED_BATTERY,
  COMMERCE_ORDER_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import { HUB_GUIDE, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import type { FaqCategory } from "@/lib/support-faq-data";

export type SupportHubCategoryId =
  | "all"
  | "order"
  | "delivery"
  | "battery"
  | "install"
  | "return"
  | "member"
  | "other";

export const SUPPORT_HUB_CATEGORIES: { id: SupportHubCategoryId; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "order", label: "주문" },
  { id: "delivery", label: "배송/방문" },
  { id: "battery", label: "배터리" },
  { id: "install", label: "교체/장착" },
  { id: "return", label: "반납/보증" },
  { id: "member", label: "회원/비회원" },
  { id: "other", label: "기타" },
];

export function faqCategoryToHub(cat: Exclude<FaqCategory, "전체">): SupportHubCategoryId {
  if (cat === "주문" || cat === "결제") return "order";
  if (cat === "배송" || cat === "출장") return "delivery";
  if (cat === "규격") return "battery";
  if (cat === "증상") return "install";
  if (cat === "폐전지" || cat === "교환·반품") return "return";
  if (cat === "계정" || cat === "조회") return "member";
  return "other";
}

export type SupportHubCtaVariant = "primary" | "secondary";

export type SupportHubPrimaryCta = {
  id: "consult" | "lookup";
  label: string;
  href: string;
  variant: SupportHubCtaVariant;
};

export const SUPPORT_HUB_PRIMARY_CTAS: readonly SupportHubPrimaryCta[] = [
  {
    id: "consult",
    label: "상담 문의하기",
    href: "#support-inquiry",
    variant: "primary",
  },
  {
    id: "lookup",
    label: "주문 조회하기",
    href: COMMERCE_ORDER_LOOKUP_PAGE,
    variant: "secondary",
  },
];

export const SUPPORT_HUB_BOTTOM_LINKS = [
  { label: "주문/배송 안내", href: CUSTOMER_CENTER_ORDER_GUIDE, desc: "주문·출고·교체 절차" },
  { label: "교환/보증 안내", href: CUSTOMER_CENTER_RETURN_EXCHANGE, desc: "교환·반품·보증" },
  { label: "배터리 가이드", href: HUB_GUIDE, desc: "규격·증상·교체 팁" },
] as const;

export const SUPPORT_HUB_FAQ_INITIAL_LIMIT = { mobile: 6, desktop: 9 } as const;

export const SUPPORT_HUB_NOTICE_INITIAL_LIMIT = { mobile: 3, desktop: 4 } as const;

/** 모바일 기본 FAQ 노출 우선순위 (검색·카테고리 필터 없을 때) */
export const SUPPORT_HUB_MOBILE_FAQ_PRIORITY = [
  "faq-spec-check",
  "faq-agm",
  "faq-din",
  "faq-lr",
  "faq-return",
  "cs-faq-delivery-time",
] as const;

/** 모바일 빠른 안내 — 2열 compact 버튼 */
export const SUPPORT_HUB_MOBILE_QUICK_LINKS = [
  { label: "배송 안내", href: CUSTOMER_CENTER_DELIVERY },
  { label: "반품·보증", href: CUSTOMER_CENTER_RETURN_EXCHANGE },
  { label: "배터리 규격 가이드", href: HUB_GUIDE },
  { label: "매장·출장 안내", href: HUB_STORE_DETAIL },
  { label: "주문 조회", href: COMMERCE_ORDER_LOOKUP_PAGE },
  { label: "FAQ 전체", href: CUSTOMER_CENTER_FAQ },
] as const;

/** FAQ 영역 하단 빠른 링크 (메인 컬럼) */
export const SUPPORT_HUB_FAQ_QUICK_LINKS = [
  { label: "주문·배송", href: CUSTOMER_CENTER_ORDER_GUIDE },
  { label: "반납·보증", href: CUSTOMER_CENTER_RETURN_EXCHANGE },
  { label: "규격 가이드", href: HUB_GUIDE },
  { label: "배송 안내", href: CUSTOMER_CENTER_DELIVERY },
  { label: "폐전지 반납", href: CUSTOMER_CENTER_USED_BATTERY },
] as const;

export const SUPPORT_HUB_SECONDARY_CTAS = [
  { label: "배송 안내 보기", href: CUSTOMER_CENTER_DELIVERY },
  { label: "배터리 규격 가이드", href: HUB_GUIDE },
  { label: "로그인·주문내역", href: "/login?redirect=%2Fmypage" },
  { label: "매장·출장 안내", href: HUB_STORE_DETAIL },
  { label: "FAQ 전체", href: CUSTOMER_CENTER_FAQ },
];
