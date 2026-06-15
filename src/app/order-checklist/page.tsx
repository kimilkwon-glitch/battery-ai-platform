import { PageShell } from "@/components/common/PageShell";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";
import { listPublishedGuidePosts } from "@/lib/guide/battery-guide-posts";

export const dynamic = "force-dynamic";

export default async function OrderChecklistPage() {
  const guidePosts = await listPublishedGuidePosts("order_check");

  return (
    <PageShell
      pageLabel="오주문 방지"
      title="주문 전 확인 가이드"
      description="주문 전 차종·규격·단자를 점검하는 안내 글 목록입니다."
      searchPlaceholder="차종·규격 검색"
    >
      <BatteryGuidePostsHub category="order_check" posts={guidePosts} />
    </PageShell>
  );
}
