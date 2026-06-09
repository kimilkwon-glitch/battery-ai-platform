import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { VehicleReferenceReviewClient } from "@/components/admin/VehicleReferenceReviewClient";
import { buildVehicleImageInventory } from "@/lib/vehicle-image-inventory";
import { loadVehicleReferenceCandidateEntries } from "@/lib/vehicle-reference-candidates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "차량 레퍼런스 검수 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminVehicleReferenceReviewPage() {
  const referenceEntries = loadVehicleReferenceCandidateEntries();
  const slugSet = new Set(referenceEntries.map((e) => e.slug));
  const { entries } = buildVehicleImageInventory();
  const inventoryBySlug = Object.fromEntries(
    entries.filter((e) => slugSet.has(e.slug)).map((e) => [e.slug, e]),
  );

  return (
    <AdminShellLayout
      title="차량 레퍼런스 검수"
      description="레퍼런스 URL·Kontext 생성 후보를 검수합니다. 테스트 5대 + reports JSON 기준."
    >
      {referenceEntries.length === 0 ? (
        <div className="admin-panel p-4 text-sm text-slate-600">
          <p>
            <code>reports/vehicle-reference-candidates-test5.json</code> 리포트가 없습니다. 로컬에서
            리포트를 생성한 뒤 새로고침하세요.
          </p>
        </div>
      ) : (
        <VehicleReferenceReviewClient
          referenceEntries={referenceEntries}
          inventoryBySlug={inventoryBySlug}
        />
      )}
    </AdminShellLayout>
  );
}
