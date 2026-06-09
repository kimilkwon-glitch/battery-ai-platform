import { AdminBatteryTalkClient } from "@/components/admin/AdminBatteryTalkClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import "@/styles/admin-battery-talk.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "배터리톡 상담 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminBatteryTalkPage() {
  return (
    <AdminShellLayout
      title="배터리톡 상담"
      description="네이버 톡톡 판매자센터 형태의 상담 스레드 관리 — 대화·고객·주문 정보를 한 화면에서 처리합니다."
    >
      <AdminBatteryTalkClient />
    </AdminShellLayout>
  );
}
