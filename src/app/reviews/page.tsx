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
      showPageHeader={false}
      searchPlaceholder="차량·규격 검색"
    >
      <ReviewsPageClient initialBattery={battery} />
    </PageShell>
  );
}
