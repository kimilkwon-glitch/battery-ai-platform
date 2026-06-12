import { Suspense } from "react";

import { AdminOrderDetailPageClient } from "@/components/admin/AdminOrderDetailPageClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { return: returnQuery } = await searchParams;

  return (
    <AdminShellLayout
      title="주문 상세"
      description="주문 정보 확인 · 상태 처리 · 배송 · 메모"
      frameClassName="admin-page-frame--orders admin-page-frame--order-detail"
    >
      <Suspense fallback={<p className="text-sm text-slate-500">주문 상세 불러오는 중…</p>}>
        <AdminOrderDetailPageClient orderId={orderId} returnQuery={returnQuery} />
      </Suspense>
    </AdminShellLayout>
  );
}
