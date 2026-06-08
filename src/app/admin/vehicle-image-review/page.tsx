import fs from "fs";
import path from "path";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { VehicleImageReviewClient } from "@/components/admin/VehicleImageReviewClient";
import { buildVehicleImageInventory } from "@/lib/vehicle-image-inventory";
export const metadata = {
  title: "차량 이미지 검수 | Battery Manager",
  robots: { index: false, follow: false },
};

type StoredReport = {
  entries?: ReturnType<typeof buildVehicleImageInventory>["entries"];
  orphans?: ReturnType<typeof buildVehicleImageInventory>["orphans"];
  summary?: ReturnType<typeof buildVehicleImageInventory>["summary"];
  restoreBuckets?: ReturnType<typeof buildVehicleImageInventory>["restoreBuckets"];
};

function mergeGeneratedReviewFields(
  entries: ReturnType<typeof buildVehicleImageInventory>["entries"],
  live: ReturnType<typeof buildVehicleImageInventory>["entries"],
) {
  const liveBySlug = new Map(live.map((e) => [e.slug, e]));
  return entries.map((entry) => {
    const disk = liveBySlug.get(entry.slug);
    if (!disk) return entry;
    return {
      ...entry,
      generatedReviewImageUrl: disk.generatedFluxDevImageUrl,
      generatedReviewDiskPath: disk.generatedFluxDevDiskPath,
      generatedReviewExists: disk.generatedFluxDevExists,
      generatedFluxDevImageUrl: disk.generatedFluxDevImageUrl,
      generatedFluxDevDiskPath: disk.generatedFluxDevDiskPath,
      generatedFluxDevExists: disk.generatedFluxDevExists,
      generatedFlux11ProImageUrl: disk.generatedFlux11ProImageUrl,
      generatedFlux11ProDiskPath: disk.generatedFlux11ProDiskPath,
      generatedFlux11ProExists: disk.generatedFlux11ProExists,
    };
  });
}

function loadCachedReport(): StoredReport | null {
  const reportPath = path.join(process.cwd(), "reports", "vehicle-image-audit.json");
  if (!fs.existsSync(reportPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8")) as StoredReport;
  } catch {
    return null;
  }
}

export default function AdminVehicleImageReviewPage() {
  const cached = loadCachedReport();
  const fallback = buildVehicleImageInventory();

  const inventory =
    cached?.entries?.length && cached.summary
      ? {
          entries: mergeGeneratedReviewFields(cached.entries, fallback.entries),
          orphans: cached.orphans ?? [],
          summary: cached.summary,
          restoreBuckets: cached.restoreBuckets ?? fallback.restoreBuckets,
        }
      : fallback;

  return (
    <AdminShellLayout
      title="차량 이미지 검수 (Before / After)"
      description="현재 / 백업 / flux-dev / flux-1.1-pro Replicate 생성 이미지를 나란히 비교합니다."
    >
      <VehicleImageReviewClient
        entries={inventory.entries}
        orphans={inventory.orphans}
        summary={inventory.summary}
        restoreBuckets={inventory.restoreBuckets}
      />
    </AdminShellLayout>
  );
}
