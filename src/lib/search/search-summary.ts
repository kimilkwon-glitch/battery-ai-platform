import type { RecognizedVehicleResult } from "@/lib/search-page-results";
import type { QueryPipelineIntent } from "@/lib/search/search-intent-parser";
import type { SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";
import type { VehicleIntent } from "@/lib/search/parse-vehicle-intent";
import { SEARCH_SPEC_TOKENS } from "@/lib/search/battery-spec-parser";

function codeFromExactSpec(exactSpec: string): string {
  const canonical = canonicalBatteryCode(exactSpec);
  if (canonical) return canonical;
  const upper = exactSpec.toUpperCase();
  if ((SEARCH_SPEC_TOKENS as readonly string[]).includes(upper)) return upper;
  return resolvePrimaryBatteryCode(exactSpec, [exactSpec]) ?? upper;
}

function aliasFromVehicleIntent(v: VehicleIntent): SearchVehicleAliasMatch | null {
  if (!v.hasVehicle) return null;
  return {
    label: v.label,
    brand: v.brand ?? undefined,
    assetId: v.assetId,
    catalogId: v.catalogId,
    dbQuery: v.dbQuery,
  };
}
import { formatSearchVehicleDisplayLabel } from "@/lib/search/search-vehicle-display";
import { resolveVehicleBatterySpecForSearch } from "@/lib/search/resolve-vehicle-battery-spec";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { resolvePrimaryBatteryCode } from "@/lib/battery-spec-display";
import { resolveVehicleFuelPrimaryBattery } from "@/lib/vehicle-fuel-primary-battery";
import {
  basisLabelForTier,
  buildNoSpecPrimaryCtas,
  buildNoSpecSecondaryLinks,
  NO_REGISTERED_SPEC_MESSAGE,
  NO_VEHICLE_MATCH_MESSAGE,
  PRIMARY_BATTERY_CTAS,
  secondaryNoteForTier,
  SHORT_EXCEPTION_NOTE,
} from "@/lib/search/battery-recommendation-copy";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { resolveFitmentOverride } from "@/lib/search/fitment-overrides";

export type RecognizedSpecResult = {
  spec: string;
  primaryBatteryCode: string;
  terminalDirection: string | null;
  secondaryNote: string;
  ctas: { label: string; href: string }[];
  secondaryLinks: { label: string; href: string }[];
};

export type SearchSummaryOutput = {
  recognizedVehicle: RecognizedVehicleResult | null;
  recognizedSpec: RecognizedSpecResult | null;
};

function vehicleHref(
  alias: SearchVehicleAliasMatch,
  fallback: string,
  fuel: string | null,
): string {
  const slug = alias.assetId ?? null;
  if (slug) return buildVehicleDetailHref(slug, fuel);
  return fallback;
}

export function buildSearchSummary(
  pipeline: QueryPipelineIntent,
  alias: SearchVehicleAliasMatch | null,
  specLabels: string[],
  vehicleHrefStr: string,
): SearchSummaryOutput {
  const v = pipeline.vehicle;
  const spec = pipeline.batterySpec.primarySpec;
  const exactSpec =
    specLabels.length > 0 && specLabels[0] !== "확인 필요" ? specLabels[0] : spec;

  let recognizedVehicle: RecognizedVehicleResult | null = null;
  let recognizedSpec: RecognizedSpecResult | null = null;

  const effectiveAlias = alias ?? aliasFromVehicleIntent(v);

  if (v.hasVehicle && effectiveAlias) {
    const fitmentOverride = resolveFitmentOverride({
      normalizedQuery: pipeline.normalizedQuery,
      model: v.model,
      canonicalKey: v.canonicalKey,
      year: v.year,
    });

    const displayName =
      fitmentOverride?.displayName ??
      v.displayName ??
      formatSearchVehicleDisplayLabel(pipeline.normalizedQuery, effectiveAlias);
    const fuelText = v.fuel ?? "확인 필요";
    const vehicleLabel =
      fuelText !== "확인 필요" && !displayName.includes(fuelText)
        ? `${displayName} ${fuelText}`
        : displayName;
    const detailSlug = fitmentOverride?.assetId ?? effectiveAlias.assetId ?? "";
    const href = detailSlug
      ? buildVehicleDetailHref(detailSlug, v.fuel, fitmentOverride?.yearChipId ?? null)
      : vehicleHref(effectiveAlias, vehicleHrefStr, v.fuel);

    const batterySpec = resolveVehicleBatterySpecForSearch({
      exactSpec: exactSpec ?? null,
      canonicalKey: v.canonicalKey,
      assetId: fitmentOverride?.assetId ?? v.assetId ?? effectiveAlias.assetId,
      fuel: v.fuel,
      displayName: vehicleLabel,
      dbQuery: v.dbQuery || effectiveAlias.dbQuery,
      normalizedQuery: pipeline.normalizedQuery,
      model: v.model,
      year: v.year,
    });

    const hasSpecLine = batterySpec.tier !== "none";
    const unifiedPrimary =
      detailSlug && v.fuel && v.fuel !== "확인 필요" && !exactSpec
        ? resolveVehicleFuelPrimaryBattery(detailSlug, v.fuel, {
            yearChipId: fitmentOverride?.yearChipId ?? null,
          })
        : "";
    const primaryBatteryCode = unifiedPrimary
      ? unifiedPrimary
      : hasSpecLine
        ? resolvePrimaryBatteryCode(batterySpec.displayValue, batterySpec.primaryCodes)
        : null;
    const specDisplayResolved = primaryBatteryCode
      ? canonicalBatteryCode(primaryBatteryCode)
      : hasSpecLine && batterySpec.displayValue
        ? canonicalBatteryCode(batterySpec.displayValue)
        : null;
    const secondaryNote = batterySpec.caution ?? secondaryNoteForTier(batterySpec.tier);
    const basisLabel = basisLabelForTier(batterySpec.tier, batterySpec.source);

    recognizedVehicle = {
      title: `${vehicleLabel} 배터리 확인`,
      vehicleLabel,
      fuelLabel: fuelText,
      specTier: batterySpec.tier,
      specFieldLabel: batterySpec.fieldLabel,
      specDisplay: specDisplayResolved,
      specLabel: batterySpec.tier === "exact" ? specDisplayResolved : null,
      specCheckNote: null,
      candidateLabel: batterySpec.fieldLabel,
      candidateDisplay: batterySpec.displayValue,
      confirmNote: null,
      bodyMessage: null,
      confidenceLabel: batterySpec.confidenceLabel,
      dbMatchKey: batterySpec.dbMatchKey,
      dbRecordId: batterySpec.dbRecordId,
      dbRecordDisplayName: batterySpec.dbRecordDisplayName,
      specSource: batterySpec.source,
      primaryBatteryCode,
      secondaryNote,
      basisLabel,
      fallbackMessage: hasSpecLine ? null : NO_REGISTERED_SPEC_MESSAGE,
      guidance: secondaryNote ?? NO_REGISTERED_SPEC_MESSAGE,
      href,
      ctas: primaryBatteryCode
        ? PRIMARY_BATTERY_CTAS(primaryBatteryCode)
        : buildNoSpecPrimaryCtas(vehicleLabel, pipeline.normalizedQuery),
      secondaryLinks: primaryBatteryCode
        ? [
            {
              label: "차량 상세 보기",
              href: buildVehicleDetailHref(
                detailSlug || effectiveAlias.assetId || "",
                v.fuel,
                fitmentOverride?.yearChipId ?? null,
              ),
            },
          ]
        : buildNoSpecSecondaryLinks(),
    };
  }

  if (pipeline.batterySpec.hasSpec && exactSpec && !v.hasVehicle) {
    const code = codeFromExactSpec(exactSpec);
    const terminal = pipeline.batterySpec.terminalDirection;
    recognizedSpec = {
      spec: code,
      primaryBatteryCode: code,
      terminalDirection: terminal,
      secondaryNote: SHORT_EXCEPTION_NOTE,
      ctas: PRIMARY_BATTERY_CTAS(code),
      secondaryLinks: [{ label: "차량명으로 다시 검색", href: "/search" }],
    };
  }

  if (pipeline.batterySpec.hasSpec && exactSpec && v.hasVehicle && effectiveAlias && recognizedVehicle) {
    const code =
      codeFromExactSpec(exactSpec) ??
      recognizedVehicle.primaryBatteryCode;
    if (code && recognizedVehicle.specTier === "exact") {
      recognizedVehicle.primaryBatteryCode = code;
      recognizedVehicle.ctas = PRIMARY_BATTERY_CTAS(code);
      recognizedVehicle.basisLabel = "검색 규격";
    }
  }

  return { recognizedVehicle, recognizedSpec };
}

export function buildNoVehicleSummary(query: string): {
  fallbackMessage: string;
  ctas: { label: string; href: string }[];
} {
  return {
    fallbackMessage: NO_VEHICLE_MATCH_MESSAGE,
    ctas: buildNoSpecPrimaryCtas(query, query),
  };
}
