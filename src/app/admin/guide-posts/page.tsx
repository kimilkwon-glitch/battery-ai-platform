import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminGuidePostsClient } from "@/components/admin/AdminGuidePostsClient";

export const dynamic = "force-dynamic";

export default function AdminGuidePostsPage() {
  return (
    <AdminShellLayout
      title="배터리 가이드"
      description="규격·증상·주문 전 확인 등 배터리 가이드 글을 관리합니다."
    >
      <AdminGuidePostsClient />
    </AdminShellLayout>
  );
}
