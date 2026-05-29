import { Suspense } from "react";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PageShell } from "@/components/common/PageShell";
import { ServiceCenterClient } from "@/components/platform/ServiceCenterClient";

export default async function ServiceCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string; battery?: string; symptom?: string }>;
}) {
  const params = await searchParams;

  return (
    <PageShell
      zone="store"
      pageLabel="매장·출장"
      title="매장·출장 안내"
      description="부산 지역은 가까운 직영점 기준으로 빠르게 안내드립니다. 동네명을 입력하면 가까운 지점을 확인할 수 있습니다."
      searchPlaceholder="차량·규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <ServiceCenterClient vehicleLabel={params.vehicle} battery={params.battery} symptom={params.symptom} />
      </Suspense>
    </PageShell>
  );
}
