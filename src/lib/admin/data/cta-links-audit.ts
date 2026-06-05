import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";
import { HERO_SLIDES } from "@/lib/hero-slides-data";
import { BENEFIT_CARDS } from "@/lib/benefits-data";
import { storeLinks, shoppingLinks } from "@/lib/external-links";
import {
  CHECKOUT_PAGE,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import { GUEST_ORDER_PAGE, GUEST_ORDER_CHECK_PAGE } from "@/lib/guest-order/guest-order-routes";
import type { AdminCtaLinkRow } from "@/types/admin";

export function buildCtaLinkAuditRows(): AdminCtaLinkRow[] {
  const rows: AdminCtaLinkRow[] = [];

  for (const slide of HERO_SLIDES) {
    const href = slide.type === "image" ? slide.href : slide.href ?? "#";
    rows.push({
      id: `hero-${slide.id}`,
      label: slide.title,
      href,
      context: "메인 배너 CTA",
      status: href && href !== "#" ? "ok" : "missing",
    });
  }

  for (const item of HOME_QUICK_ICON_ITEMS) {
    rows.push({
      id: `quick-${item.id}`,
      label: item.label,
      href: item.href,
      context: "빠른메뉴",
      status: item.href.startsWith("http") ? "external" : item.href ? "ok" : "missing",
    });
  }

  for (const benefit of BENEFIT_CARDS) {
    rows.push({
      id: `benefit-${benefit.id}`,
      label: benefit.title,
      href: benefit.href ?? CHECKOUT_PAGE,
      context: "혜택 CTA",
      status: "ok",
    });
  }

  for (const [key, store] of Object.entries(storeLinks)) {
    rows.push(
      {
        id: `store-tel-${key}`,
        label: `${store.name} 전화`,
        href: store.tel,
        context: "지점 전화",
        status: "ok",
        note: store.phone,
      },
      {
        id: `store-place-${key}`,
        label: `${store.name} 네이버 플레이스`,
        href: store.naverPlace,
        context: "네이버 플레이스",
        status: "external",
      },
      {
        id: `store-blog-${key}`,
        label: `${store.name} 블로그`,
        href: store.blog,
        context: "블로그",
        status: "external",
      },
      {
        id: `store-daangn-${key}`,
        label: `${store.name} 당근`,
        href: store.daangn,
        context: "당근",
        status: "external",
      },
    );
  }

  rows.push(
    {
      id: "smartstore-bm",
      label: shoppingLinks.batteryManager.label,
      href: shoppingLinks.batteryManager.href,
      context: "스마트스토어",
      status: "external",
    },
    {
      id: "smartstore-place",
      label: shoppingLinks.batteryPlace.label,
      href: shoppingLinks.batteryPlace.href,
      context: "스마트스토어",
      status: "external",
    },
    {
      id: "vehicle-order",
      label: "차량 상세 주문하기",
      href: CHECKOUT_PAGE,
      context: "차량 상세 CTA",
      status: "ok",
    },
    {
      id: "battery-order",
      label: "배터리 상세 주문하기",
      href: CHECKOUT_PAGE,
      context: "배터리 상세 CTA",
      status: "ok",
    },
    {
      id: "photo-check",
      label: "사진 확인",
      href: "/photo-check",
      context: "사진 확인 CTA",
      status: "ok",
    },
    {
      id: "guest-order",
      label: "비회원 주문",
      href: GUEST_ORDER_PAGE,
      context: "비회원 주문",
      status: "ok",
    },
    {
      id: "guest-order-check",
      label: "비회원 주문조회",
      href: GUEST_ORDER_CHECK_PAGE,
      context: "주문조회",
      status: "ok",
    },
    {
      id: "order-lookup",
      label: "상담 접수 조회",
      href: ORDER_REQUEST_LOOKUP_PAGE,
      context: "주문조회",
      status: "ok",
    },
  );

  return rows;
}

export function countCtaLinkErrors(rows: AdminCtaLinkRow[]): number {
  return rows.filter((r) => r.status === "missing" || r.status === "suspect").length;
}
