import { PageShell } from "@/components/common/PageShell";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";
import { listPublishedGuidePosts } from "@/lib/guide/battery-guide-posts";

/** 배터리 가이드 — CMS 카드 목록 */
export default async function GuidesPage() {
  const guidePosts = await listPublishedGuidePosts();

  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title="배터리 가이드"
      description="규격·증상·주문·사진 확인 등 실무 가이드를 모았습니다."
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <BatteryGuidePostsHub showHeader={false} posts={guidePosts} listTitle="가이드 글 모음" />
    </PageShell>
  );
}
