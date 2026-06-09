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
      description="고객센터·채팅 접수 문의를 확인합니다. 배터리톡 상담은 배터리톡 메뉴에서 처리하세요."
    >
      <AdminInquiriesClient />
    </AdminShellLayout>
  );
}
