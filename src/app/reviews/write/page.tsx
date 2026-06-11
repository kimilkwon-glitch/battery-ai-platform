import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { ReviewWritePageClient } from "@/components/reviews/ReviewWritePageClient";

export default function ReviewWritePage() {
  return (
    <PageShell showPageHeader={false} showFooter plainBg zone="review">
      <div className="review-write-page">
        <Suspense fallback={null}>
          <ReviewWritePageClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
