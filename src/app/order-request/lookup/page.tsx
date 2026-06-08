import { Suspense } from "react";
import type { Metadata } from "next";
import { PageShell } from "@/components/common/PageShell";
import { OrderRequestLookupClient } from "@/components/order-request/OrderRequestLookupClient";

export const metadata: Metadata = {
  title: "상담 접수 조회",
  description: "상담 접수번호와 연락처로 문의 접수 상태를 확인할 수 있습니다.",
};

export default function OrderRequestLookupPage() {
  return (
    <PageShell zone="lookup" plainBg showSearch={false} showPageHeader={false} showFooter>
      <Suspense fallback={null}>
        <OrderRequestLookupClient />
      </Suspense>
    </PageShell>
  );
}
