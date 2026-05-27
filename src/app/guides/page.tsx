import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { GuidesHubClient } from "@/components/platform/GuidesHubClient";

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;

  return (
    <PageShell pageLabel="배터리 가이드" searchPlaceholder="쏘렌토 MQ4, 포터2, AGM80R 가이드 검색">
      <Suspense fallback={<ContentAreaFallback lines={4} />}>
        <GuidesHubClient initialCategory={category} />
      </Suspense>
    </PageShell>
  );
}
