import { Suspense } from "react";
import { AdminOrderRequestsClient } from "@/components/admin/AdminOrderRequestsClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { statsFromListItems } from "@/lib/order-request/order-request-admin-stats";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

type Props = {
  searchParams: Promise<{ fallback?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminOrderRequestsPage({ searchParams }: Props) {
  const { fallback } = await searchParams;
  const items = await listOrderRequests({ limit: 500 });
  const stats = statsFromListItems(items);

  return (
    <AdminShellLayout
      title="상담 주문"
      description="상담 접수·연락·상태 변경을 관리합니다."
      summary={[
        { label: "전체", value: stats.total },
        {
          label: "확인 필요",
          value: stats.needsReview,
          tone: stats.needsReview > 0 ? "warning" : "default",
        },
        { label: "연락 완료", value: stats.contacted, tone: "info" },
        { label: "출장 상담", value: stats.visitInstall },
      ]}
    >
      <Suspense fallback={<p className="text-xs text-slate-500">불러오는 중…</p>}>
        <AdminOrderRequestsClient allowLocalFallback={fallback === "local"} />
      </Suspense>
    </AdminShellLayout>
  );
}
