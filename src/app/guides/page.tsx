import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { BatteryGuideHubClient } from "@/components/guide/BatteryGuideHubClient";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";
import { listPublishedGuidePosts } from "@/lib/guide/battery-guide-posts";

/** 배터리 가이드 — 카테고리 4개 + CMS 가이드 카드 */
export default async function GuidesPage() {
  const guidePosts = await listPublishedGuidePosts();

  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title="배터리 가이드"
      description="점검·증상·불량·AS 안내를 카테고리별로 확인하세요."
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
      showPageHeader={false}
    >
      <Suspense fallback={<ContentAreaFallback lines={6} />}>
        <BatteryGuideHubClient />
      </Suspense>
      <div className="mt-8">
        <BatteryGuidePostsHub
          showHeader={false}
          posts={guidePosts}
          listTitle="가이드 글 모음"
        />
      </div>
    </PageShell>
  );
}
