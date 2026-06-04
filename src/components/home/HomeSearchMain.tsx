import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeBrandLineupPair } from "@/components/home/HomeBrandLineupPair";
import { HomePremiumHero } from "@/components/home/HomePremiumHero";
import { HomeQuickIconMenu } from "@/components/home/HomeQuickIconMenu";
import { HomeReplacementStoriesSection } from "@/components/home/HomeReplacementStoriesSection";

/** 메인배너 → 검색 → 혜택 → 아이콘 → 라인업 → 교체 후기 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <HomePremiumHero />

      <div className="home-main-content mx-auto w-full max-w-[1240px] space-y-6 px-4 sm:space-y-7 sm:px-6 lg:space-y-8">
        <HomeBenefitsCarousel />
        <HomeQuickIconMenu />
      </div>

      <div className="home-main-brand-region mx-auto w-full max-w-[1400px] space-y-8 px-4 pb-14 sm:space-y-12 sm:px-6 sm:pb-20 lg:space-y-14 lg:pb-24">
        <HomeBrandLineupPair />
        <HomeReplacementStoriesSection />
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
