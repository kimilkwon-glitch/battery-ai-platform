import { AdminInquiriesHub } from "@/components/admin/AdminInquiriesHub";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "상담관리 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminInquiriesPage() {
  return (
    <AdminShellLayout
      title="상담관리"
      description="배터리톡·상품문의·주문문의·사진확인을 한곳에서 확인하고 답변합니다."
    >
      <AdminInquiriesHub />
    </AdminShellLayout>
  );
}
