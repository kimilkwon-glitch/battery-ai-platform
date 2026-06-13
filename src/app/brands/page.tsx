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
      description="로케트·쏠라이트 전 제품 제원과 현장 안내를 한곳에서 확인하세요."
      searchPlaceholder="브랜드·규격 검색"
      showPageHeader={false}
    >
      <header className="cp-hero brand-hub-page-hero mb-5">
        <p className="cp-hero__kicker">Official Brands</p>
        <h1 className="cp-hero__title bm-section-title">배터리 브랜드 안내</h1>
        <p className="cp-hero__desc">
          로케트·쏠라이트 제품 제원, 현장 안내, 규격별 상세를 브랜드별로 확인하세요.
        </p>
        <span className="cp-hero__accent" aria-hidden />
      </header>
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <BrandHubClient />
      </Suspense>
    </PageShell>
  );
}
