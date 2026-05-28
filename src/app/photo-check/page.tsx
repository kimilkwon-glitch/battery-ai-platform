import { PageShell } from "@/components/common/PageShell";
import { PhotoCheckClient } from "@/components/platform/hub/PhotoCheckClient";

export const dynamic = "force-dynamic";

export default function PhotoCheckPage() {
  return (
    <PageShell
      pageLabel="사진 확인"
      title="사진 확인 안내"
      description="라벨·단자·트레이 사진으로 오주문을 줄이는 보조 검증 가이드입니다."
      searchPlaceholder="차종·규격 검색"
    >
      <PhotoCheckClient />
    </PageShell>
  );
}
