import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminPhotoRequestsTable } from "@/components/admin/AdminPhotoRequestsTable";
import { buildPhotoCheckRequestItems } from "@/lib/admin/data/photo-requests-admin";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminPhotoRequestsPage() {
  const orders = await listOrderRequests({ limit: 500 });
  const items = buildPhotoCheckRequestItems(orders);
  const reviewing = items.filter((i) => i.status === "reviewing" || i.status === "received").length;
  const guided = items.filter((i) => i.status === "guided" || i.status === "converted").length;

  return (
    <AdminShellLayout
      title="사진 확인 요청"
      description="사진 첨부 확인이 필요한 접수 건입니다."
      summary={[
        { label: "전체", value: items.length },
        { label: "확인 필요", value: reviewing, tone: reviewing > 0 ? "warning" : "default" },
        { label: "안내/전환", value: guided, tone: "info" },
      ]}
    >
      <AdminPhotoRequestsTable items={items} />
    </AdminShellLayout>
  );
}
