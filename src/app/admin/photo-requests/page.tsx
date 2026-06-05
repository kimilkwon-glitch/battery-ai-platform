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
      description="사진 확인이 필요한 접수 건입니다. 파일 저장 연동은 TODO — 현재 주문 요청 플래그 기반입니다."
    >
      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        TODO: 사진 업로드 스토리지(S3/Supabase) 연동 후 photoCount·미리보기를 실제 파일 기준으로 표시합니다.
      </p>
      <AdminPhotoRequestsTable items={items} />
    </AdminShellLayout>
  );
}
