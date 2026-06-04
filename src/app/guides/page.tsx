import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { BatteryGuideHubClient } from "@/components/guide/BatteryGuideHubClient";

/** 배터리 가이드 — 카테고리 4개 + 선택 시 하단 콘텐츠 전환 */
export default function GuidesPage() {
  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title="배터리 가이드"
      description="점검·증상·불량·AS 안내를 카테고리별로 확인하세요."
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={6} />}>
        <BatteryGuideHubClient />
      </Suspense>
    </PageShell>
  );
}
