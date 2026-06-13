import { Suspense } from "react";
import { AdminCommerceClaimsClient } from "@/components/admin/AdminCommerceClaimsClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "취소/반품/환불 관리 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminCommerceClaimsPage() {
  return (
    <AdminShellLayout
      title="취소/반품/환불 관리"
      description="자사몰 주문에 연결된 취소·반품·환불·교환 요청을 확인하고 처리합니다."
      frameClassName="admin-page-frame--workspace admin-page-frame--claims"
    >
      <Suspense fallback={<p className="text-xs text-slate-500">목록 불러오는 중…</p>}>
        <AdminCommerceClaimsClient />
      </Suspense>
    </AdminShellLayout>
  );
}
