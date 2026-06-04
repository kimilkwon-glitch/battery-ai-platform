import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { UpgradeGuideClient } from "@/components/platform/UpgradeGuideClient";

export default function ComparePage() {
  return (
    <PageShell
      pageLabel="배터리 업그레이드"
      showPageHeader={false}
      searchPlaceholder="차량명 또는 배터리 규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <UpgradeGuideClient />
      </Suspense>
    </PageShell>
  );
}
