/**
 * 쉐보레/GM대우 — /assets/cars-normalized/chevrolet-gmdaewoo/
 */
import type { VehicleAsset } from "@/lib/car-assets";
import { carNormalizedImageUrl } from "@/lib/car-image-url";
import {
  CHEVROLET_IMAGE_BRAND_DIR,
  VEHICLE_GENERATIONS_CHEVROLET,
  type VehicleGenerationChevrolet,
} from "@/data/vehicle-generation-chevrolet.config";
import { formatCustomerBatterySummaryForAsset } from "@/lib/search/customer-search-display";

function generationToAsset(g: VehicleGenerationChevrolet): VehicleAsset {
  const draft: VehicleAsset = {
    id: g.id,
    brand: "chevrolet-gmdaewoo",
    modelGroup: g.modelGroup,
    displayName: g.displayName,
    generationName: g.generationName,
    aliases: [...new Set([g.displayName, ...(g.searchAliases ?? [])])],
    imageFile: g.imageFile,
    image: carNormalizedImageUrl("chevrolet-gmdaewoo", g.imageFile),
    batteryNotes:
      g.battery.status === "linked" && g.battery.defaultBatteryCode
        ? `대표 규격 ${g.battery.defaultBatteryCode}`
        : g.battery.status === "needsReview"
          ? "상담 확인 필요"
          : "연식·옵션별 상담 확인 권장",
    tags: g.tags,
    yearRange: g.yearRange,
    catalogId: g.id,
    defaultBatteryCode:
      g.battery.status === "linked" ? g.battery.defaultBatteryCode : undefined,
    recommendExcluded: g.recommendExcluded,
    batteryMatchStatus: g.battery.status === "needsReview" ? "needsReview" : "linked",
    dbModels: g.dbModels,
    yearStart: g.yearStart,
  };
  return {
    ...draft,
    batteryNotes: formatCustomerBatterySummaryForAsset(draft),
  };
}

export const vehicleAssetsChevrolet: VehicleAsset[] =
  VEHICLE_GENERATIONS_CHEVROLET.map(generationToAsset);

export const CHEVROLET_SLUG_HINT_TO_ASSET_ID: Record<string, string> = Object.fromEntries(
  VEHICLE_GENERATIONS_CHEVROLET.map((g) => [g.id, g.id]),
);
