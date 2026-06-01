import { PageShell } from "@/components/common/PageShell";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";

export const dynamic = "force-dynamic";

export default function OrderChecklistPage() {
  return (
    <PageShell
      pageLabel="오주문 방지"
      title="주문 전 확인 가이드"
      description="주문 전 차종·규격·단자를 점검하는 안내 글 목록입니다."
      searchPlaceholder="차종·규격 검색"
    >
      <BatteryGuidePostsHub category="order_check" />
    </PageShell>
  );
}
