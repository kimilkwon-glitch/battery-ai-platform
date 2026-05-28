import { PageShell } from "@/components/common/PageShell";
import { ServiceHubClient } from "@/components/platform/hub/ServiceHubClient";

export const dynamic = "force-dynamic";

export default function ServiceHubPage() {
  return (
    <PageShell
      pageLabel="매장·택배"
      title="매장·출장·택배 안내"
      description="덕천·학장 직영점, 출장, 택배 중 상황에 맞는 이용 방법을 선택합니다."
      searchPlaceholder="차종·규격 검색"
    >
      <ServiceHubClient />
    </PageShell>
  );
}
