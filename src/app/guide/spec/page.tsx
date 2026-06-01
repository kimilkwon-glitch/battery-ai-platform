import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PortalLayout } from "@/components/portal";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";
import { GuideHubClient } from "@/components/platform/GuideHubClient";
import { compareHref, photoHref } from "@/lib/platform-data";

export default async function SpecGuidePage({ searchParams }: { searchParams: Promise<{ guide?: string; q?: string }> }) {
  const { guide } = await searchParams;

  return (
    <PortalLayout
      title="배터리 규격 가이드"
      description="AGM/DIN, 단자 방향, CCA/Ah, EV 12V, BMS 등록 — 차량별 배터리 데이터 기준 실무 가이드"
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "규격 가이드" }]}
      crossLinks={[
        { title: "사진으로 규격 확인", description: "라벨·단자 촬영 후 규격 대조", href: photoHref("AGM80L") },
        { title: "AGM80L vs DIN74L", description: "자주 혼동하는 규격 비교", href: compareHref("AGM80L", "DIN74L") },
        { title: "차종 검색", description: "연식·연료별 배터리 확인", href: "/vehicles" },
        { title: "배터리 Q&A", description: "호환·교체 실무 문의", href: "/community" },
      ]}
      sidebar={null}
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <GuideHubClient initialGuideId={guide} />
      </Suspense>
      <div className="mt-8">
        <BatteryGuidePostsHub category="battery_spec" showHeader={false} />
      </div>
    </PortalLayout>
  );
}
