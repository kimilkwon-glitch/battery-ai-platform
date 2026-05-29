import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeCatalogSection } from "@/components/home/HomeCatalogSection";
import { HomeMainHero } from "@/components/home/HomeMainHero";

/** 검색 중심 메인 — 포털형 대형 섹션 없음 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:pt-16">
        <HomeMainHero />
        <HomeCatalogSection />
      </div>

      <div className="border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
