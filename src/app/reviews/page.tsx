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
      pageLabel="리뷰"
      title="배터리 교체 후기"
      description="덕천점·학장점 교체 후기와 작업 사례를 확인하세요."
      searchPlaceholder="차량·규격 검색"
    >
      <ReviewsPageClient initialBattery={battery} />
    </PageShell>
  );
}
