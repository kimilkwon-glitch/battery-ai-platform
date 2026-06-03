import {
  getVehicleAsset,
  searchVehicleAssets,
  vehicleAssetBrandLabel,
  vehicleAssetHref,
  type VehicleAsset,
} from "./car-assets";
import { resolveSpec } from "@/lib/data/resolveSpec";
import { getVehicleCardBatteryInfo, searchVehicleBatteryDb } from "./vehicleBattery";
import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";
import {
  resolveSearchVehicleAlias,
  type SearchVehicleAliasMatch,
} from "@/lib/search/search-vehicle-aliases";
import {
  expandKgMobilitySearchTerms,
  kgMobilityCanonicalBrand,
} from "@/lib/search/kg-mobility-brand";
import {
  formatSearchVehicleDisplayLabel,
  formatSearchVehicleRowTitle,
} from "@/lib/search/search-vehicle-display";
import { isBatterySpecPrimaryQuery } from "@/lib/search/battery-spec-search-alias";
import { applyStariaVehicleSearchRow } from "@/lib/search/staria-query-spec-guard";
import {
  formatCustomerBatterySummaryForAsset,
  sanitizeCustomerBatterySummary,
  sanitizeSearchRowCustomerCopy,
} from "@/lib/search/customer-search-display";
import { resolveSearchCardImageSrc } from "@/lib/search/search-vehicle-card-display";
import { normalizeQuery } from "@/lib/search/normalize-query";
import { parseVehicleIntent } from "@/lib/search/parse-vehicle-intent";
import { resolveVehicleBatterySpecForSearch } from "@/lib/search/resolve-vehicle-battery-spec";
import { customerFacingBatteryCode } from "@/lib/canonical-battery-code";
import { vehicles as catalogVehicles } from "@/lib/platform-data";

function assetMatchesIntent(asset: VehicleAsset, intent: ReturnType<typeof parseVehicleIntent>): boolean {
  if (!intent.hasVehicle) return false;
  const slug = asset.catalogId ?? asset.id;
  if (intent.assetId === slug || intent.assetId === asset.id || intent.catalogId === slug) {
    return true;
  }
  if (intent.model && norm(intent.model) === norm(asset.modelGroup)) return true;
  return norm(asset.displayName).includes(norm(intent.model ?? ""));
}

function resolveAssetRowBattery(asset: VehicleAsset, query: string): { battery: string; needsReview: boolean } {
  const { normalizedQuery } = normalizeQuery(query);
  const intent = parseVehicleIntent(normalizedQuery);
  if (assetMatchesIntent(asset, intent)) {
    const spec = resolveVehicleBatterySpecForSearch({
      exactSpec: null,
      canonicalKey: intent.canonicalKey,
      assetId: asset.catalogId ?? asset.id,
      fuel: intent.fuel,
      displayName: intent.displayName ?? asset.displayName,
      normalizedQuery,
      model: intent.model,
      year: intent.year,
      dbQuery: intent.dbQuery,
    });
    const code = spec.primaryCodes[0]
      ? customerFacingBatteryCode(spec.primaryCodes[0])
      : spec.displayValue
        ? customerFacingBatteryCode(spec.displayValue)
        : "";
    if (code) {
      return { battery: code, needsReview: spec.tier === "none" };
    }
  }

  const db = getVehicleCardBatteryInfo(asset.catalogId ?? asset.id);
  const needsBatteryReview = asset.batteryMatchStatus === "needsReview";
  const battery = needsBatteryReview
    ? "상담 확인 필요"
    : db.hasConfirmedDb && db.displayCode
      ? db.displayCode
      : db.hasUsableDb
        ? "연식·옵션별 확인 필요"
        : asset.defaultBatteryCode ||
          (db.needsPhotoReview ? "사진 확인 권장" : "상담 확인 필요");
  return {
    battery,
    needsReview: needsBatteryReview || db.needsPhotoReview || (db.hasUsableDb && !db.hasConfirmedDb),
  };
}

export function assetToSearchRow(asset: VehicleAsset, query = ""): VehicleSearchRow {
  const { battery, needsReview } = resolveAssetRowBattery(asset, query);
  const fuel = asset.tags?.includes("EV")
    ? "전기"
    : asset.tags?.includes("하이브리드")
      ? "하이브리드"
      : "연료별";

  const draft: VehicleSearchRow = {
    model: `${vehicleAssetBrandLabel(asset.brand)} ${asset.displayName}`,
    year: asset.yearRange ?? "-",
    fuel,
    origin: battery,
    recommend: battery,
    upgrade: asset.tags?.slice(0, 1).join(" · ") || "연식·옵션별 확인 필요",
    note: vehicleAssetBrandLabel(asset.brand),
    href: vehicleAssetHref(asset),
    imageSrc: resolveSearchCardImageSrc(asset.image),
    batteryNotes:
      sanitizeCustomerBatterySummary(asset.batteryNotes) ??
      formatCustomerBatterySummaryForAsset(asset),
    needsReview,
  };
  const clean = sanitizeSearchRowCustomerCopy(draft, battery);
  return { ...draft, ...clean, needsReview };
}

