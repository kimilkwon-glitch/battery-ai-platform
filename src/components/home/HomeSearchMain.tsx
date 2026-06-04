import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeBrandLineupPair } from "@/components/home/HomeBrandLineupPair";
import { HomeMainDiscoverStrip } from "@/components/home/HomeMainDiscoverStrip";
import { HomePremiumHero } from "@/components/home/HomePremiumHero";
import { HomeQuickIconMenu } from "@/components/home/HomeQuickIconMenu";

/** 메인배너 → 검색 → 빠른 아이콘 → 혜택 → 로케트·쏠라이트 병렬 → 가이드/후기/지점 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <HomePremiumHero />

      <div className="home-main-content mx-auto w-full max-w-[1240px] space-y-8 px-4 pb-16 sm:space-y-10 sm:px-6 sm:pb-20 lg:space-y-12 lg:pb-24">
        <HomeQuickIconMenu />
        <HomeBenefitsCarousel />
        <HomeBrandLineupPair />
        <HomeMainDiscoverStrip />
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
