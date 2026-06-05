/**
 * 차량 상세 — 메인 검색과 동일한 배터리 추천·UX 파이프라인
 */
import { getVehicleAsset, vehicleAssetBrandLabel } from "@/lib/car-assets";
import { canonicalBatteryCode, customerFacingBatteryCode } from "@/lib/canonical-battery-code";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { classifySearch } from "@/lib/platform-data";
import type { RecognizedVehicleResult, SearchPageResults } from "@/lib/search-page-results";
import { runBatterySearch } from "@/lib/search/run-battery-search";
import {
  basisLabelForTier,
  buildNoSpecPrimaryCtas,
  buildNoSpecSecondaryLinks,
  NO_REGISTERED_SPEC_MESSAGE,
  PRIMARY_BATTERY_CTAS,
  secondaryNoteForTier,
} from "@/lib/search/battery-recommendation-copy";
import { resolveVehicleBatterySpecForSearch } from "@/lib/search/resolve-vehicle-battery-spec";
import { buildSearchUxPresentation } from "@/lib/search/search-ux-presentation";
import { resolveSearchIntentLabel } from "@/lib/search/search-intent";
import { VEHICLE_CANONICAL_REGISTRY } from "@/lib/search/vehicle-canonical-registry";
import {
  BATTERY_MATCH_PENDING_MESSAGE,
  hasCatalogBatteryMatch,
  isValidBatterySpecCode,
  resolveCustomerCatalogPrimaryBattery,
} from "@/lib/vehicle-battery-match";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";
import {
  getVehicleFixedBatteryNotice,
  getVehicleSalesExcludedNotice,
  isVehicleFuelSalesExcluded,
  shouldRenderFuelGroupInShop,
} from "@/lib/vehicle-battery-customer-policy";

export type VehicleDetailSearchParity = Pick<
  SearchPageResults,
  | "recognizedVehicle"
  | "recognizedSpec"
  | "ux"
  | "terminalTypeLabel"
  | "compareBatteryCodes"
  | "displayQuery"
  | "query"
> & {
  intentLabel: string;
};

function canonicalEntryForSlug(slug: string) {
  return (
    VEHICLE_CANONICAL_REGISTRY.find((e) => e.assetId === slug || e.catalogId === slug) ?? null
  );
}

function vehicleLabelForSlug(slug: string, fuel: string | null): string {
  const asset = getVehicleAsset(slug);
  const batteryPage = getVehicleBatteryPageData(slug);
  const base =
    batteryPage.profile?.title ??
    canonicalEntryForSlug(slug)?.displayName ??
    asset?.displayName ??
    slug;
  const brand = asset ? vehicleAssetBrandLabel(asset.brand) : "";
  const withBrand =
    brand && !base.includes(brand) && !base.startsWith("KG") ? `${brand} ${base}` : base;
  if (fuel && fuel !== "확인 필요" && !withBrand.includes(fuel)) {
    return `${withBrand} ${fuel}`;
  }
  return withBrand;
}

function searchQueryForSlug(slug: string, fuel: string | null): string {
  const entry = canonicalEntryForSlug(slug);
  const asset = getVehicleAsset(slug);
  const base = entry?.dbQuery ?? asset?.displayName ?? slug;
  return fuel?.trim() ? `${base} ${fuel.trim()}` : base;
}

function hrefMatchesSlug(href: string | undefined, slug: string): boolean {
  if (!href) return false;
  return href.includes(`/vehicle/${encodeURIComponent(slug)}`) || href.includes(`/vehicle/${slug}`);
}

function distinctFuelCodes(slug: string, fuel: string | null): string[] {
  const batteryPage = getVehicleBatteryPageData(slug);
  const groups = batteryPage.fuelGroups.filter((g) =>
    shouldRenderFuelGroupInShop(slug, g.fuelLabel),
  );
  if (fuel?.trim()) {
    const code = resolveCustomerCatalogPrimaryBattery(slug, fuel.trim());
    return isValidBatterySpecCode(code) ? [canonicalBatteryCode(code)] : [];
  }
  const codes = [
    ...new Set(
      groups
        .map((g) => resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel))
        .map((c) => canonicalBatteryCode(c))
        .filter(isValidBatterySpecCode),
    ),
  ];
  return codes;
}

