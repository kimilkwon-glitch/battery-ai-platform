import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { CompareClient } from "@/components/platform/CompareClient";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const { items } = await searchParams;
  const selected = items?.split(",").map((s) => s.trim()).filter(Boolean) ?? ["AGM70L", "AGM80L"];

  return (
    <PageShell
      pageLabel="배터리 비교"
      title="둘 중 뭐가 맞는지 헷갈릴 때"
      description={`${selected.join(" vs ")} — 용량·단자·장착 차종 차이를 나란히 봅니다.`}
      searchPlaceholder="비교할 배터리 규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <CompareClient initial={selected} />
      </Suspense>
    </PageShell>
  );
}
