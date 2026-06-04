import { HomeBrandLineupSection } from "@/components/home/HomeBrandLineupSection";

const ROCKET = {
  brand: "rocket" as const,
  sectionId: "home-lineup-rocket",
  title: "로케트 배터리 라인업",
  label: "Rocket",
  description:
    "로케트는 국내 고객에게 익숙한 대표 배터리 브랜드로, AGM·DIN·일반형 주요 규격을 차량 정보와 함께 확인할 수 있습니다.",
  shopHref: "/brands?brand=rocket",
  shopLinkLabel: "로케트 전체 보기 →",
};

const SOLITE = {
  brand: "solite" as const,
  sectionId: "home-lineup-solite",
  title: "쏠라이트 배터리 라인업",
  label: "Solite",
  description:
    "쏠라이트는 합리적인 가격대와 주요 국산차 규격 대응이 장점인 브랜드로, 차량 확인 후 내방·출장·택배 주문까지 안내할 수 있습니다.",
  shopHref: "/brands?brand=solite",
  shopLinkLabel: "쏠라이트 전체 보기 →",
};

/** 메인 — 로케트·쏠라이트 병렬 라인업 (PC 2컬럼, 모바일 세로) */
export function HomeBrandLineupPair() {
  return (
    <section
      className="home-brand-lineup-pair"
      data-home-section="brand-lineup-pair"
      aria-label="브랜드 배터리 라인업"
    >
      <div className="home-brand-lineup-pair__grid">
        <HomeBrandLineupSection {...ROCKET} layout="column" />
        <HomeBrandLineupSection {...SOLITE} layout="column" />
      </div>
    </section>
  );
}
