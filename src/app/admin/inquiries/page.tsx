import { AdminInquiriesClient } from "@/components/admin/AdminInquiriesClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "고객 문의 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminInquiriesPage() {
  return (
    <AdminShellLayout
      title="고객 문의 관리"
      description="고객센터·채팅·제품상세 접수 문의를 확인하고 처리합니다."
    >
      <AdminInquiriesClient />
    </AdminShellLayout>
  );
}
