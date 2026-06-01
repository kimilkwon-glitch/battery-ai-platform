import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { BrandHubClient } from "@/components/platform/BrandHubClient";

export default function BrandsPage() {
  return (
    <PageShell
      zone="brand"
      pageLabel="브랜드 안내"
      title="배터리 브랜드 안내"
      description="로케트·쏠라이트 대표 규격과 현장 안내를 한곳에서 확인하세요."
      searchPlaceholder="브랜드·규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <BrandHubClient />
      </Suspense>
    </PageShell>
  );
}
