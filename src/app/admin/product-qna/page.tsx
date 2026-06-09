import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminProductQnaClient } from "@/components/admin/AdminProductQnaClient";

export default function AdminProductQnaPage() {
  return (
    <AdminShellLayout title="상품 문의" description="상품 상세 Q&A 탭 문의 전용 관리">
      <AdminProductQnaClient />
    </AdminShellLayout>
  );
}
