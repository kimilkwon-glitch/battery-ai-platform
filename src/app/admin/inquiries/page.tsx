import { AdminInquiriesClient } from "@/components/admin/AdminInquiriesClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { inquiryList } from "@/lib/inquiry/inquiry-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "고객 문의 | Battery Manager",
  robots: { index: false, follow: false },
};

export default async function AdminInquiriesPage() {
  const items = await inquiryList({ limit: 500 });
  const newCount = items.filter((i) => i.status === "new").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const done = items.filter((i) => i.status === "done").length;
  const onHold = items.filter((i) => i.status === "on_hold").length;

  return (
    <AdminShellLayout
      title="고객 문의"
      description="고객센터·채팅·제품상세 접수 문의를 처리합니다."
      summary={[
        { label: "전체", value: items.length },
        { label: "신규", value: newCount, tone: newCount > 0 ? "info" : "default" },
        { label: "확인중", value: inProgress, tone: inProgress > 0 ? "warning" : "default" },
        { label: "처리완료", value: done, tone: "info" },
        { label: "보류", value: onHold, tone: onHold > 0 ? "warning" : "default" },
      ]}
    >
      <AdminInquiriesClient />
    </AdminShellLayout>
  );
}
