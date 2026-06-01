import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { OrderMessageGuideClient } from "@/components/customer/MessageTemplatePreview";
import { ORDER_MESSAGE_GUIDE_COPY } from "@/data/order-message-templates";

export default function SupportMessageGuidePage() {
  return (
    <PageShell
      zone="support"
      pageLabel="안내 메시지"
      title={ORDER_MESSAGE_GUIDE_COPY.pageTitle}
      description={ORDER_MESSAGE_GUIDE_COPY.pageDescription}
      searchPlaceholder="차량·규격 검색"
    >
      <Suspense fallback={null}>
        <OrderMessageGuideClient />
      </Suspense>
    </PageShell>
  );
}
