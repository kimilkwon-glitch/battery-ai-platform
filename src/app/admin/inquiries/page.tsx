import { AdminInquiriesHub } from "@/components/admin/AdminInquiriesHub";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "문의 관리 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminInquiriesPage() {
  return (
    <AdminShellLayout
      title="문의 관리"
      description="상품 문의·주문 문의·상담 문의를 한곳에서 확인하고 답변합니다."
    >
      <AdminInquiriesHub />
    </AdminShellLayout>
  );
}
