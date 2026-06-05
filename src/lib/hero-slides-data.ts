import {
  MAIN_BANNER_DELIVERY_ORDER_MOBILE_SRC,
  MAIN_BANNER_DELIVERY_ORDER_PC_SRC,
  MAIN_BANNER_NIGHT_UNMANNED_MOBILE_SRC,
  MAIN_BANNER_NIGHT_UNMANNED_PC_SRC,
  MAIN_BANNER_STORE_ONSITE_MOBILE_SRC,
  MAIN_BANNER_STORE_ONSITE_PC_SRC,
} from "@/lib/brand-assets";
import { HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

export type HeroSlide =
  | {
      id: string;
      type: "image";
      title: string;
      heading: string;
      description: string;
      imageAlt: string;
      image: string;
      /** 모바일 전용 배너(없으면 image 사용) */
      imageMobile?: string;
      href: string;
      /** 카드 좌상단 UI 프로모 라벨 (이미지 문구와 별도) */
      promoLabel: string;
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
 * 1) 전국 택배 주문  2) 매장 방문·출장 교체  3) 야간 무인 시스템 오픈
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "nationwide-delivery",
    type: "image",
    title: "전국 택배 주문",
    heading: "집에서도 간편하게 주문 후 저렴하게",
    description: "셀프교체 가능 · 전국 빠른 배송",
    imageAlt: "전국 택배 주문 메인 배너",
    image: MAIN_BANNER_DELIVERY_ORDER_PC_SRC,
    imageMobile: MAIN_BANNER_DELIVERY_ORDER_MOBILE_SRC,
    href: HUB_SHOP_ANCHORS.delivery,
    promoLabel: "DELIVERY",
  },
  {
    id: "store-visit-onsite",
    type: "image",
    title: "매장 방문 · 출장 교체",
    heading: "가까운 직영점 방문도, 원하는 장소 배터리 교체도 빠르게 안내",
    description: "덕천점·학장점 운영",
    imageAlt: "매장 방문 및 출장 교체 메인 배너",
    image: MAIN_BANNER_STORE_ONSITE_PC_SRC,
    imageMobile: MAIN_BANNER_STORE_ONSITE_MOBILE_SRC,
    href: HUB_STORE_ANCHORS.visit,
    promoLabel: "STORE & VISIT",
  },
  {
    id: "night-unmanned",
    type: "image",
    title: "야간 무인 시스템 오픈",
    heading: "학장점 야간 무인 시스템 오픈",
    description: "퇴근 후에도 배터리 픽업·반납을 더 편하게",
    imageAlt: "야간 무인 시스템 오픈 메인 배너",
    image: MAIN_BANNER_NIGHT_UNMANNED_PC_SRC,
    imageMobile: MAIN_BANNER_NIGHT_UNMANNED_MOBILE_SRC,
    href: `${HUB_STORE_DETAIL}#store-hakjang`,
    promoLabel: "24H SERVICE",
  },
];

export const HERO_CAROUSEL_INTERVAL_MS = 5500;

/**
 * 업로드 배너 권장 비율
 * PC: 1920×820 (~2.33:1) — main-banner-*-pc.png
 * 모바일: 900×562 (16:10) — main-banner-*-mobile.png
 */
export const HERO_BANNER_NATIVE_ASPECT_RATIO = "1916 / 821" as const;
export const HERO_DESKTOP_ASPECT_RATIO = HERO_BANNER_NATIVE_ASPECT_RATIO;
export const HERO_MOBILE_ASPECT_RATIO = "16 / 10" as const;
