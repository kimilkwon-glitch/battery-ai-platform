import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { CompareClient } from "@/components/platform/CompareClient";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const { items } = await searchParams;
  const selected = items?.split(",").map((s) => s.trim()).filter(Boolean) ?? ["AGM70L", "AGM80L"];

  return (
    <PageShell
      pageLabel="배터리 업그레이드"
      title="배터리 용량 업그레이드"
      description="순정 규격보다 큰 배터리를 장착할 수 있는지 확인하세요. 차종·연식·트레이 공간·단자 방향에 따라 가능 여부가 달라질 수 있습니다."
      searchPlaceholder="차량명 또는 배터리 규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <CompareClient initial={selected} />
      </Suspense>
    </PageShell>
  );
}
