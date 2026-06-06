#!/usr/bin/env npx tsx
/**
 * 배터리 매칭 상태 진단 — vehicleStatus / batteryMatchStatus / hold 분리 검증
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { vehicleAssets } from "../src/lib/car-assets";
import { buildAdminVehicleRows } from "../src/lib/admin/data/vehicles-admin";
import { vehicleReviewReasonLabel } from "../src/lib/admin/data/vehicles-admin";
import {
  hasCatalogBatteryMatch,
  resolveCatalogPrimaryBattery,
  resolveCatalogBatteryCandidates,
  resolveCustomerCatalogPrimaryBattery,
  resolveBatteryMatchStatus,
} from "../src/lib/vehicle-battery-match";
import { EV_LOW_VOLTAGE_DISPLAY_TITLE } from "../src/lib/ev-low-voltage-battery-policy";
import {
  BM_TOTAL_EV_LOW_VOLTAGE_SLUGS,
  BM_TOTAL_SALES_EXCLUDED_SLUGS,
} from "../src/lib/vehicle-operator-battery-tables";
import {
  isVehicleFullyLithiumSalesExcluded,
  isVehicleHoldInternal,
} from "../src/lib/vehicle-battery-customer-policy";
import { getVehicleBatteryPageData } from "../src/lib/vehicleBattery";
import { buildFuelHeroCardGroups } from "../src/lib/vehicle-fuel-primary-battery";
import { customerFacingRepresentativeBattery } from "../src/lib/vehicle-detail-recommendation";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "reports");

const CORRECTION_EXPECTED: Record<string, string> = {
  "grandeur-tg": "80L",
  "grandeur-hg": "80L",
  "santafe-tm": "AGM95L",
  "daewoo-tosca-2006": "80R",
  "gmdaewoo-labo-2011": "50L",
  "gmdaewoo-damas-2011": "50L",
};

const CARD_VISIBLE_EXPECTED: Record<string, string> = {
  "sonata-nf": "80L",
  "sonata-yf": "80L",
  "sonata-lf": "80L",
  "avante-hd": "60AL",
  "avante-md": "DIN62L",
  "avante-ad": "DIN62L",
  "tucson-lm": "90R",
  "tucson-tl": "AGM80L",
  "santafe-dm": "AGM95L",
  "santafe-tm": "AGM95L",
  "k5-tf": "80L",
  "k5-jf": "AGM80L",
  "sportage-sl": "90R",
  "sorento-um": "AGM95L",
  "carnival-yp": "90L",
  "morning-ja": "40AL",
  "ray-tam": "60AL",
  "bongo3-truck": "100L",
  "genesis-g90": "AGM105L",
  "renault-samsung-qm5-2007": "80L",
  "renault-samsung-qm6-2016": "DIN74L",
  "ssangyong-rexton-sports-2018": "90R",
  "chevrolet-spark-2015": "DIN50L",
  "chevrolet-cruze-2011": "DIN74L",
  "chevrolet-trailblazer-2020": "AGM70L",
};

const EV_LOW_VOLTAGE_EXPECTED = [...BM_TOTAL_EV_LOW_VOLTAGE_SLUGS];
const SALES_EXCLUDED = [...BM_TOTAL_SALES_EXCLUDED_SLUGS];

function main() {
  const adminRows = buildAdminVehicleRows();

  const hold = adminRows.filter((r) => isVehicleHoldInternal(r.slug));
  const excluded = adminRows.filter((r) => r.salesExcluded);
  const matched = adminRows.filter(
    (r) => r.batteryMatchStatus === "matched" && !r.salesExcluded && !isVehicleHoldInternal(r.slug),
  );
  const unmatched = adminRows.filter(
    (r) => r.batteryMatchStatus === "unmatched" && !r.salesExcluded && !isVehicleHoldInternal(r.slug),
  );

  const customerVisible = vehicleAssets.filter((a) => {
    const slug = a.id;
    if (isVehicleHoldInternal(slug) || isVehicleFullyLithiumSalesExcluded(slug)) return false;
    const page = getVehicleBatteryPageData(slug);
    return hasCatalogBatteryMatch(slug) && buildFuelHeroCardGroups(slug, page.fuelGroups).length > 0;
  });

  const unmatchedExport = adminRows
    .filter((r) => r.batteryMatchStatus === "unmatched" && !isVehicleHoldInternal(r.slug))
    .map((r) => ({
      slug: r.slug,
      brand: r.brand,
      displayName: r.displayName,
      yearRange: r.yearRange,
      primaryBattery: r.primaryBattery,
      batteryMatchStatus: r.batteryMatchStatus,
      salesExcluded: r.salesExcluded,
      holdInternal: isVehicleHoldInternal(r.slug),
      reviewReason: vehicleReviewReasonLabel(r),
    }));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "battery-match-unmatched.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), count: unmatchedExport.length, rows: unmatchedExport }, null, 2),
  );

  console.log("\n=== COUNTS ===");
  console.log("total:", vehicleAssets.length);
  console.log("matched:", matched.length);
  console.log("unmatched:", unmatched.length);
  console.log("hold_internal:", hold.length);
  console.log("sales_excluded:", excluded.length);
  console.log("customer_card_visible:", customerVisible.length);

  console.log("\n=== CORRECTION 6 ===");
  for (const [slug, expected] of Object.entries(CORRECTION_EXPECTED)) {
    const primary = resolveCustomerCatalogPrimaryBattery(slug);
    const ok = primary === expected && resolveCatalogPrimaryBattery(slug) === expected;
    console.log(`${ok ? "✓" : "✗"} ${slug}: primary=${primary} expected=${expected}`);
  }

  console.log("\n=== CARD VISIBLE TEST ===");
  for (const [slug, expected] of Object.entries(CARD_VISIBLE_EXPECTED)) {
    const page = getVehicleBatteryPageData(slug);
    const cards = buildFuelHeroCardGroups(slug, page.fuelGroups).length;
    const primary = resolveCustomerCatalogPrimaryBattery(slug);
    const ok = cards > 0 && hasCatalogBatteryMatch(slug) && (primary === expected || primary.includes(expected.replace(/^DIN/, "")));
    console.log(`${ok ? "✓" : "✗"} ${slug}: cards=${cards} primary=${primary} expected=${expected}`);
  }

  const evLowVoltage = adminRows.filter((r) => EV_LOW_VOLTAGE_EXPECTED.includes(r.slug as (typeof EV_LOW_VOLTAGE_EXPECTED)[number]));
  console.log("ev_low_voltage:", evLowVoltage.length);
  console.log("hold_internal:", hold.length);

  console.log("\n=== EV LOW VOLTAGE ===");
  for (const slug of EV_LOW_VOLTAGE_EXPECTED) {
    const catalog = hasCatalogBatteryMatch(slug);
    const page = getVehicleBatteryPageData(slug);
    const cards = buildFuelHeroCardGroups(slug, page.fuelGroups).length;
    const display = customerFacingRepresentativeBattery(slug, page.fuelGroups);
    const ok = catalog && cards > 0 && display === EV_LOW_VOLTAGE_DISPLAY_TITLE;
    console.log(`${ok ? "✓" : "✗"} ${slug}: catalog=${catalog} cards=${cards} display=${display}`);
  }

  console.log("\n=== SALES EXCLUDED ===");
  for (const slug of SALES_EXCLUDED) {
    console.log(`${isVehicleFullyLithiumSalesExcluded(slug) ? "✓" : "✗"} ${slug}`);
  }
}

main();