function synthesizeRecognizedVehicleFromSlug(
  slug: string,
  fuel: string | null,
  yearChipId?: string | null,
): RecognizedVehicleResult {
  const salesExcluded = getVehicleSalesExcludedNotice(slug);
  const vehicleLabel = vehicleLabelForSlug(slug, fuel);
  const href = buildVehicleDetailHref(slug, fuel, yearChipId ?? null);
  const entry = canonicalEntryForSlug(slug);

  if (!hasCatalogBatteryMatch(slug)) {
    return {
      title: `${vehicleLabel} 배터리 확인`,
      vehicleLabel,
      fuelLabel: fuel ?? entry?.fuel ?? "확인 필요",
      specTier: "none",
      specFieldLabel: null,
      specDisplay: null,
      specLabel: null,
      specCheckNote: null,
      candidateLabel: null,
      candidateDisplay: null,
      confirmNote: null,
      bodyMessage: BATTERY_MATCH_PENDING_MESSAGE,
      confidenceLabel: null,
      primaryBatteryCode: null,
      secondaryNote: "사진 확인/문의 필요",
      basisLabel: null,
      fallbackMessage: BATTERY_MATCH_PENDING_MESSAGE,
      guidance: BATTERY_MATCH_PENDING_MESSAGE,
      href,
      ctas: buildNoSpecPrimaryCtas(vehicleLabel, vehicleLabel),
      secondaryLinks: buildNoSpecSecondaryLinks(),
    };
  }

  if (salesExcluded) {
    return {
      title: `${vehicleLabel} 배터리 안내`,
      vehicleLabel,
      fuelLabel: fuel ?? entry?.fuel ?? "확인 필요",
      specTier: "none",
      specFieldLabel: null,
      specDisplay: null,
      specLabel: null,
      specCheckNote: null,
      candidateLabel: null,
      candidateDisplay: null,
      confirmNote: null,
      bodyMessage: salesExcluded,
      confidenceLabel: null,
      primaryBatteryCode: null,
      secondaryNote: salesExcluded,
      basisLabel: null,
      fallbackMessage: salesExcluded,
      guidance: salesExcluded,
      href,
      ctas: buildNoSpecPrimaryCtas(vehicleLabel, vehicleLabel),
      secondaryLinks: buildNoSpecSecondaryLinks(),
    };
  }

  const batterySpec = resolveVehicleBatterySpecForSearch({
    exactSpec: null,
    canonicalKey: entry?.canonicalKey ?? null,
    assetId: slug,
    fuel,
    displayName: vehicleLabel,
    dbQuery: entry?.dbQuery ?? getVehicleAsset(slug)?.displayName ?? slug,
    normalizedQuery: searchQueryForSlug(slug, fuel),
    model: entry?.model ?? getVehicleAsset(slug)?.modelGroup ?? null,
    year: null,
  });

  const fuelCodes = distinctFuelCodes(slug, fuel);
  const isMulti = !fuel && fuelCodes.length > 1;
  const unifiedPrimary =
    fuel && fuel !== "확인 필요"
      ? resolveCustomerCatalogPrimaryBattery(slug, fuel)
      : fuelCodes.length === 1
        ? fuelCodes[0]!
        : "";

  const rawPrimary = isMulti
    ? null
    : unifiedPrimary ||
      (batterySpec.primaryCodes[0] ? canonicalBatteryCode(batterySpec.primaryCodes[0]) : null);
  const primaryBatteryCode = isValidBatterySpecCode(rawPrimary) ? rawPrimary : null;

  const specDisplay = isMulti
    ? fuelCodes.map((c) => customerFacingBatteryCode(c)).join(" / ")
    : primaryBatteryCode
      ? customerFacingBatteryCode(primaryBatteryCode)
      : batterySpec.displayValue
        ? customerFacingBatteryCode(batterySpec.displayValue)
        : null;

  const fixedNotice = getVehicleFixedBatteryNotice(slug);
  const tier = batterySpec.tier === "none" && primaryBatteryCode ? "db" : batterySpec.tier;
  const hasSpecLine = tier !== "none" || Boolean(primaryBatteryCode) || isMulti;

  return {
    title: `${vehicleLabel} 배터리 확인`,
    vehicleLabel,
    fuelLabel: fuel ?? entry?.fuel ?? "확인 필요",
    specTier: hasSpecLine ? tier : "none",
    specFieldLabel: batterySpec.fieldLabel ?? (hasSpecLine ? "추천 규격" : null),
    specDisplay,
    specLabel: hasSpecLine ? specDisplay : null,
    specCheckNote: null,
    candidateLabel: batterySpec.fieldLabel,
    candidateDisplay: batterySpec.displayValue,
    confirmNote: null,
    bodyMessage: null,
    confidenceLabel: batterySpec.confidenceLabel,
    dbMatchKey: batterySpec.dbMatchKey ?? slug,
    dbRecordId: batterySpec.dbRecordId,
    dbRecordDisplayName: batterySpec.dbRecordDisplayName,
    specSource: batterySpec.source,
    primaryBatteryCode,
    candidateBatteryCodes: isMulti ? fuelCodes : undefined,
    secondaryNote:
      fixedNotice ??
      batterySpec.caution ??
      secondaryNoteForTier(tier) ??
      (isMulti ? "연료별 규격이 다릅니다. 연료 칩으로 확인하세요." : null),
    basisLabel: basisLabelForTier(tier, batterySpec.source),
    fallbackMessage: hasSpecLine ? null : NO_REGISTERED_SPEC_MESSAGE,
    guidance: fixedNotice ?? batterySpec.bodyMessage ?? NO_REGISTERED_SPEC_MESSAGE,
    href,
    ctas: isMulti
      ? fuelCodes.map((code) => ({
          label: `${customerFacingBatteryCode(code)} 상세`,
          href: `/batteries/${encodeURIComponent(code)}`,
        }))
      : primaryBatteryCode
        ? PRIMARY_BATTERY_CTAS(primaryBatteryCode)
        : buildNoSpecPrimaryCtas(vehicleLabel, vehicleLabel),
    secondaryLinks: primaryBatteryCode
      ? [{ label: "사진으로 규격 확인", href: "/photo-check" }]
      : buildNoSpecSecondaryLinks(),
  };
}

