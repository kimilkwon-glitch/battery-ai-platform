import { PageShell } from "@/components/common/PageShell";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";
import { PhotoCheckIntakeSection } from "@/components/photo-check/PhotoCheckIntakeSection";
import { listPublishedGuidePosts } from "@/lib/guide/battery-guide-posts";

export const dynamic = "force-dynamic";

export default async function PhotoCheckPage() {
  const guidePosts = await listPublishedGuidePosts("photo_check");

  return (
    <PageShell
      pageLabel="사진 확인"
      title="사진으로 배터리 확인"
      description="배터리 라벨·단자 사진을 보내주시면 규격 확인을 도와드립니다."
      searchPlaceholder="차종·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <PhotoCheckIntakeSection />
        <BatteryGuidePostsHub
          category="photo_check"
          showHeader={false}
          posts={guidePosts}
          listTitle="사진 확인 가이드"
        />
      </div>
    </PageShell>
  );
}
