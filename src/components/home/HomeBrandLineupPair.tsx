import { HomeBrandLineupSection } from "@/components/home/HomeBrandLineupSection";
import { HOME_BRAND_LINEUP_TEASERS } from "@/lib/home-brand-lineup-teasers";

/** 메인 — 로케트·쏠라이트 병렬 (타입 탭 · 브랜드별 테마) */
export function HomeBrandLineupPair() {
  return (
    <section
      className="home-brand-lineup-pair"
      data-home-section="brand-lineup-pair"
      aria-label="브랜드 배터리 라인업"
    >
      <div className="home-brand-lineup-pair__grid">
        {HOME_BRAND_LINEUP_TEASERS.map((teaser) => (
          <HomeBrandLineupSection key={teaser.brand} {...teaser} />
        ))}
      </div>
    </section>
  );
}
