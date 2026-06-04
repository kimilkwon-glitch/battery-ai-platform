import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeBrandLineupSection } from "@/components/home/HomeBrandLineupSection";
import { HomeMainDiscoverStrip } from "@/components/home/HomeMainDiscoverStrip";
import { HomePopularQna } from "@/components/home/HomePopularQna";
import { HomePremiumHero } from "@/components/home/HomePremiumHero";
import { HomeQuickIconMenu } from "@/components/home/HomeQuickIconMenu";

/** 메인배너 → 검색 → 빠른 아이콘 → 혜택 → 로케트 → 쏠라이트 → 가이드/Q&A 허브 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <HomePremiumHero />

      <div className="home-main-content mx-auto w-full max-w-[1240px] space-y-8 px-4 pb-16 sm:space-y-10 sm:px-6 sm:pb-20 lg:space-y-12 lg:pb-24">
        <HomeQuickIconMenu />
        <HomeBenefitsCarousel />
        <HomeBrandLineupSection
          brand="rocket"
          sectionId="home-lineup-rocket"
          title="로케트 배터리 라인업"
          label="Rocket"
          description="로케트는 국내 고객에게 익숙한 대표 배터리 브랜드로, AGM·DIN·일반형 주요 규격을 차량 정보와 함께 확인할 수 있습니다."
        />
        <HomeBrandLineupSection
          brand="solite"
          sectionId="home-lineup-solite"
          title="쏠라이트 배터리 라인업"
          label="Solite"
          description="쏠라이트는 합리적인 가격대와 주요 국산차 규격 대응이 장점인 브랜드로, 차량 확인 후 내방·출장·택배 주문까지 안내할 수 있습니다."
        />
        <HomeMainDiscoverStrip />
        <HomePopularQna />
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
