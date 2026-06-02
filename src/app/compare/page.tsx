import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { UpgradeGuideClient } from "@/components/platform/UpgradeGuideClient";

export default function ComparePage() {
  return (
    <PageShell
      pageLabel="배터리 업그레이드"
      title="배터리 용량 업그레이드"
      description="장기주차·블랙박스·전장품 사용이 많다면 용량 업그레이드를 검토할 수 있습니다. 차량 구조 확인 후 안전하게 안내합니다."
      searchPlaceholder="차량명 또는 배터리 규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <UpgradeGuideClient />
      </Suspense>
    </PageShell>
  );
}
