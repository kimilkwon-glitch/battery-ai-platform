import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { ShopClient } from "@/components/platform/ShopClient";

export default function ShopPage() {
  return (
    <PageShell
      pageLabel="택배·쇼핑"
      title="택배·쇼핑"
      description="규격을 확인한 뒤 택배 주문 안내·상품 목록을 확인하세요."
      searchPlaceholder="규격·차종·브랜드 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <ShopClient />
      </Suspense>
    </PageShell>
  );
}
