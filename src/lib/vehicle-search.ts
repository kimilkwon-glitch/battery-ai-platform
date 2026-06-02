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
} from "@/lib/search/customer-search-display";
import { vehicles as catalogVehicles } from "@/lib/platform-data";

export function assetToSearchRow(asset: VehicleAsset): VehicleSearchRow {
  const db = getVehicleCardBatteryInfo(asset.catalogId ?? asset.id);
  const needsBatteryReview = asset.batteryMatchStatus === "needsReview";
  const battery = needsBatteryReview
    ? "규격 확인 필요"
    : (db.hasConfirmedDb && db.displayCode) ||
      db.displayCode ||
      asset.defaultBatteryCode ||
      (db.needsPhotoReview ? "사진 확인 필요" : "규격 확인 필요");
  const fuel = asset.tags?.includes("EV")
    ? "전기"
    : asset.tags?.includes("하이브리드")
      ? "하이브리드"
      : "연료별";

  return {
    model: `${vehicleAssetBrandLabel(asset.brand)} ${asset.displayName}`,
    year: asset.yearRange ?? "-",
    fuel,
    origin: battery,
    recommend: battery,
    upgrade: asset.tags?.slice(0, 1).join(" · ") || "규격 확인",
    note: `${vehicleAssetBrandLabel(asset.brand)} · ${asset.tags?.slice(0, 2).join(" · ") ?? "차량"}`,
    href: vehicleAssetHref(asset),
    imageSrc: asset.image || null,
    batteryNotes:
      sanitizeCustomerBatterySummary(asset.batteryNotes) ??
      formatCustomerBatterySummaryForAsset(asset),
    needsReview: needsBatteryReview || db.needsPhotoReview,
  };
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
    imageSrc: asset?.image ?? null,
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
  const searchQ = `${formal} 배터리`.trim();
  const model = query
    ? formatSearchVehicleDisplayLabel(query, { ...alias, label: formal, formalDisplayName: formal })
    : displayModelWithBrand(brand, formal);
  return {
    model: query ? formatSearchVehicleRowTitle(query, alias, model) : model,
    year: "연식별 확인",
    fuel: "연료별",
    origin: "사진 확인 권장",
    recommend: "문의·사진 확인",
    upgrade: "연식·연료 확인",
    note: `${brand || "차량"} · 차량표 미등록 · 사진·문의로 확인`,
    href: `/search?q=${encodeURIComponent(searchQ)}`,
    imageSrc: null,
    batteryNotes: "차량 이미지가 없어도 정식 차량명 기준으로 안내합니다. 연식·연료는 사진 확인을 권장합니다.",
    needsReview: true,
  };
}

function rowFromAlias(alias: SearchVehicleAliasMatch, query = ""): VehicleSearchRow | null {
  const displayName = query ? formatSearchVehicleDisplayLabel(query, alias) : undefined;
  if (alias.assetId) {
    const asset = getVehicleAsset(alias.assetId);
    if (asset) {
      const row = assetToSearchRow(asset);
      const formal = alias.formalDisplayName ?? asset.displayName;
      const model =
        displayName ??
        displayModelWithBrand(brandForAlias(alias, vehicleAssetBrandLabel(asset.brand)), formal);
      const imageSrc = asset.image?.trim() ? asset.image : null;
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
    return {
      model: formatSearchVehicleRowTitle(query, alias, model),
      year: h.yearRange,
      fuel: h.fuels.map((f) => `${f.fuel} ${f.battery}`).join(" · ") || "연료별",
      origin: h.fuels[0]?.battery ?? "확인",
      recommend: h.fuels[0]?.battery ?? "확인",
      upgrade: h.needsReview ? "규격 재확인" : "차량 정보 기준",
      note: h.subtitle || `${h.brand} · 연료별 확인`,
      href: h.href,
      fuelHref: h.fuelHref,
      needsReview: h.needsReview,
      imageSrc: h.imageSrc,
      batteryNotes: h.subtitle,
    };
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

  let rows: VehicleSearchRow[];
  if (merged.length > 0) {
    rows = merged.map((h) => {
      const titleForRow =
        aliasMatch?.formalDisplayName ?? aliasMatch?.label ?? h.title;
      const base = displayModelWithBrand(
        aliasMatch ? brandForAlias(aliasMatch, h.brand) : h.brand,
        titleForRow,
      );
      const model = aliasMatch ? formatSearchVehicleRowTitle(query, aliasMatch, base) : base;
      return {
      model,
      year: h.yearRange,
      fuel: h.fuels.map((f) => `${f.fuel} ${f.battery}`).join(" · ") || "연료별",
      origin: h.fuels[0]?.battery ?? "확인",
      recommend: h.fuels[0]?.battery ?? "확인",
      upgrade: h.needsReview ? "규격 재확인" : "차량 정보 기준",
      note: h.subtitle || `${h.brand} · 연료별 확인`,
      href: h.href,
      fuelHref: h.fuelHref,
      needsReview: h.needsReview,
      imageSrc: h.imageSrc,
      batteryNotes: h.subtitle,
    };
    });
  } else {
    const assets = searchVehicleAssets(vehicleQuery, limit);
    rows = assets.map((asset) => assetToSearchRow(asset));
  }

  return prependAliasRow(rows, aliasMatch, query)
    .slice(0, limit)
    .map((row) => finalizeVehicleSearchRow(row, query));
}