function mergeSearchWithSlugParity(
  slug: string,
  fuel: string | null,
  yearChipId: string | null | undefined,
  searchResults: SearchPageResults,
): RecognizedVehicleResult {
  const fromSearch = searchResults.recognizedVehicle;
  const searchOk =
    fromSearch &&
    hrefMatchesSlug(fromSearch.href, slug) &&
    Boolean(
      fromSearch.primaryBatteryCode ||
        fromSearch.candidateBatteryCodes?.length ||
        getVehicleSalesExcludedNotice(slug),
    );

  if (searchOk && fromSearch) {
    if (fuel && fromSearch.fuelLabel !== fuel) {
      return synthesizeRecognizedVehicleFromSlug(slug, fuel, yearChipId);
    }
    return {
      ...fromSearch,
      href: buildVehicleDetailHref(slug, fuel ?? fromSearch.fuelLabel, yearChipId ?? null),
      dbMatchKey: fromSearch.dbMatchKey ?? slug,
    };
  }

  return synthesizeRecognizedVehicleFromSlug(slug, fuel, yearChipId);
}

/**
 * 차량 slug 기준 — 메인 검색과 동일한 recognizedVehicle·UX 생성
 */
export function buildVehicleDetailSearchParity(
  slug: string,
  options?: { fuel?: string | null; yearChipId?: string | null },
): VehicleDetailSearchParity {
  const fuel = options?.fuel?.trim() || null;
  const yearChipId = options?.yearChipId ?? null;
  const query = searchQueryForSlug(slug, fuel);
  const displayQuery = vehicleLabelForSlug(slug, fuel);

  let searchResults: SearchPageResults;
  try {
    searchResults = runBatterySearch(query, { searchType: "vehicle" });
  } catch (err) {
    console.error("[vehicle-detail-search] runBatterySearch failed:", slug, err);
    searchResults = runBatterySearch("");
  }

  const recognizedVehicle = mergeSearchWithSlugParity(
    slug,
    fuel,
    yearChipId,
    searchResults,
  );

  const intent = classifySearch(query);
  const intentLabel = resolveSearchIntentLabel(query, { hasVehicle: true, hasAlias: false });

  const ux = buildSearchUxPresentation({
    query,
    displayQuery,
    intent,
    summary: {
      vehicleKeywords: [displayQuery],
      batterySpecs: recognizedVehicle.primaryBatteryCode
        ? [recognizedVehicle.primaryBatteryCode]
        : recognizedVehicle.candidateBatteryCodes ?? [],
      symptomKeywords: [],
    },
    symptomDiagnosisFirst: false,
    compareIntent: false,
    compareBatteryCodes: null,
    recognizedVehicle,
    recognizedSpec: null,
    vehicles: [],
    intentMessage: null,
  });

  return {
    query,
    displayQuery,
    recognizedVehicle,
    recognizedSpec: null,
    terminalTypeLabel: searchResults.terminalTypeLabel,
    compareBatteryCodes: searchResults.compareBatteryCodes,
    ux,
    intentLabel,
  };
}

/** 연료 그룹이 판매 제외인지 (리튬 등) */
export function isDetailFuelExcluded(slug: string, fuelLabel: string): boolean {
  return isVehicleFuelSalesExcluded(slug, fuelLabel);
}
