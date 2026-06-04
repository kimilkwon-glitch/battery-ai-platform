import {
  MAIN_BANNER_HAKJANG_NIGHT_SRC,
  MAIN_BANNER_NATIONWIDE_DELIVERY_SRC,
  MAIN_BANNER_STORE_VISIT_ONSITE_SRC,
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
 * 1) 매장 방문·출장 교체  2) 전국 택배 주문  3) 학장점 야간 무인
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "store-visit-onsite",
    type: "image",
    title: "매장 방문 · 출장 교체",
    heading: "가까운 직영점 방문도, 원하는 장소 배터리 교체도 빠르게 안내",
    description: "덕천점·학장점 운영, 차량 정보 확인 후 상담 가능",
    imageAlt: "매장 방문 및 출장 교체 메인 배너",
    image: MAIN_BANNER_STORE_VISIT_ONSITE_SRC,
    href: HUB_STORE_ANCHORS.visit,
  },
  {
    id: "nationwide-delivery",
    type: "image",
    title: "전국 택배 주문",
    heading: "집에서도 간편하게 주문 후 저렴하게",
    description: "셀프교체 가능, 전국 빠른 배송, 중간 유통 없이 더 저렴하게",
    imageAlt: "전국 택배 주문 메인 배너",
    image: MAIN_BANNER_NATIONWIDE_DELIVERY_SRC,
    href: HUB_SHOP_ANCHORS.delivery,
  },
  {
    id: "hakjang-night-unmanned",
    type: "image",
    title: "학장점 야간 무인 시스템",
    heading: "학장점 야간 무인 시스템 오픈",
    description: "퇴근 후 갑작스러운 방전에도 빠르게 대응",
    imageAlt: "학장점 야간 무인 시스템 메인 배너",
    image: MAIN_BANNER_HAKJANG_NIGHT_SRC,
    href: `${HUB_STORE_DETAIL}#store-hakjang`,
  },
];

export const HERO_CAROUSEL_INTERVAL_MS = 5500;

/** PC 히어로 뷰포트 — 21:9 */
export const HERO_DESKTOP_ASPECT_RATIO = "21 / 9" as const;

/** 모바일·태블릿 — 과도한 크롭 방지 */
export const HERO_MOBILE_ASPECT_RATIO = "16 / 9" as const;
