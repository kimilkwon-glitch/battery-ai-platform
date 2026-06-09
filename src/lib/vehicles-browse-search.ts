import { getVehicleCardCompactCopy } from "@/lib/vehicle-card-hints";
import { getVehicleConditionSpecLines } from "@/lib/vehicle-condition-spec-lines";
import type { VehiclesBrowseItem } from "@/lib/vehicles-browse-data";

/** 차량 등록 목록 검색용 텍스트 (차량명·제조사·연식·연료·규격) */
export function buildVehicleBrowseSearchText(item: VehiclesBrowseItem): string {
  const copy = getVehicleCardCompactCopy(item.vehicleId, item.title);
  const conditions = getVehicleConditionSpecLines(item.vehicleId);
  const parts = [
    item.title,
    item.brandLabel,
    copy.categoryLine,
    copy.specLine,
    copy.cautionLine,
    ...conditions.map((c) => `${c.conditionLabel} ${c.code}`),
  ];
  return parts.join(" ").toLowerCase();
}

export function filterBrowseItemsByQuery(
  items: VehiclesBrowseItem[],
  query: string,
): VehiclesBrowseItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => buildVehicleBrowseSearchText(item).includes(q));
}
