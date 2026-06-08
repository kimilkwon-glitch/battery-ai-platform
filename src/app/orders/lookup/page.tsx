import { Suspense } from "react";
import type { Metadata } from "next";
import { PageShell } from "@/components/common/PageShell";
import { CommerceOrderLookupClient } from "@/components/orders/CommerceOrderLookupClient";

export const metadata: Metadata = {
  title: "주문 조회",
  description: "주문번호와 연락처로 결제·주문 내역을 확인할 수 있습니다.",
};

export default function CommerceOrderLookupPage() {
  return (
    <PageShell zone="lookup" plainBg showSearch={false} showPageHeader={false} showFooter>
      <Suspense fallback={null}>
        <CommerceOrderLookupClient />
      </Suspense>
    </PageShell>
  );
}