function rowFromCatalog(catalogId: string, label: string, brandOverride?: string): VehicleSearchRow | null {
  const v = catalogVehicles.find((c) => c.id === catalogId);
  if (!v) return null;
  const asset = getVehicleAsset(catalogId);
  const brand = brandOverride ?? v.brand ?? "";
  return {
    model: displayModelWithBrand(brand, label || v.displayName, label),
    year: v.yearRange ?? "-",
    fuel: v.fuel ?? "연료별",
    origin: v.batteryCode,
    recommend: v.batteryCode,
    upgrade: "규격 확인",
    note: `${v.brand} · ${v.fuel}`,
    href: `/vehicle/${catalogId}`,
    imageSrc: resolveSearchCardImageSrc(asset?.image ?? null),
  };
}

function displayModelWithBrand(brand: string, title: string, aliasLabel?: string): string {
  const label = aliasLabel ?? title;
  if (/^(현대|기아|제네시스|KG모빌리티|KGM|KG|BMW|벤츠|아우디|Audi|쌍용|SsangYong)/i.test(label))
    return label;
  if (brand && !label.startsWith(brand)) return `${brand} ${label}`;
  return label;
}

function brandForAlias(alias: SearchVehicleAliasMatch, fallback?: string): string {
  if (alias.brand) return kgMobilityCanonicalBrand(alias.brand);
  if (fallback) return kgMobilityCanonicalBrand(fallback);
  return "";
}

function resolveAliasDbHit(alias: SearchVehicleAliasMatch): ReturnType<typeof searchVehicleBatteryDb>[number] | null {
  const base = [
    alias.dbQuery,
    ...alias.dbQuery.split(/\s+/),
    alias.label,
    alias.label.split(/\s+/)[0],
  ].filter(Boolean);
  const candidates = [...new Set(base.flatMap((t) => [t, ...expandKgMobilitySearchTerms(t)]))];
  const seen = new Set<string>();
  for (const term of candidates) {
    const key = norm(term);
    if (seen.has(key)) continue;
    seen.add(key);
    const hits = searchVehicleBatteryDb(term, 3);
    if (hits[0]) return hits[0];
  }
  return null;
}

function aliasFallbackRow(alias: SearchVehicleAliasMatch, query = ""): VehicleSearchRow {
  const brand = brandForAlias(alias);
  const formal = alias.formalDisplayName ?? alias.label;
  const model = query
    ? formatSearchVehicleDisplayLabel(query, { ...alias, label: formal, formalDisplayName: formal })
    : displayModelWithBrand(brand, formal);
  const title = query ? formatSearchVehicleRowTitle(query, alias, model) : model;
  const slug = alias.assetId ?? alias.catalogId;
  const draft: VehicleSearchRow = {
    model: title,
    year: "연식별 확인",
    fuel: "연료별",
    origin: "사진 확인 권장",
    recommend: "상담 확인 필요",
    upgrade: "연식·옵션별 확인 필요",
    note: brand || "차량",
    href: slug ? `/vehicle/${slug}` : "/vehicles",
    fuelHref: slug ? `/vehicle/${slug}#fuel-batteries` : undefined,
    imageSrc: slug ? resolveSearchCardImageSrc(getVehicleAsset(slug)?.image) : null,
    batteryNotes: "상담 확인 필요",
    needsReview: true,
  };
  const clean = sanitizeSearchRowCustomerCopy(draft);
  return { ...draft, ...clean };
}

