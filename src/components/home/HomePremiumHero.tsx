import { HomeMainBanner } from "@/components/home/HomeMainBanner";
import { HomeMainHero } from "@/components/home/HomeMainHero";

/** 메인 상단 — 배너 → 검색 → 추천 검색어 (신규 히어로 문구/CTA 없음) */
export function HomePremiumHero() {
  return (
    <section className="home-hero-top" data-home-section="hero-top">
      <div className="home-main-hero-region mx-auto w-full max-w-[1240px] px-4 pb-0 pt-4 sm:px-6 sm:pt-5 lg:pt-6">
        <div className="home-hero-stack">
          <div className="home-hero-stack__banner">
            <HomeMainBanner />
          </div>
          <div className="home-hero-stack__search">
            <HomeMainHero />
          </div>
        </div>
      </div>
    </section>
  );
}
