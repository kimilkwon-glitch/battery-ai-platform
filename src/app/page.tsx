import { PortalHeader } from "@/components/portal";
import { HomeDeliverySection } from "@/components/home/HomeDeliverySection";
import { HomeEvHybridSection } from "@/components/home/HomeEvHybridSection";
import { HomePlatformHero } from "@/components/home/HomePlatformHero";
import { HomePopularBatteryRanking } from "@/components/home/HomePopularBatteryRanking";
import { HomePopularVehicleSearch } from "@/components/home/HomePopularVehicleSearch";
import { HomeStoreHub } from "@/components/home/HomeStoreHub";
import { HomeTrendingSection } from "@/components/home/HomeTrendingSection";
import { HomePopularQna } from "@/components/home/HomePopularQna";
import { HomeOrderGuide } from "@/components/platform/HomeOrderGuide";
import { SiteFooter } from "@/components/common/SiteFooter";
import { bm } from "@/lib/design-tokens";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className={bm.pageBg} data-page="precision-garage-v1">
      <PortalHeader showSearch />

      <div className={`${bm.pageContainerWide} ${bm.sectionGap} py-6`}>
        <HomePlatformHero />
        <HomePopularBatteryRanking />
        <HomePopularVehicleSearch />
        <HomeEvHybridSection />
        <HomeTrendingSection />
        <HomeDeliverySection />
        <HomeStoreHub />
        <HomePopularQna />
        <HomeOrderGuide />
        <SiteFooter />
      </div>
    </main>
  );
}
