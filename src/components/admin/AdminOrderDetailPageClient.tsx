"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminCommerceOrderOpsPanel } from "@/components/admin/AdminCommerceOrderOpsPanel";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

type Props = {
  orderId: string;
  returnQuery?: string;
};

export function AdminOrderDetailPageClient({ orderId, returnQuery }: Props) {
  const router = useRouter();
  const backHref = returnQuery?.trim()
    ? `${ADMIN_ROUTES.orders}?${returnQuery.trim()}`
    : ADMIN_ROUTES.orders;

  return (
    <div className="admin-order-detail-page">
      <div className="admin-order-detail-page__toolbar">
        <Link href={backHref} className="admin-order-detail-page__back">
          ← 목록으로
        </Link>
      </div>
      <AdminCommerceOrderOpsPanel
        orderId={orderId}
        layout="page"
        onUpdated={() => router.refresh()}
      />
    </div>
  );
}
