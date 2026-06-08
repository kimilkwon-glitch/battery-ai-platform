import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminPromotionsClient } from "@/components/admin/AdminPromotionsClient";

export const dynamic = "force-dynamic";

export default function AdminPromotionsPage() {
  return (
    <AdminShellLayout
      title="쿠폰/혜택 관리"
      description="자동 혜택·쿠폰코드·메인/혜택 페이지 노출을 운영자가 직접 관리합니다."
    >
      <AdminPromotionsClient />
    </AdminShellLayout>
  );
}
