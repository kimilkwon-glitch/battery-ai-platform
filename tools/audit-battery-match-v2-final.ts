#!/usr/bin/env npx tsx
/**
 * 배터리 매칭 v2 최종 audit — operator SoT·정규화·legacy 차단 검증 + 리포트 생성
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { vehicleAssets, getVehicleAsset } from "../src/lib/car-assets";
import vehicleBatteryDb from "../src/data/vehicle-battery-db.json";
import enrichmentJson from "../src/data/vehicle-battery-enrichment.json";
import { buildAdminVehicleRows } from "../src/lib/admin/data/vehicles-admin";
import {
  BATTERY_SPEC_NORMALIZATION,
  batterySpecNormalizationReason,
  normalizeBatterySpecCode,
} from "../src/lib/battery-spec-normalization";
import {
  customerFacingBatterySource,
  hasCatalogBatteryMatch,
  resolveCatalogPrimaryBattery,
  resolveCustomerCatalogPrimaryBattery,
} from "../src/lib/vehicle-battery-match";
import { EV_LOW_VOLTAGE_DISPLAY_TITLE } from "../src/lib/ev-low-voltage-battery-policy";
import {
  BM_TOTAL_EV_LOW_VOLTAGE_SLUGS,
  BM_TOTAL_HOLD_INTERNAL_SLUGS,
  BM_TOTAL_OPERATOR_FUEL_PRIMARY,
  BM_TOTAL_OPERATOR_SLUG_PRIMARY_BATTERY,
  BM_TOTAL_SALES_EXCLUDED_SLUGS,
  OPERATOR_FUEL_PRIMARY,
  OPERATOR_SLUG_PRIMARY_BATTERY,
} from "../src/lib/vehicle-operator-battery-tables";
import {
  isVehicleFullyLithiumSalesExcluded,
  isVehicleHoldInternal,
  isVehicleFuelSalesExcluded,
} from "../src/lib/vehicle-battery-customer-policy";
import { customerFacingRepresentativeBattery } from "../src/lib/vehicle-detail-recommendation";
import { buildFuelHeroCardGroups } from "../src/lib/vehicle-fuel-primary-battery";
import { getVehicleBatteryPageData, getVehicleCardBatteryInfo } from "../src/lib/vehicleBattery";

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

const CONFIRMED_EXPECTED: Record<string, string> = {
  "staria-us4": "AGM80R",
  "genesis-gv70": "AGM80R",
  "genesis-gv80": "AGM95R",
  "genesis-g80-rg3": "AGM95R",
  "genesis-g80-dh": "AGM105L",
  "genesis-eq900": "AGM105L",
  "porter2-new": "100R",
  "porter2-ev": "80L",
  "bongo3-ev": "80L",
  "renault-samsung-qm6-quest-2023": "DIN74L",
  "renault-arkana-2024": "AGM60L",
  "renault-master-2018": "AGM95L",
  "kg-torres-2022": "AGM70L",
  "kg-torres-evx-2023": "60R",
  "kg-actyon-2024": "AGM70L",
  "chevrolet-trailblazer-2024": "AGM70L",
  "chevrolet-equinox-2022": "AGM70L",
  "chevrolet-bolt-ev-2017": "AGM50L",
};

const KONA_SX2_EXPECTED: Record<string, string | "sales_excluded" | "ev_low_voltage"> = {
  가솔린: "AGM60L",
  전기: "ev_low_voltage",
  하이브리드: "sales_excluded",
};

function csvEscape(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h] as string)).join(","));
  }
  return lines.join("\n");
}

function vehicleStatus(slug: string): string {
  if (BM_TOTAL_SALES_EXCLUDED_SLUGS.includes(slug as (typeof BM_TOTAL_SALES_EXCLUDED_SLUGS)[number])) {
    return "sales_excluded";
  }
  if (BM_TOTAL_EV_LOW_VOLTAGE_SLUGS.includes(slug as (typeof BM_TOTAL_EV_LOW_VOLTAGE_SLUGS)[number])) {
    return "ev_low_voltage";
  }
  if (BM_TOTAL_HOLD_INTERNAL_SLUGS.includes(slug as (typeof BM_TOTAL_HOLD_INTERNAL_SLUGS)[number])) {
    return "hold_internal";
  }
  if (OPERATOR_SLUG_PRIMARY_BATTERY[slug] || OPERATOR_FUEL_PRIMARY[slug]) {
    return "matched";
  }
  return "unmatched";
}

function legacySourcesForSlug(slug: string) {
  const asset = getVehicleAsset(slug);
  const dbRecs = (vehicleBatteryDb as { records?: { vehicleId?: string; primaryBattery?: string }[] })
    .records?.filter((r) => r.vehicleId === slug) ?? [];
  const enrich = (
    enrichmentJson as { records?: { vehicleId?: string; primaryBattery?: string }[] }
  ).records?.find((e) => e.vehicleId === slug);

  return {
    defaultBatteryCode: asset?.defaultBatteryCode ?? null,
    dbPrimary: dbRecs.map((r) => r.primaryBattery).filter(Boolean).join("|") || null,
    enrichmentPrimary: enrich?.primaryBattery ?? null,
  };
}

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

  const v2FinalRows = vehicleAssets.map((asset) => {
    const slug = asset.id;
    const status = vehicleStatus(slug);
    const rep = resolveCustomerCatalogPrimaryBattery(slug);
    const fuelMap = OPERATOR_FUEL_PRIMARY[slug] ?? null;
    const page = getVehicleBatteryPageData(slug);
    const heroRep = customerFacingRepresentativeBattery(slug, page.fuelGroups);
    const cardInfo = getVehicleCardBatteryInfo(slug);
    return {
      slug,
      brand: asset.brand,
      displayName: asset.displayName,
      yearRange: asset.yearRange ?? "",
      status,
      representativeBattery: rep || resolveCatalogPrimaryBattery(slug),
      fuelMap: fuelMap ? JSON.stringify(fuelMap) : "",
      customerHeroBattery: heroRep,
      customerCardDisplay: cardInfo.displayCode,
      source: customerFacingBatterySource(slug),
      catalogMatch: hasCatalogBatteryMatch(slug),
    };
  });

  const normAuditRows: { raw: string; normalized: string; reason: string }[] = [];
  const seenNorm = new Set<string>();
  for (const raw of Object.keys(BATTERY_SPEC_NORMALIZATION)) {
    const norm = normalizeBatterySpecCode(raw);
    const reason = batterySpecNormalizationReason(raw) ?? "identity";
    const key = `${raw}::${norm}`;
    if (!seenNorm.has(key)) {
      seenNorm.add(key);
      normAuditRows.push({ raw, normalized: norm ?? "", reason });
    }
  }
  for (const code of Object.values(BM_TOTAL_OPERATOR_SLUG_PRIMARY_BATTERY)) {
    const reason = batterySpecNormalizationReason(code);
    if (reason) {
      normAuditRows.push({
        raw: code,
        normalized: normalizeBatterySpecCode(code) ?? "",
        reason,
      });
    }
  }

  const sourceAuditRows = vehicleAssets.map((asset) => {
    const slug = asset.id;
    const rep = resolveCustomerCatalogPrimaryBattery(slug);
    const source = customerFacingBatterySource(slug);
    const ok = source === "operator_slug_primary" || source === "operator_fuel_map" || !rep;
    return {
      slug,
      customerBattery: rep,
      source,
      operatorOnly: ok ? "yes" : "no",
      hold: isVehicleHoldInternal(slug),
      salesExcluded: isVehicleFullyLithiumSalesExcluded(slug),
    };
  });

  const legacyBlockedRows: {
    slug: string;
    legacySource: string;
    legacyValue: string;
    customerValue: string;
    blocked: string;
  }[] = [];

  for (const asset of vehicleAssets) {
    const slug = asset.id;
    const customer = resolveCustomerCatalogPrimaryBattery(slug);
    const legacy = legacySourcesForSlug(slug);
    const pairs: [string, string | null][] = [
      ["car-assets.defaultBatteryCode", legacy.defaultBatteryCode],
      ["vehicle-battery-db.primaryBattery", legacy.dbPrimary],
      ["vehicle-battery-enrichment.primaryBattery", legacy.enrichmentPrimary],
    ];
    for (const [src, val] of pairs) {
      if (!val?.trim()) continue;
      const normLegacy = normalizeBatterySpecCode(val.split("|")[0]!) ?? val;
      if (normLegacy && customer && normLegacy !== customer && normLegacy !== "—") {
        legacyBlockedRows.push({
          slug,
          legacySource: src,
          legacyValue: val,
          customerValue: customer,
          blocked: "yes",
        });
      }
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const generatedAt = new Date().toISOString();

  fs.writeFileSync(
    path.join(OUT_DIR, "battery-match-v2-final.json"),
    JSON.stringify({ generatedAt, counts: { total: vehicleAssets.length, matched: matched.length, hold: hold.length, salesExcluded: excluded.length, unmatched: unmatched.length }, rows: v2FinalRows }, null, 2),
  );
  fs.writeFileSync(path.join(OUT_DIR, "battery-match-v2-final.csv"), toCsv(v2FinalRows));
  fs.writeFileSync(path.join(OUT_DIR, "battery-spec-normalization-audit.csv"), toCsv(normAuditRows));
  fs.writeFileSync(path.join(OUT_DIR, "customer-facing-battery-source-audit.csv"), toCsv(sourceAuditRows));
  fs.writeFileSync(path.join(OUT_DIR, "legacy-battery-fallback-blocked.csv"), toCsv(legacyBlockedRows));

  console.log("\n=== V2 COUNTS ===");
  console.log("total:", vehicleAssets.length);
  console.log("matched:", matched.length);
  console.log("unmatched:", unmatched.length);
  console.log("hold_internal:", hold.length);
  console.log("sales_excluded:", excluded.length);

  console.log("\n=== CORRECTION 6 ===");
  for (const [slug, expected] of Object.entries(CORRECTION_EXPECTED)) {
    const primary = resolveCustomerCatalogPrimaryBattery(slug);
    const ok = primary === expected;
    console.log(`${ok ? "✓" : "✗"} ${slug}: primary=${primary} expected=${expected}`);
  }

  console.log("\n=== CRUZE 2015 FUEL MAP ===");
  const cruzeFuels: Record<string, string> = {
    가솔린: "DIN60L",
    디젤: "DIN74L",
    "ISG/스마트충전": "AGM80L",
  };
  for (const [fuel, expected] of Object.entries(cruzeFuels)) {
    const primary = resolveCustomerCatalogPrimaryBattery("chevrolet-the-new-cruze-2015", fuel);
    const ok = primary === expected;
    console.log(`${ok ? "✓" : "✗"} chevrolet-the-new-cruze-2015 ${fuel}: primary=${primary} expected=${expected}`);
  }

  console.log("\n=== KONA SX2 ===");
  for (const [fuel, expected] of Object.entries(KONA_SX2_EXPECTED)) {
    if (expected === "sales_excluded") {
      const excludedFuel = isVehicleFuelSalesExcluded("kona-sx2", fuel);
      console.log(`${excludedFuel ? "✓" : "✗"} kona-sx2 ${fuel}: sales_excluded=${excludedFuel}`);
    } else if (expected === "ev_low_voltage") {
      const page = getVehicleBatteryPageData("kona-sx2");
      const cards = buildFuelHeroCardGroups("kona-sx2", page.fuelGroups, fuel).length;
      const ok = cards > 0;
      console.log(`${ok ? "✓" : "✗"} kona-sx2 ${fuel}: EV card cards=${cards}`);
    } else {
      const primary = resolveCustomerCatalogPrimaryBattery("kona-sx2", fuel);
      const ok = primary === expected;
      console.log(`${ok ? "✓" : "✗"} kona-sx2 ${fuel}: primary=${primary} expected=${expected}`);
    }
  }

  console.log("\n=== EV LOW VOLTAGE (4) ===");
  for (const slug of BM_TOTAL_EV_LOW_VOLTAGE_SLUGS) {
    const page = getVehicleBatteryPageData(slug);
    const display = customerFacingRepresentativeBattery(slug, page.fuelGroups);
    const cards = buildFuelHeroCardGroups(slug, page.fuelGroups).length;
    console.log(`${display === EV_LOW_VOLTAGE_DISPLAY_TITLE && cards > 0 ? "✓" : "✗"} ${slug}: display=${display} cards=${cards}`);
  }

  console.log("\n=== CONFIRMED MAINTAINED ===");
  for (const [slug, expected] of Object.entries(CONFIRMED_EXPECTED)) {
    const primary = resolveCustomerCatalogPrimaryBattery(slug);
    const ok = primary === expected;
    console.log(`${ok ? "✓" : "✗"} ${slug}: primary=${primary} expected=${expected}`);
  }

  console.log("\n=== HOLD (deprecated) ===");
  console.log("hold_internal:", BM_TOTAL_HOLD_INTERNAL_SLUGS.length);

  console.log("\n=== CUSTOMER SOURCE (non-operator leaks) ===");
  const leaks = sourceAuditRows.filter((r) => r.operatorOnly === "no" && r.customerBattery);
  console.log("leaks:", leaks.length);
  for (const r of leaks.slice(0, 10)) {
    console.log(`  ${r.slug}: ${r.customerBattery} via ${r.source}`);
  }

  console.log("\n=== LEGACY BLOCKED ===");
  console.log("blocked conflicts:", legacyBlockedRows.length);
  console.log("Reports written to reports/");
}

main();
