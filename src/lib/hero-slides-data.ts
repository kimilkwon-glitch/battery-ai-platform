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
