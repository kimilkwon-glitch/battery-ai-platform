import { PageShell } from "@/components/common/PageShell";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";

export const dynamic = "force-dynamic";

export default function PhotoCheckPage() {
  return (
    <PageShell
      pageLabel="사진 확인"
      title="사진 확인 가이드"
      description="라벨·단자·트레이 사진으로 규격을 확인하는 안내 글 목록입니다."
      searchPlaceholder="차종·규격 검색"
    >
      <BatteryGuidePostsHub category="photo_check" />
    </PageShell>
  );
}
