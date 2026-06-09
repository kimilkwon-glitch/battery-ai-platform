import { PageShell } from "@/components/common/PageShell";
import { PhotoCheckIntakeSection } from "@/components/photo-check/PhotoCheckIntakeSection";

export const dynamic = "force-dynamic";

export default function PhotoCheckPage() {
  return (
    <PageShell
      pageLabel="사진 확인"
      title="사진으로 배터리 확인"
      description="배터리 라벨·단자 사진을 보내주시면 규격 확인을 도와드립니다."
      searchPlaceholder="차종·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <PhotoCheckIntakeSection />
      </div>
    </PageShell>
  );
}
