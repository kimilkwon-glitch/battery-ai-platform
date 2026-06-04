import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { CustomerCenterHub } from "@/components/support/CustomerCenterHub";
import { SupportCenterClient } from "@/components/support/SupportCenterClient";

export default function SupportPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="고객센터"
      title="고객센터"
      description="주문, 배송, 교환·반품, 배터리 문의를 한곳에서 확인하세요."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="space-y-8">
        <CustomerCenterHub />
        <Suspense fallback={null}>
          <SupportCenterClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
