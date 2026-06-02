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

const DEFAULT_NOTE =
  "연식, 연료, ISG 여부에 따라 배터리 규격 확인이 필요합니다.";

function generationToAsset(g: VehicleGenerationChevrolet): VehicleAsset {
  const batteryNotes =
    g.battery.status === "needsReview"
      ? (g.battery.note ?? "배터리 규격: vehicle-battery-db 미등록 — 사진·문의로 확인 (needsReview).")
      : (g.battery.note ?? DEFAULT_NOTE);

  return {
    id: g.id,
    brand: "chevrolet-gmdaewoo",
    modelGroup: g.modelGroup,
    displayName: g.displayName,
    generationName: g.generationName,
    aliases: [g.displayName],
    imageFile: g.imageFile,
    image: carNormalizedImageUrl("chevrolet-gmdaewoo", g.imageFile),
    batteryNotes,
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
}

export const vehicleAssetsChevrolet: VehicleAsset[] =
  VEHICLE_GENERATIONS_CHEVROLET.map(generationToAsset);

export const CHEVROLET_SLUG_HINT_TO_ASSET_ID: Record<string, string> = Object.fromEntries(
  VEHICLE_GENERATIONS_CHEVROLET.map((g) => [g.id, g.id]),
);
