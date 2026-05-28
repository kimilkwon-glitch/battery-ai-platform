import { PortalHeader } from "@/components/portal";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { HomeDeliverySection } from "@/components/home/HomeDeliverySection";
import { HomeEvHybridSection } from "@/components/home/HomeEvHybridSection";
import { HomePlatformHero } from "@/components/home/HomePlatformHero";
import { HomePopularBatteryRanking } from "@/components/home/HomePopularBatteryRanking";
import { HomePopularVehicleSearch } from "@/components/home/HomePopularVehicleSearch";
import { HomeStoreHub } from "@/components/home/HomeStoreHub";
import { HomeTrendingSection } from "@/components/home/HomeTrendingSection";
import { HomePopularQna } from "@/components/home/HomePopularQna";
import { HomeBatteryKnowledgeSection } from "@/components/home/HomeBatteryKnowledgeSection";
import { HomeOrderGuide } from "@/components/platform/HomeOrderGuide";
import { HomePlatformTools } from "@/components/home/HomePlatformTools";
import { SiteFooter } from "@/components/common/SiteFooter";
import { bm } from "@/lib/design-tokens";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className={bm.pageBg} data-page="design-system-p2">
      <PortalHeader showSearch />

      <div className={`${bm.pageContainerWide} space-y-5 py-6 sm:space-y-6`}>
        <HomeSectionShell rhythm="hero">
          <HomePlatformHero />
        </HomeSectionShell>
        <HomePopularBatteryRanking />
        <HomePopularVehicleSearch />
        <HomeEvHybridSection />
        <HomeTrendingSection />
        <HomeDeliverySection />
        <HomeStoreHub />
        <HomePlatformTools />
        <HomePopularQna />
        <HomeBatteryKnowledgeSection />
        <HomeOrderGuide />
        <SiteFooter />
      </div>
    </main>
  );
}
