import type { HomeCatalogBrandId } from "@/lib/home-main-catalog-data";

export type HomeBrandLineupTeaser = {
  brand: HomeCatalogBrandId;
  sectionId: string;
  title: string;
  badge: string;
  /** 메인 teaser 전용 — 브랜드 장점 문구를 1~2줄로 축약 */
  shortDescription: string;
  shopHref: string;
  shopLinkLabel: string;
};

/** 메인 홈 — 브랜드 라인업 teaser 카드 카피 (브랜드 상세와 별도 관리) */
export const HOME_BRAND_LINEUP_TEASERS: HomeBrandLineupTeaser[] = [
  {
    brand: "rocket",
    sectionId: "home-lineup-rocket",
    title: "로케트 배터리 라인업",
    badge: "ROCKET",
    shortDescription: "오랜 교체 이력과 높은 인지도로 많이 찾는 대표 배터리 브랜드",
    shopHref: "/brands#rocket",
    shopLinkLabel: "더 보기",
  },
  {
    brand: "solite",
    sectionId: "home-lineup-solite",
    title: "쏠라이트 배터리 라인업",
    badge: "SOLITE",
    shortDescription: "현대·기아 순정 납품 기반으로 신뢰도가 높은 대표 배터리 브랜드",
    shopHref: "/brands#solite",
    shopLinkLabel: "더 보기",
  },
];
