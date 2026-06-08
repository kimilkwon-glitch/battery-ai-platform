import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { VehicleReferenceReviewClient } from "@/components/admin/VehicleReferenceReviewClient";
import { buildVehicleImageInventory } from "@/lib/vehicle-image-inventory";
import { loadVehicleReferenceCandidateEntries } from "@/lib/vehicle-reference-candidates";

export const metadata = {
  title: "참고 이미지 검수 (테스트 5대) | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminVehicleReferenceReviewPage() {
  const referenceEntries = loadVehicleReferenceCandidateEntries();
  const inventory = buildVehicleImageInventory();
  const inventoryBySlug = new Map(inventory.entries.map((e) => [e.slug, e]));

  return (
    <AdminShellLayout
      title="참고 이미지 · Reference 기반 생성 검수"
      description="테스트 5대 참고 URL과 flux-dev / flux-1.1-pro / reference-based / kontext 생성 결과를 비교합니다."
    >
      <VehicleReferenceReviewClient referenceEntries={referenceEntries} inventoryBySlug={inventoryBySlug} />
    </AdminShellLayout>
  );
}
