import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { ReviewWritePageClient } from "@/components/reviews/ReviewWritePageClient";

export default function ReviewWritePage() {
  return (
    <PageShell
      pageLabel="후기 작성"
      title="후기 작성"
      description="구매하신 배터리에 대한 후기를 남겨 주세요."
      showFooter
    >
      <div className="mx-auto max-w-xl">
        <Suspense fallback={null}>
          <ReviewWritePageClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
