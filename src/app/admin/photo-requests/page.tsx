import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminPhotoRequestsTable } from "@/components/admin/AdminPhotoRequestsTable";
import { buildPhotoCheckRequestItems } from "@/lib/admin/data/photo-requests-admin";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";

export default async function AdminPhotoRequestsPage() {
  const orders = await listOrderRequests({ limit: 500 });
  const items = buildPhotoCheckRequestItems(orders);

  return (
    <AdminShellLayout
      title="사진 확인 요청 관리"
      description="사진 확인이 필요한 접수 건입니다."
    >
      <AdminPhotoRequestsTable items={items} />
    </AdminShellLayout>
  );
}
