import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSupportFaqClient } from "@/components/admin/AdminSupportFaqClient";

export const dynamic = "force-dynamic";

export default function AdminFaqPage() {
  return (
    <AdminShellLayout
      title="FAQ 관리"
      description="고객센터 자주 묻는 질문(FAQ)을 관리합니다."
    >
      <AdminSupportFaqClient />
    </AdminShellLayout>
  );
}
