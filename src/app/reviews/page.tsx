import { PageShell } from "@/components/common/PageShell";
import { ReviewsPageClient } from "@/components/reviews/ReviewsPageClient";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ battery?: string }>;
}) {
  const { battery } = await searchParams;

  return (
    <PageShell
      zone="review"
      pageLabel="리뷰"
      title="배터리 교체 후기"
      description="실제 작업 후기를 기준으로 정리한 배터리 교체 사례입니다. 지점별 후기도 함께 확인할 수 있습니다."
      searchPlaceholder="차량·규격 검색"
    >
      <ReviewsPageClient initialBattery={battery} />
    </PageShell>
  );
}