function rowFromAlias(alias: SearchVehicleAliasMatch, query = ""): VehicleSearchRow | null {
  const displayName = query ? formatSearchVehicleDisplayLabel(query, alias) : undefined;
  if (alias.assetId) {
    const asset = getVehicleAsset(alias.assetId);
    if (asset) {
      const row = assetToSearchRow(asset, query);
      const formal = alias.formalDisplayName ?? asset.displayName;
      const model =
        displayName ??
        displayModelWithBrand(brandForAlias(alias, vehicleAssetBrandLabel(asset.brand)), formal);
      const imageSrc = resolveSearchCardImageSrc(asset.image);
      return {
        ...row,
        model: formatSearchVehicleRowTitle(query, alias, model),
        imageSrc,
        needsReview: imageSrc ? row.needsReview : true,
      };
    }
  }
  if (alias.catalogId) {
    const fromCatalog = rowFromCatalog(alias.catalogId, alias.label, alias.brand);
    if (fromCatalog) {
      return {
        ...fromCatalog,
        model: displayName
          ? formatSearchVehicleRowTitle(query, alias, displayName)
          : fromCatalog.model,
      };
    }
  }
  const dbHit = resolveAliasDbHit(alias);
  if (dbHit) {
    const h = dbHit;
    const model =
      displayName ??
      displayModelWithBrand(
        brandForAlias(alias, h.brand),
        alias.formalDisplayName ?? (alias.label || h.title),
      );
    const draft: VehicleSearchRow = {
      model: formatSearchVehicleRowTitle(query, alias, model),
      year: h.yearRange,
      fuel: h.fuels.map((f) => `${f.fuel} ${f.battery}`).join(" · ") || "연료별",
      origin: h.fuels[0]?.battery ?? "확인",
      recommend: h.fuels[0]?.battery ?? "확인",
      upgrade: h.needsReview ? "연식·옵션별 확인 필요" : "차량 정보 기준",
      note: h.subtitle || `${h.brand} · 연료별 확인`,
      href: h.href,
      fuelHref: h.fuelHref,
      needsReview: h.needsReview,
      imageSrc: h.imageSrc,
      batteryNotes: h.subtitle,
    };
    const clean = sanitizeSearchRowCustomerCopy(draft, h.fuels[0]?.battery);
    return { ...draft, ...clean };
  }
  return aliasFallbackRow(alias, query);
}

function finalizeVehicleSearchRow(row: VehicleSearchRow, query: string): VehicleSearchRow {
  return applyStariaVehicleSearchRow(row, query);
}

function prependAliasRow(
  rows: VehicleSearchRow[],
  alias: SearchVehicleAliasMatch | null,
  query = "",
): VehicleSearchRow[] {
  if (!alias) return rows;
  const raw = rowFromAlias(alias, query);
  if (!raw) return rows;
  const aliasRow = finalizeVehicleSearchRow(raw, query);
  const key = aliasRow.href;
  const rest = rows.filter((r) => r.href !== key && !norm(r.model).includes(norm(alias.label)));
  return [aliasRow, ...rest];
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function vehicleAssetsToSearchRows(
  query: string,
  limit = 12,
  alias?: SearchVehicleAliasMatch | null,
): VehicleSearchRow[] {
  const specPrimary = isBatterySpecPrimaryQuery(query);
  const aliasMatch = specPrimary ? null : (alias ?? resolveSearchVehicleAlias(query));
  const vehicleQuery = specPrimary ? query : (aliasMatch?.dbQuery ?? query);

  if (specPrimary) {
    return [];
  }

  const expanded = resolveSpec(vehicleQuery);
  const dbQueries = [...new Set([vehicleQuery, query, ...expandKgMobilitySearchTerms(vehicleQuery), ...(expanded && expanded !== vehicleQuery ? [expanded] : [])])];
  const merged: ReturnType<typeof searchVehicleBatteryDb> = [];
  for (const term of dbQueries) {
    for (const h of searchVehicleBatteryDb(term, limit)) {
      if (!merged.some((m) => m.slug === h.slug)) merged.push(h);
    }
    if (merged.length >= limit) break;
  }

  const assetCandidates = searchVehicleAssets(vehicleQuery, limit);
  const preferGenerationCards =
    !specPrimary && assetCandidates.length >= 2 && !/\b(AGM|DIN|CMF)\d|\b\d+[lr]\b/i.test(norm(query));

  let rows: VehicleSearchRow[];
  if (preferGenerationCards) {
    rows = assetCandidates.map((asset) => assetToSearchRow(asset, query));
  } else if (merged.length > 0) {
    rows = merged.map((h) => {
      const titleForRow =
        aliasMatch?.formalDisplayName ?? aliasMatch?.label ?? h.title;
      const base = displayModelWithBrand(
        aliasMatch ? brandForAlias(aliasMatch, h.brand) : h.brand,
        titleForRow,
      );
      const model = aliasMatch ? formatSearchVehicleRowTitle(query, aliasMatch, base) : base;
      const draft: VehicleSearchRow = {
        model,
        year: h.yearRange,
        fuel: h.fuels.map((f) => `${f.fuel} ${f.battery}`).join(" · ") || "연료별",
        origin: h.fuels[0]?.battery ?? "확인",
        recommend: h.fuels[0]?.battery ?? "확인",
        upgrade: h.needsReview ? "연식·옵션별 확인 필요" : "차량 정보 기준",
        note: h.subtitle || `${h.brand}`,
        href: h.href,
        fuelHref: h.fuelHref,
        needsReview: h.needsReview,
        imageSrc: h.imageSrc,
        batteryNotes: h.subtitle,
      };
      const clean = sanitizeSearchRowCustomerCopy(draft, h.fuels[0]?.battery);
      return { ...draft, ...clean };
    });
  } else {
    rows = assetCandidates.map((asset) => assetToSearchRow(asset, query));
  }

  return prependAliasRow(rows, aliasMatch, query)
    .slice(0, limit)
    .map((row) => finalizeVehicleSearchRow(row, query));
}
