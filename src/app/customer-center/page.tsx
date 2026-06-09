import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { SupportCenterHubV2 } from "@/components/support/SupportCenterHubV2";
import { getHubSupportNotices } from "@/lib/support-notices-data";

export default async function CustomerCenterPage() {
  const notices = await getHubSupportNotices();

  return (
    <PageShell zone="support" plainBg showSearch={false} showPageHeader={false} showFooter>
      <Suspense fallback={null}>
        <SupportCenterHubV2 notices={notices} />
      </Suspense>
    </PageShell>
  );
}
