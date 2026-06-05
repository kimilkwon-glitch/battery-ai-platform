import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { SupportCenterHubV2 } from "@/components/support/SupportCenterHubV2";

export default function SupportPage() {
  return (
    <PageShell zone="support" showSearch={false} showPageHeader={false} showFooter>
      <Suspense fallback={null}>
        <SupportCenterHubV2 />
      </Suspense>
    </PageShell>
  );
}
