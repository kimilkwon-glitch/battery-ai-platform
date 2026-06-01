import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { ShopClient } from "@/components/platform/ShopClient";

export default function ShopPage() {
  return (
    <PageShell
      pageLabel="주문하기"
      title="주문하기"
      description="규격을 확인한 뒤 택배 주문 또는 매장·출장 상담을 선택하세요."
      searchPlaceholder="규격·차종·브랜드 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <ShopClient />
      </Suspense>
    </PageShell>
  );
}
