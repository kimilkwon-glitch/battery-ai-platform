import { AdminContentClient } from "@/components/admin/AdminContentClient";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { getAdminContentItems } from "@/lib/admin/getAdminContentItems";

export default function AdminContentPage() {
  const { items } = getAdminContentItems();
  const published = items.filter((i) => i.status === "published").length;
  const draft = items.filter((i) => i.status === "draft").length;
  const hidden = items.filter((i) => i.status === "hidden").length;

  return (
    <AdminShellLayout
      title="콘텐츠"
      description="가이드·Q&A·증상 안내 콘텐츠를 관리합니다."
      summary={[
        { label: "전체", value: items.length },
        { label: "게시중", value: published, tone: "info" },
        { label: "임시저장", value: draft },
        { label: "숨김", value: hidden },
      ]}
    >
      <AdminContentClient initialItems={items} embedded />
    </AdminShellLayout>
  );
}
