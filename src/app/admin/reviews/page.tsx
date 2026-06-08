import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";

export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <AdminShellLayout title="고객 후기 관리" description="후기를 추가하고 메인/리뷰 페이지 노출을 관리합니다.">
      <AdminReviewsClient />
    </AdminShellLayout>
  );
}
