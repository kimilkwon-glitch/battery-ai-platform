import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { PhotoAnalysisClient } from "@/components/platform/PhotoAnalysisClient";

export default async function PhotoAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; battery?: string; vehicle?: string }>;
}) {
  const params = await searchParams;
  const batteryCode = params.battery?.trim() || params.q?.trim() || "AGM80L";

  return (
    <PageShell pageLabel="사진 확인" searchPlaceholder="차량·규격 검색">
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <PhotoAnalysisClient initialBattery={batteryCode} />
      </Suspense>
    </PageShell>
  );
}
