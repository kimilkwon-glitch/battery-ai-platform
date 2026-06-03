#!/usr/bin/env node
import { vehicleAssetsToSearchRows } from "../src/lib/vehicle-search.ts";
import { getVehicleBatteryPageData } from "../src/lib/vehicleBattery.ts";
import { searchVehicleCardLabels } from "../src/lib/search/search-vehicle-card-display.ts";

const queries = [
  "K8",
  "더 뉴 K8",
  "레이",
  "스포티지 NQ5",
  "LF 쏘나타",
  "니로",
  "디 올 뉴 니로",
];

for (const q of queries) {
  const rows = vehicleAssetsToSearchRows(q, 2);
  const top = rows[0];
  if (!top) {
    console.log(`${q}: NO_ROW`);
    continue;
  }
  const labels = searchVehicleCardLabels(top);
  const slug = top.href?.split("/").filter(Boolean).pop() ?? "";
  const page = slug ? getVehicleBatteryPageData(slug) : null;
  console.log(
    `${q}: card=${labels.title} fuels=${page?.fuelGroups?.length ?? 0} notes=${(top.batteryNotes ?? "").slice(0, 24)}`,
  );
}
