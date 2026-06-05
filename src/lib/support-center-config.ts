import {
  CUSTOMER_CENTER_DELIVERY,
  CUSTOMER_CENTER_FAQ,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_RETURN_EXCHANGE,
  CUSTOMER_CENTER_USED_BATTERY,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import { GUEST_ORDER_CHECK_PAGE, GUEST_ORDER_PAGE } from "@/lib/customer-auth-routes";
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

export const SUPPORT_HUB_PRIMARY_CTAS = [
  {
    id: "consult",
    label: "상담 문의하기",
    href: "#support-inquiry",
    variant: "primary" as const,
  },
  {
    id: "lookup",
    label: "주문 조회하기",
    href: ORDER_REQUEST_LOOKUP_PAGE,
    variant: "secondary" as const,
  },
] as const;

export const SUPPORT_HUB_BOTTOM_LINKS = [
  { label: "주문/배송 안내", href: CUSTOMER_CENTER_ORDER_GUIDE, desc: "주문·출고·교체 절차" },
  { label: "교환/보증 안내", href: CUSTOMER_CENTER_RETURN_EXCHANGE, desc: "교환·반품·보증" },
  { label: "배터리 가이드", href: HUB_GUIDE, desc: "규격·증상·교체 팁" },
] as const;

export const SUPPORT_HUB_FAQ_INITIAL_LIMIT = { mobile: 4, desktop: 5 } as const;

export const SUPPORT_HUB_SECONDARY_CTAS = [
  { label: "배송 안내 보기", href: CUSTOMER_CENTER_DELIVERY },
  { label: "배터리 규격 가이드", href: HUB_GUIDE },
  { label: "비회원 주문", href: GUEST_ORDER_PAGE },
  { label: "매장·출장 안내", href: HUB_STORE_DETAIL },
  { label: "FAQ 전체", href: CUSTOMER_CENTER_FAQ },
];
