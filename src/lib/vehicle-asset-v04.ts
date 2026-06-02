/**
 * v04 차량 asset 빌더 — /assets/vehicles/cars-normalized/
 */
import type { VehicleAsset } from "@/lib/car-assets";
import {
  VEHICLE_GENERATIONS_V04,
  type VehicleGenerationV04,
} from "@/data/vehicle-generation-v04.config";
import { formatCustomerBatterySummaryForAsset } from "@/lib/search/customer-search-display";

const DEFAULT_NOTE = "연료·옵션별 상담 확인 권장";

export function v04ImagePath(brand: string, imageFile: string): string {
  return `/assets/vehicles/cars-normalized/${brand}/${imageFile}`;
}

function generationToAsset(g: VehicleGenerationV04): VehicleAsset {
  const draft: VehicleAsset = {
    id: g.id,
    brand: g.brand,
    modelGroup: g.modelGroup,
    displayName: g.displayName,
    generationName: g.generationName,
    aliases: [...new Set([g.displayName, ...g.searchAliases])],
    imageFile: g.imageFile,
    image: v04ImagePath(g.brand, g.imageFile),
    batteryNotes:
      g.battery.status === "linked" && g.battery.defaultBatteryCode
        ? `대표 규격 ${g.battery.defaultBatteryCode}`
        : g.battery.status === "needsReview"
          ? "상담 확인 필요"
          : g.battery.note ?? DEFAULT_NOTE,
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

export const vehicleAssetsV04: VehicleAsset[] = VEHICLE_GENERATIONS_V04.map(generationToAsset);

export const V04_SLUG_HINT_TO_ASSET_ID: Record<string, string> = Object.fromEntries(
  VEHICLE_GENERATIONS_V04.map((g) => [g.id, g.id]),
);

/** 기존 coarse slugHint → v04 세대 slug */
export const LEGACY_SLUG_HINT_TO_V04: Record<string, string> = {
  "renault-sm3-l38": "renault-samsung-new-sm3-2009",
  "renault-sm5": "renault-samsung-sm5-nova-2015",
  "renault-sm6-lfd": "renault-samsung-sm6-2016",
  "renault-sm7": "renault-samsung-sm7-nova-2014",
  "renault-qm3": "renault-samsung-qm3-2013",
  "renault-xm3-arkana": "renault-samsung-xm3-2020",
  "renault-qm5": "renault-samsung-qm5-2007",
  "renault-qm6": "renault-samsung-qm6-2016",
  "renault-captur": "renault-samsung-xm3-2020",
  "renault-master": "renault-master-2018",
  "kgm-tivoli-1st": "ssangyong-tivoli-2015",
  "kgm-tivoli-air": "ssangyong-tivoli-air-2016",
  "kgm-korando-c": "ssangyong-korando-c-2011",
  "kgm-korando-c300": "ssangyong-viewtiful-korando-2019",
  "kgm-korando-sports": "ssangyong-korando-sports-2012",
  "kgm-rexton-g4": "ssangyong-g4-rexton-2017",
  "kgm-rexton-y450": "ssangyong-all-new-rexton-2020",
  "kgm-rexton-sports-q200": "ssangyong-rexton-sports-2018",
  "kgm-rexton-sports-khan": "ssangyong-rexton-sports-khan-2019",
  "kgm-torres-j100": "kg-torres-2022",
  "kgm-torres-evx": "kg-torres-evx-2023",
  "kgm-actyon-sports": "ssangyong-actyon-sports-2006",
};
