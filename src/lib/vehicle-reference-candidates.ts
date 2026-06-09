import "server-only";

import fs from "fs";
import path from "path";
import type { VehicleReferenceCandidateEntry } from "@/lib/vehicle-reference-candidates-shared";

export type {
  ReferenceCandidateUrl,
  VehicleReferenceCandidateEntry,
} from "@/lib/vehicle-reference-candidates-shared";

export {
  TEST_REFERENCE_SLUGS,
  KONTEXT_TEST_SLUGS,
  KONTEXT_NEXT3_SLUGS,
} from "@/lib/vehicle-reference-candidates-shared";

const REPORT = path.join(process.cwd(), "reports", "vehicle-reference-candidates-test5.json");
const KONTEXT_REPORT = path.join(
  process.cwd(),
  "reports",
  "vehicle-reference-candidates-test2-kontext.json",
);
const KONTEXT_NEXT3_REPORT = path.join(
  process.cwd(),
  "reports",
  "vehicle-reference-candidates-next3-kontext.json",
);

const IMAGE_FILE_BY_SLUG: Record<string, string> = {
  "tucson-jm": "tucson_jm.png",
  "ssangyong-tivoli-air-2016": "ssangyong_tivoli_air_2016.png",
  "ssangyong-tivoli-armour-2017": "ssangyong_tivoli_armour_2017.png",
  "kia-k9-2012": "kia_k9_2012.png",
  "chevrolet-cruze-2011": "chevrolet_cruze_2011.png",
};

/** public URL만 조합 — fs.existsSync/path.join(public) 미사용 */
function resolveGeneratedUrl(brand: string, imageFile: string, folder: string) {
  if (!imageFile.trim()) return { url: null, exists: false };
  const url = `/assets/cars-generated-review/${folder}/${brand}/${imageFile}`;
  return { url, exists: true };
}

type KontextOverride = {
  selectedReferenceUrl: string | null;
  generationAllowed: boolean;
  reason: string | null;
};

function loadKontextReport(filePath: string): Map<string, KontextOverride> {
  if (!fs.existsSync(filePath)) return new Map();
  const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    vehicles: Array<{
      slug: string;
      selectedReferenceUrl: string | null;
      selectedReferenceReason: string | null;
      generationAllowed?: boolean;
      replicateAccessible?: boolean;
    }>;
  };
  return new Map(
    data.vehicles.map((v) => [
      v.slug,
      {
        selectedReferenceUrl: v.selectedReferenceUrl,
        generationAllowed:
          v.generationAllowed ?? v.replicateAccessible ?? Boolean(v.selectedReferenceUrl),
        reason: v.selectedReferenceReason,
      },
    ]),
  );
}

export function loadVehicleReferenceCandidateEntries(
  filterSlugs?: string[],
): VehicleReferenceCandidateEntry[] {
  if (!fs.existsSync(REPORT)) return [];

  const report = JSON.parse(fs.readFileSync(REPORT, "utf8")) as {
    vehicles: Array<{
      slug: string;
      brand: string;
      imageFile?: string;
      vehicleNameKo: string;
      vehicleNameEn: string;
      searchQueries: string[];
      candidateImages: VehicleReferenceCandidateEntry["candidateImages"];
      selectedReferenceUrl: string | null;
      selectedReferenceReason: string | null;
      needsManualReview: boolean;
    }>;
  };

  const kontextBySlug = loadKontextReport(KONTEXT_REPORT);
  const kontextNext3BySlug = loadKontextReport(KONTEXT_NEXT3_REPORT);

  let vehicles = report.vehicles;
  if (filterSlugs?.length) {
    const set = new Set(filterSlugs);
    vehicles = vehicles.filter((v) => set.has(v.slug));
  }

  return vehicles.map((v) => {
    const imageFile = v.imageFile ?? IMAGE_FILE_BY_SLUG[v.slug] ?? `${v.slug.replace(/-/g, "_")}.png`;
    const gen = resolveGeneratedUrl(v.brand, imageFile, "reference-based");
    const kontext = resolveGeneratedUrl(v.brand, imageFile, "reference-based-kontext");
    const kontextNext3 = resolveGeneratedUrl(v.brand, imageFile, "reference-based-kontext-next3");
    const k = kontextBySlug.get(v.slug);
    const k3 = kontextNext3BySlug.get(v.slug);

    return {
      slug: v.slug,
      brand: v.brand,
      imageFile,
      vehicleNameKo: v.vehicleNameKo,
      vehicleNameEn: v.vehicleNameEn,
      searchQueries: v.searchQueries,
      candidateImages: v.candidateImages ?? [],
      selectedReferenceUrl: k?.selectedReferenceUrl ?? v.selectedReferenceUrl,
      selectedReferenceReason: k?.reason ?? v.selectedReferenceReason,
      needsManualReview: v.needsManualReview,
      generatedReferenceBasedImageUrl: gen.url,
      generatedReferenceBasedExists: gen.exists,
      generatedReferenceBasedKontextImageUrl: kontext.url,
      generatedReferenceBasedKontextExists: kontext.exists,
      generatedReferenceBasedKontextNext3ImageUrl: kontextNext3.url,
      generatedReferenceBasedKontextNext3Exists: kontextNext3.exists,
      kontextSelectedReferenceUrl: k?.selectedReferenceUrl ?? null,
      kontextGenerationAllowed: k?.generationAllowed ?? false,
      kontextNext3SelectedReferenceUrl: k3?.selectedReferenceUrl ?? null,
      kontextNext3GenerationAllowed: k3?.generationAllowed ?? false,
    };
  });
}
