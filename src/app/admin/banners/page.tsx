import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminBannersClient } from "@/components/admin/AdminBannersClient";

export const dynamic = "force-dynamic";

export default function AdminBannersPage() {
  return (
    <AdminShellLayout title="메인 배너 관리" description="메인 히어로 배너를 추가·순서·노출 기간으로 관리합니다.">
      <AdminBannersClient />
    </AdminShellLayout>
  );
}
