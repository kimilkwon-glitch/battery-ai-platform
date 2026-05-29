import {
  MAIN_BANNER_DESKTOP_SRC,
  MAIN_BANNER_MOBILE_SRC,
} from "@/lib/brand-assets";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

export type HeroSlide =
  | {
      id: string;
      type: "image";
      title: string;
      subtitle: string;
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

/** 메인 히어로 슬라이드 — 이미지 추가 시 배열에 항목만 추가 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "night-unmanned-hakjang",
    type: "image",
    title: "학장점 야간 무인 시스템 오픈",
    subtitle: "퇴근 후에도 배터리 픽업·반납을 더 편하게",
    imageDesktop: MAIN_BANNER_DESKTOP_SRC,
    imageMobile: MAIN_BANNER_MOBILE_SRC,
    href: `${HUB_STORE_DETAIL}#store-hakjang`,
  },
  {
    id: "hero-placeholder-1",
    type: "placeholder",
    title: "이미지 준비중",
    subtitle: "추가 안내 이미지를 준비중입니다.",
  },
  {
    id: "hero-placeholder-2",
    type: "placeholder",
    title: "다음 배너 준비중",
    subtitle: "곧 새로운 배너가 등록될 예정입니다.",
  },
];

export const HERO_CAROUSEL_INTERVAL_MS = 5500;
