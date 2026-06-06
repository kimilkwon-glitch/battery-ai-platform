#!/usr/bin/env npx tsx
import { buildAdminVehicleRows } from "../src/lib/admin/data/vehicles-admin";
import { EV_LOW_VOLTAGE_DISPLAY_TITLE, EV_LOW_VOLTAGE_VEHICLE_SLUGS, isEvLowVoltageVehicle } from "../src/lib/ev-low-voltage-battery-policy";
import { canonicalBatteryCode, customerFacingBatteryCode } from "../src/lib/canonical-battery-code";
import { resolveCustomerCatalogPrimaryBattery } from "../src/lib/vehicle-battery-match";
import { customerFacingRepresentativeBattery } from "../src/lib/vehicle-detail-recommendation";
import { buildFuelHeroCardGroups } from "../src/lib/vehicle-fuel-primary-battery";
import { getVehicleBatteryPageData } from "../src/lib/vehicleBattery";
import { getVehicleSalesExcludedNotice, isVehicleFuelSalesExcluded, isVehicleHoldInternal } from "../src/lib/vehicle-battery-customer-policy";
import { vehicleAssets } from "../src/lib/car-assets";
import { hasCatalogBatteryMatch } from "../src/lib/vehicle-battery-match";
import { isVehicleFullyLithiumSalesExcluded } from "../src/lib/vehicle-battery-customer-policy";

const rows = buildAdminVehicleRows();
const iceMatched = rows.filter((r) => r.batteryMatchStatus === "matched" && !r.salesExcluded && !isEvLowVoltageVehicle(r.slug));
const evMatched = rows.filter((r) => EV_LOW_VOLTAGE_VEHICLE_SLUGS.includes(r.slug as (typeof EV_LOW_VOLTAGE_VEHICLE_SLUGS)[number]));
const unmatched = rows.filter((r) => r.batteryMatchStatus === "unmatched" && !r.salesExcluded);
const hold = rows.filter((r) => isVehicleHoldInternal(r.slug));
const excluded = rows.filter((r) => r.salesExcluded);
const visible = vehicleAssets.filter((a) => {
  if (isVehicleFullyLithiumSalesExcluded(a.id)) return false;
  const page = getVehicleBatteryPageData(a.id);
  return hasCatalogBatteryMatch(a.id) && buildFuelHeroCardGroups(a.id, page.fuelGroups).length > 0;
});
const hidden = vehicleAssets.length - visible.length - excluded.length;

console.log("=== AGGREGATE ===");
console.log("total:", vehicleAssets.length);
console.log("ice_matched:", iceMatched.length);
console.log("ev_low_voltage:", evMatched.length);
console.log("matched_total:", iceMatched.length + evMatched.length);
console.log("unmatched:", unmatched.length);
console.log("hold_internal:", hold.length);
console.log("sales_excluded:", excluded.length);
console.log("customer_card_visible:", visible.length);
console.log("customer_card_hidden:", hidden);

const FORBIDDEN = /사진확인|세대확인|내부 hold|미매칭|관리자 확인|확인 중|배터리 매칭 미완료|사진 확인\/문의/i;
const batteryCodes = ["80L", "80R", "50L", "AGM95L", "AGM60L", "AGM80R", "DIN74L", "DIN60L", "AGM80L"];
console.log("\n=== BATTERY PAGES CANON ===");
for (const c of batteryCodes) {
  const canon = canonicalBatteryCode(c);
  console.log(`${c} -> ${canon || "(blocked)"} ${canon === c ? "OK" : canon ? "WARN" : "FAIL"}`);
}
console.log("EV 12V ->", canonicalBatteryCode("EV 12V") || "(empty) OK");

const exact: Record<string, string> = {
  "daewoo-tosca-2006": "80R",
  "gmdaewoo-labo-2011": "50L",
  "gmdaewoo-damas-2011": "50L",
};
console.log("\n=== EXACT JIS ===");
for (const [s, e] of Object.entries(exact)) {
  const p = resolveCustomerCatalogPrimaryBattery(s);
  console.log(`${p === e ? "OK" : "FAIL"} ${s}: ${p}`);
}

console.log("\n=== EV DISPLAY ===");
for (const s of EV_LOW_VOLTAGE_VEHICLE_SLUGS) {
  const page = getVehicleBatteryPageData(s);
  const d = customerFacingRepresentativeBattery(s, page.fuelGroups);
  console.log(`${d === EV_LOW_VOLTAGE_DISPLAY_TITLE ? "OK" : "FAIL"} ${s}: ${d}`);
}

console.log("\n=== SALES EXCLUDED COPY ===");
const niro = getVehicleSalesExcludedNotice("niro-sg2") ?? "";
console.log(niro.includes("리튬 배터리 장착") ? "OK niro-sg2" : "FAIL niro-sg2");
console.log(isVehicleFuelSalesExcluded("kona-sx2", "하이브리드") ? "OK kona hybrid" : "FAIL kona hybrid");
