import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { ShopClient } from "@/components/platform/ShopClient";

export default function ShopPage() {
  return (
    <PageShell pageLabel="택배·쇼핑" searchPlaceholder="규격·차종·브랜드 검색">
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <ShopClient />
      </Suspense>
    </PageShell>
  );
}
