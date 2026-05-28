import { PageShell } from "@/components/common/PageShell";
import { ServiceHubClient } from "@/components/platform/hub/ServiceHubClient";

export const dynamic = "force-dynamic";

export default function ServiceHubPage() {
  return (
    <PageShell
      pageLabel="매장·택배"
      title="매장·출장·택배 안내"
      description="시동이 안 걸리면 출장, 규격을 알면 택배. 방문·출장·택배 중 상황에 맞게 고르시면 됩니다."
      searchPlaceholder="차종·규격 검색"
    >
      <ServiceHubClient />
    </PageShell>
  );
}
