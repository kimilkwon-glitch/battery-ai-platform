import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { SupportCenterHubV2 } from "@/components/support/SupportCenterHubV2";
import { getHubSupportNotices } from "@/lib/support-notices-data";
import { getPublishedSupportFaqItems } from "@/lib/support-faq-public.server";

export default async function CustomerCenterPage() {
  const [notices, faqItems] = await Promise.all([
    getHubSupportNotices(),
    getPublishedSupportFaqItems(),
  ]);

  return (
    <PageShell zone="support" plainBg showSearch={false} showPageHeader={false} showFooter>
      <Suspense fallback={null}>
        <SupportCenterHubV2 notices={notices} faqItems={faqItems} />
      </Suspense>
    </PageShell>
  );
}
