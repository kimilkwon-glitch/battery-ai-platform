import {
  MAIN_BANNER_DESKTOP_SRC,
  MAIN_BANNER_MOBILE_SRC,
  MAIN_HERO_DELIVERY_ORDER_DESKTOP_SRC,
  MAIN_HERO_DELIVERY_ORDER_MOBILE_SRC,
  MAIN_HERO_VISIT_DELIVERY_DESKTOP_SRC,
  MAIN_HERO_VISIT_DELIVERY_MOBILE_SRC,
} from "@/lib/brand-assets";
import { HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

export type HeroSlide =
  | {
      id: string;
      type: "image";
      title: string;
      subtitle: string;
      imageAlt: string;
      imageDesktop: string;
      imageMobile: string;
      href: string;
    }
  | {
      id: string;
      type: "placeholder";
      title: string;
      subtitle: string;
      href?: string;
    };

/**
 * 메인 히어로 슬라이드 — 노출 순서 고정
 * 1) 택배 주문  2) 매장 방문·출장 교체  3) 학장점 야간 무인
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "delivery-order",
    type: "image",
    title: "택배 주문",
    subtitle: "택배로 배터리 주문·교체 안내",
    imageAlt: "택배 주문 메인 배너",
    imageDesktop: MAIN_HERO_DELIVERY_ORDER_DESKTOP_SRC,
    imageMobile: MAIN_HERO_DELIVERY_ORDER_MOBILE_SRC,
    href: HUB_SHOP_ANCHORS.delivery,
  },
  {
    id: "visit-delivery",
    type: "image",
    title: "매장 방문 · 출장 교체",
    subtitle: "매장 방문과 출장 교체 서비스 안내",
    imageAlt: "매장 방문 및 출장 교체 메인 배너",
    imageDesktop: MAIN_HERO_VISIT_DELIVERY_DESKTOP_SRC,
    imageMobile: MAIN_HERO_VISIT_DELIVERY_MOBILE_SRC,
    href: HUB_STORE_ANCHORS.visit,
  },
  {
    id: "night-unmanned-hakjang",
    type: "image",
    title: "학장점 야간 무인 시스템 오픈",
    subtitle: "퇴근 후에도 배터리 픽업·반납을 더 편하게",
    imageAlt: "학장점 야간 무인 시스템 메인 배너",
    imageDesktop: MAIN_BANNER_DESKTOP_SRC,
    imageMobile: MAIN_BANNER_MOBILE_SRC,
    href: `${HUB_STORE_DETAIL}#store-hakjang`,
  },
];

export const HERO_CAROUSEL_INTERVAL_MS = 5500;

/**
 * 실제 PNG 캔버스 (public/assets/banners, 2026-05 감사 기준)
 * - delivery / visit desktop: 1984×528 (동일)
 * - night desktop (main-hero-desktop): 1856×576 ← 규격 불일치, asset 정규화 권장
 * - mobile 3종: 1376×768 (동일)
 */
export const HERO_BANNER_CANVAS = {
  desktop: {
    deliveryOrder: { width: 1984, height: 528 },
    visitDelivery: { width: 1984, height: 528 },
    nightUnmanned: { width: 1856, height: 576 },
  },
  mobile: { width: 1376, height: 768 },
} as const;

/** 모바일 hero — 실제 asset 1376×768 */
export const HERO_MOBILE_ASPECT_CLASS = "aspect-[1376/768]" as const;

const HERO_DESKTOP_ASPECT_BY_SLIDE: Record<string, string> = {
  "delivery-order": "sm:aspect-[1984/528]",
  "visit-delivery": "sm:aspect-[1984/528]",
  "night-unmanned-hakjang": "sm:aspect-[1856/576]",
};

/** @deprecated 단일 desktop ratio — 슬라이드별 비율이 달라 getHeroViewportAspectClasses 사용 */
export const HERO_DESKTOP_ASPECT_CLASS = "sm:aspect-[1984/528]" as const;

/** 활성 슬라이드 id에 맞는 viewport aspect (crop 없이 캔버스와 1:1) */
export function getHeroViewportAspectClasses(slideId: string): {
  mobile: string;
  desktop: string;
} {
  return {
    mobile: HERO_MOBILE_ASPECT_CLASS,
    desktop: HERO_DESKTOP_ASPECT_BY_SLIDE[slideId] ?? HERO_DESKTOP_ASPECT_CLASS,
  };
}
