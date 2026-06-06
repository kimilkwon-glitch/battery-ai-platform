#!/usr/bin/env npx tsx
/**
 * EV 저전압 배터리 정책 audit — 고객 노출·링크·주문 흐름 검증
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { vehicleAssets } from "../src/lib/car-assets";
import {
  EV_LOW_VOLTAGE_BATTERY_STATUS,
  EV_LOW_VOLTAGE_DISPLAY_TITLE,
  EV_LOW_VOLTAGE_VEHICLE_SLUGS,
  isEvLowVoltageVehicle,
  resolveCustomerBatteryPresentation,
  shouldShowEvLowVoltageCard,
} from "../src/lib/ev-low-voltage-battery-policy";
import { canonicalBatteryCode, customerFacingBatteryCode } from "../src/lib/canonical-battery-code";
import { buildFuelHeroCardGroups } from "../src/lib/vehicle-fuel-primary-battery";
import {
  hasCatalogBatteryMatch,
  resolveCustomerCatalogPrimaryBattery,
} from "../src/lib/vehicle-battery-match";
import {
  getVehicleSalesExcludedNotice,
  isVehicleFuelSalesExcluded,
  isVehicleFullyLithiumSalesExcluded,
  LITHIUM_EXCLUDED_VEHICLE_COPY,
} from "../src/lib/vehicle-battery-customer-policy";
import { customerFacingRepresentativeBattery } from "../src/lib/vehicle-detail-recommendation";
import { getVehicleBatteryPageData, getVehicleCardBatteryInfo } from "../src/lib/vehicleBattery";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "reports");

const EV_SLUGS = [...EV_LOW_VOLTAGE_VEHICLE_SLUGS];

function csvEscape(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  return [headers.join(","), ...rows.map((r) => headers.map((h) => csvEscape(r[h] as string)).join(","))].join("\n");
}

function main() {
  const policyRows = vehicleAssets.map((asset) => {
    const slug = asset.id;
    const page = getVehicleBatteryPageData(slug);
    const card = getVehicleCardBatteryInfo(slug);
    const hero = customerFacingRepresentativeBattery(slug, page.fuelGroups);
    const presentation = resolveCustomerBatteryPresentation(slug);
    const fuelCards = buildFuelHeroCardGroups(slug, page.fuelGroups).length;
    return {
      slug,
      displayName: asset.displayName,
      isEvLowVoltageVehicle: isEvLowVoltageVehicle(slug),
      matchStatus: presentation.matchStatus || resolveCustomerCatalogPrimaryBattery(slug) || "—",
      customerDisplay: hero || card.displayCode,
      catalogMatch: hasCatalogBatteryMatch(slug),
      fuelCardCount: fuelCards,
      allowsOrderFlow: presentation.allowsOrderFlow,
      allowsBatteryHref: presentation.allowsBatteryDetailHref,
      salesExcluded: isVehicleFullyLithiumSalesExcluded(slug),
    };
  });

  const flowRows = [
    ...EV_SLUGS.map((slug) => {
      const page = getVehicleBatteryPageData(slug);
      const cards = buildFuelHeroCardGroups(slug, page.fuelGroups);
      const canon = canonicalBatteryCode(EV_LOW_VOLTAGE_BATTERY_STATUS);
      const facing = customerFacingBatteryCode(EV_LOW_VOLTAGE_BATTERY_STATUS);
      return {
        slug,
        fuel: "전기",
        expectedDisplay: EV_LOW_VOLTAGE_DISPLAY_TITLE,
        actualDisplay: customerFacingRepresentativeBattery(slug, page.fuelGroups),
        fuelCards: cards.length,
        batteryHrefBlocked: !canon && !facing,
        orderBlocked: !resolveCustomerBatteryPresentation(slug).allowsOrderFlow,
        ev12vHrefBlocked: !canon.includes("EV") && canon !== "EV 12V",
      };
    }),
    {
      slug: "niro-sg2",
      fuel: "—",
      expectedDisplay: LITHIUM_EXCLUDED_VEHICLE_COPY.slice(0, 20),
      actualDisplay: getVehicleSalesExcludedNotice("niro-sg2")?.slice(0, 20) ?? "",
      fuelCards: buildFuelHeroCardGroups("niro-sg2", getVehicleBatteryPageData("niro-sg2").fuelGroups).length,
      batteryHrefBlocked: true,
      orderBlocked: true,
      ev12vHrefBlocked: true,
    },
    {
      slug: "kona-sx2",
      fuel: "가솔린",
      expectedDisplay: "AGM60L",
      actualDisplay: resolveCustomerCatalogPrimaryBattery("kona-sx2", "가솔린"),
      fuelCards: buildFuelHeroCardGroups("kona-sx2", getVehicleBatteryPageData("kona-sx2").fuelGroups).length,
      batteryHrefBlocked: false,
      orderBlocked: false,
      ev12vHrefBlocked: true,
    },
    {
      slug: "kona-sx2",
      fuel: "전기",
      expectedDisplay: EV_LOW_VOLTAGE_DISPLAY_TITLE,
      actualDisplay: shouldShowEvLowVoltageCard("kona-sx2", "전기")
        ? EV_LOW_VOLTAGE_DISPLAY_TITLE
        : resolveCustomerCatalogPrimaryBattery("kona-sx2", "전기"),
      fuelCards: buildFuelHeroCardGroups("kona-sx2", getVehicleBatteryPageData("kona-sx2").fuelGroups, "전기").length,
      batteryHrefBlocked: !customerFacingBatteryCode(EV_LOW_VOLTAGE_BATTERY_STATUS),
      orderBlocked: !resolveCustomerBatteryPresentation("kona-sx2", "전기").allowsOrderFlow,
      ev12vHrefBlocked: !canonicalBatteryCode("EV 12V"),
    },
    {
      slug: "kona-sx2",
      fuel: "하이브리드",
      expectedDisplay: "sales_excluded",
      actualDisplay: isVehicleFuelSalesExcluded("kona-sx2", "하이브리드") ? "sales_excluded" : "—",
      fuelCards: 0,
      batteryHrefBlocked: true,
      orderBlocked: true,
      ev12vHrefBlocked: true,
    },
  ];

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "ev-low-voltage-battery-policy.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), status: EV_LOW_VOLTAGE_BATTERY_STATUS, rows: policyRows }, null, 2),
  );
  fs.writeFileSync(path.join(OUT_DIR, "ev-low-voltage-battery-policy.csv"), toCsv(policyRows));
  fs.writeFileSync(path.join(OUT_DIR, "ev-low-voltage-customer-flow-audit.csv"), toCsv(flowRows));

  console.log("\n=== EV LOW VOLTAGE POLICY ===");
  for (const slug of EV_SLUGS) {
    const page = getVehicleBatteryPageData(slug);
    const cards = buildFuelHeroCardGroups(slug, page.fuelGroups).length;
    const display = customerFacingRepresentativeBattery(slug, page.fuelGroups);
    const ok = display === EV_LOW_VOLTAGE_DISPLAY_TITLE && cards > 0 && hasCatalogBatteryMatch(slug);
    console.log(`${ok ? "✓" : "✗"} ${slug}: display=${display} cards=${cards}`);
  }

  console.log("\n=== KONA SX2 ===");
  console.log(
    `${resolveCustomerCatalogPrimaryBattery("kona-sx2", "가솔린") === "AGM60L" ? "✓" : "✗"} 가솔린 AGM60L`,
  );
  console.log(
    `${shouldShowEvLowVoltageCard("kona-sx2", "전기") ? "✓" : "✗"} 전기 EV 저전압`,
  );
  console.log(
    `${isVehicleFuelSalesExcluded("kona-sx2", "하이브리드") ? "✓" : "✗"} 하이브리드 판매제외`,
  );

  console.log("\n=== LITHIUM EXCLUDED ===");
  console.log(`${isVehicleFullyLithiumSalesExcluded("niro-sg2") ? "✓" : "✗"} niro-sg2`);

  console.log("\n=== EV 12V HREF BLOCK ===");
  const ev12vCanon = canonicalBatteryCode("EV 12V");
  console.log(`${!ev12vCanon ? "✓" : "✗"} canonicalBatteryCode('EV 12V')='${ev12vCanon}'`);

  console.log("\nReports written to reports/");
}

main();
