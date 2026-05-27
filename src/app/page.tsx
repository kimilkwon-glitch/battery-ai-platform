import { PortalHeader } from "@/components/portal";
import { HomeActivitySection } from "@/components/platform/HomeActivitySection";
import { HomeHero } from "@/components/platform/HomeHero";
import { HomeOrderGuide } from "@/components/platform/HomeOrderGuide";
import { HomeQuickFind } from "@/components/platform/HomeQuickFind";
import { HomeStoreSection } from "@/components/platform/HomeStoreSection";
import { SiteFooter } from "@/components/common/SiteFooter";
import { bm } from "@/lib/design-tokens";

export default function Home() {
  return (
    <main className={bm.pageBg}>
      <PortalHeader showSearch />

      <div className={`${bm.pageContainerWide} ${bm.sectionGap} py-6`}>
        <HomeHero />
        <HomeQuickFind />
        <HomeActivitySection />
        <HomeOrderGuide />
        <HomeStoreSection />
        <SiteFooter />
      </div>
    </main>
  );
}
