import { HomeBrandLineupSection } from "@/components/home/HomeBrandLineupSection";

const ROCKET = {
  brand: "rocket" as const,
  sectionId: "home-lineup-rocket",
  title: "로케트 배터리 라인업",
  label: "ROCKET",
  description: "국산차 주요 규격에 폭넓게 대응하는 대표 브랜드.",
  descriptionMobile: "국산차 주요 규격에 폭넓게 대응하는 대표 브랜드.",
  shopHref: "/brands#rocket",
  shopLinkLabel: "더 보기",
};

const SOLITE = {
  brand: "solite" as const,
  sectionId: "home-lineup-solite",
  title: "쏠라이트 배터리 라인업",
  label: "SOLITE",
  description: "합리적인 선택, 주요 국산차 규격 대응.",
  descriptionMobile: "합리적인 선택, 주요 국산차 규격 대응.",
  shopHref: "/brands#solite",
  shopLinkLabel: "더 보기",
};

/** 메인 — 로케트·쏠라이트 병렬 (타입 탭 · 브랜드별 테마) */
export function HomeBrandLineupPair() {
  return (
    <section
      className="home-brand-lineup-pair"
      data-home-section="brand-lineup-pair"
      aria-label="브랜드 배터리 라인업"
    >
      <div className="home-brand-lineup-pair__grid">
        <HomeBrandLineupSection {...ROCKET} />
        <HomeBrandLineupSection {...SOLITE} />
      </div>
    </section>
  );
}
