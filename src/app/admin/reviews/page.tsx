import { AdminReviewWorkbenchClient } from "@/components/admin/AdminReviewWorkbenchClient";
import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <AdminShellLayout
      title="리뷰 관리"
      description="고객 리뷰 현황을 확인하고 답글을 작성합니다."
    >
      <div className="space-y-8">
        <AdminReviewWorkbenchClient />
        <details className="admin-panel">
          <summary className="cursor-pointer p-4 text-sm font-bold text-slate-600">
            후기 등록·메인 노출 설정 (고급)
          </summary>
          <div className="border-t border-slate-100 p-4">
            <AdminReviewsClient />
          </div>
        </details>
      </div>
    </AdminShellLayout>
  );
}
