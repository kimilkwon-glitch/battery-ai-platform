import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { BrandHubClient } from "@/components/platform/BrandHubClient";

export default function BrandsPage() {
  return (
    <PageShell
      pageLabel="브랜드 안내"
      title="배터리 브랜드 안내"
      description="브랜드별 대표 표기와 규격 차이를 간단히 확인하세요."
      searchPlaceholder="브랜드·규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <BrandHubClient />
      </Suspense>
    </PageShell>
  );
}
