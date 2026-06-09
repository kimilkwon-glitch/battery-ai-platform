import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { VehicleImageReviewClient } from "@/components/admin/VehicleImageReviewClient";
import { buildVehicleImageInventory } from "@/lib/vehicle-image-inventory";
import { listVehicleImageReviews } from "@/lib/vehicle-image-review-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "차량 이미지 검수 | Battery Manager",
  robots: { index: false, follow: false },
};

export default async function AdminVehicleImageReviewPage() {
  const { entries, orphans, summary, restoreBuckets } = buildVehicleImageInventory();
  const reviewRecords = await listVehicleImageReviews();
  const reviewsBySlug = Object.fromEntries(reviewRecords.map((r) => [r.slug, r]));

  const pending = entries.filter((e) => !e.primaryExists || e.visualRiskStatus !== "OK").length;
  const damaged = summary.visualRiskCounts.DAMAGED_FILE;
  const approved = reviewRecords.filter((r) => r.status === "approved").length;

  return (
    <AdminShellLayout
      title="차량 이미지 검수"
      description="이미지 상태를 검수합니다. 승인/보류는 기록만 저장합니다."
      summary={[
        { label: "전체", value: entries.length },
        { label: "검수 대기", value: pending, tone: pending > 0 ? "warning" : "default" },
        { label: "손상 의심", value: damaged, tone: damaged > 0 ? "danger" : "default" },
        { label: "승인 기록", value: approved, tone: "info" },
      ]}
    >
      <VehicleImageReviewClient
        entries={entries}
        orphans={orphans}
        summary={summary}
        restoreBuckets={restoreBuckets}
        initialReviewsBySlug={reviewsBySlug}
      />
    </AdminShellLayout>
  );
}
