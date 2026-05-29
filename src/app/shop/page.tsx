import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { ShopClient } from "@/components/platform/ShopClient";

export default function ShopPage() {
  return (
    <PageShell
      pageLabel="택배주문"
      title="택배주문"
      description="배터리 규격을 확인하고 반납/미반납 옵션을 선택한 뒤 택배 주문 상담을 진행하세요."
      searchPlaceholder="규격·차종·브랜드 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <ShopClient />
      </Suspense>
    </PageShell>
  );
}
