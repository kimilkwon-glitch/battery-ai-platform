import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminSupportNoticesClient } from "@/components/admin/AdminSupportNoticesClient";

export const dynamic = "force-dynamic";

export default function AdminNoticesPage() {
  return (
    <AdminShellLayout
      title="공지/최근 안내"
      description="고객센터 최근 안내·공지사항을 작성·노출 관리합니다."
    >
      <AdminSupportNoticesClient />
    </AdminShellLayout>
  );
}
