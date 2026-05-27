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
      pageLabel="매장·출장"
      title="매장·출장 · 덕천점·학장점"
      description="직영점 안내, 출장·내방 가능 지역, 교체 상담을 한 페이지에서 확인합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <Suspense fallback={<ContentAreaFallback lines={3} />}>
        <ServiceCenterClient vehicleLabel={params.vehicle} battery={params.battery} symptom={params.symptom} />
      </Suspense>
    </PageShell>
  );
}
