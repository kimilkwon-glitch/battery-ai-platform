#!/usr/bin/env npx tsx
/**
 * 차량·배터리·이미지·별칭 전체 소스 덤프 (read-only)
 * 출력: reports/full-vehicle-battery-source-dump.{json,csv}
 *       reports/vehicle-name-alias-conflicts.csv
 *       reports/battery-match-existing-review.csv
 *       reports/battery-match-unmatched-review.csv
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import vehicleBatteryDb from "../src/data/vehicle-battery-db.json";
import enrichmentJson from "../src/data/vehicle-battery-enrichment.json";
import userConfirmedJson from "../src/data/vehicle-battery-user-confirmed.json";
import { vehicleAliasDbV01 } from "../src/data/vehicle-alias-db";
import { VEHICLE_GENERATIONS_V04 } from "../src/data/vehicle-generation-v04.config";
import { VEHICLE_GENERATIONS_CHEVROLET } from "../src/data/vehicle-generation-chevrolet.config";
import { buildAdminVehicleRows, vehicleReviewReasonLabel } from "../src/lib/admin/data/vehicles-admin";
import { vehicleAssets, vehicleAssetBrandLabel, type VehicleAsset } from "../src/lib/car-assets";
import { catalogVehicles } from "../src/lib/platform-catalog";
import { SLUG_HINT_TO_ASSET_ID } from "../src/lib/search/vehicle-alias-slug-map";
import { VEHICLE_CANONICAL_REGISTRY } from "../src/lib/search/vehicle-canonical-registry";
import {
  OPERATOR_FUEL_PRIMARY,
  OPERATOR_SLUG_PRIMARY_BATTERY,
} from "../src/lib/vehicle-operator-battery-tables";
import {
  hasCatalogBatteryMatch,
  resolveBatteryMatchStatus,
  resolveCatalogBatteryCandidates,
  resolveCatalogPrimaryBattery,
  resolveCustomerCatalogPrimaryBattery,
} from "../src/lib/vehicle-battery-match";
import { isVehicleFullyLithiumSalesExcluded } from "../src/lib/vehicle-battery-customer-policy";
import { customerFacingRepresentativeBattery } from "../src/lib/vehicle-detail-recommendation";
import { buildFuelHeroCardGroups } from "../src/lib/vehicle-fuel-primary-battery";
import {
  getRecordsForSlug,
  getVehicleBatteryPageData,
  getVehicleCardBatteryInfo,
  getVehicleDbProfile,
  type VehicleBatteryRecord,
} from "../src/lib/vehicleBattery";
import { getVehicleDetail } from "../src/lib/vehicle-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPORTS = path.join(ROOT, "reports");

const DB_RECORDS = (vehicleBatteryDb as { records: VehicleBatteryRecord[] }).records;
const ENRICHMENT = (enrichmentJson as { records?: Record<string, unknown>[] }).records ?? [];
const USER_CONFIRMED = (userConfirmedJson as { records?: VehicleBatteryRecord[] }).records ?? [];

const IMAGE_DIRS = [
  "public/assets/cars-normalized",
  "public/assets/cars",
  "public/assets/vehicles/cars-normalized",
].map((d) => path.join(ROOT, d));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function csvCell(v: unknown): string {
  if (v == null) return '""';
  const s = Array.isArray(v) ? v.join(" | ") : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function writeCsv(filePath: string, headers: string[], rows: Record<string, unknown>[]) {
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")),
  ];
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()~·\-_/]/g, "");
}

function parseYearRange(yearRange?: string | null): { start: number | null; end: number | null } {
  if (!yearRange?.trim()) return { start: null, end: null };
  const m = yearRange.match(/(\d{4})\s*[-~]\s*(\d{4}|현재|이후)/);
  if (!m) return { start: null, end: null };
  return {
    start: parseInt(m[1], 10),
    end: m[2] === "현재" || m[2] === "이후" ? null : parseInt(m[2], 10),
  };
}

function yearsOverlap(
  a: { start: number | null; end: number | null },
  b: { start: number | null; end: number | null },
): boolean {
  if (a.start == null || b.start == null) return false;
  const aEnd = a.end ?? 9999;
  const bEnd = b.end ?? 9999;
  return a.start <= bEnd && b.start <= aEnd;
}

const GEN_TOKEN_RE =
  /\b(NF|YF|LF|DN8|IG|GN7|TG|HG|MD|AD|CN7|HD|JM|LM|TL|NX4|CM|DM|TM|MX5|LX2|LX3|US4|DL3|GL3|TF|JF|YD|BD|QL|NQ5|UM|MQ4|KA4|VQ|YP|SG2|DE|EV6|GV60|GV70|GV80|RG3|DH|EQ900)\b/i;

function extractGenerationTokens(...texts: (string | null | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const t of texts) {
    if (!t) continue;
    for (const m of t.matchAll(new RegExp(GEN_TOKEN_RE.source, "gi"))) {
      out.add(m[1]!.toUpperCase());
    }
  }
  return out;
}

function slugImageStem(slug: string): string {
  return slug.replace(/-/g, "_");
}

function walkPngFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPngFiles(full, acc);
    else if (/\.(png|webp|jpg|jpeg)$/i.test(ent.name)) acc.push(full);
  }
  return acc;
}

function allPublicVehicleImages(): Map<string, string[]> {
  const byFile = new Map<string, string[]>();
  for (const dir of IMAGE_DIRS) {
    for (const fp of walkPngFiles(dir)) {
      const base = path.basename(fp);
      const rel = path.relative(ROOT, fp).replace(/\\/g, "/");
      const list = byFile.get(base) ?? [];
      list.push(rel);
      byFile.set(base, list);
    }
  }
  return byFile;
}

function resolveAliasAssetId(slugHint: string): string | null {
  return SLUG_HINT_TO_ASSET_ID[slugHint] ?? (vehicleAssets.some((a) => a.id === slugHint) ? slugHint : null);
}

function matchedSources(slug: string, asset: VehicleAsset): string[] {
  const sources: string[] = [];
  if (OPERATOR_SLUG_PRIMARY_BATTERY[slug]) sources.push("OPERATOR_SLUG_PRIMARY_BATTERY");
  if (OPERATOR_FUEL_PRIMARY[slug]) sources.push("OPERATOR_FUEL_PRIMARY");
  if (asset.defaultBatteryCode) sources.push("asset.defaultBatteryCode");
  if (ENRICHMENT.some((e) => (e as { vehicleId?: string }).vehicleId === slug)) {
    sources.push("vehicle-battery-enrichment.json");
  }
  if (USER_CONFIRMED.some((r) => r.id.includes(slug) || norm(r.displayName).includes(norm(asset.displayName)))) {
    sources.push("vehicle-battery-user-confirmed.json");
  }
  if (getRecordsForSlug(slug).some((r) => r.primaryBattery?.trim())) {
    sources.push("vehicle-battery-db.json");
  }
  const pv = catalogVehicles.find((v) => v.id === slug || v.id === asset.catalogId);
  if (pv?.batteryCode) sources.push("platform-catalog.ts");
  return sources;
}

function riskLevelForMatched(
  slug: string,
  asset: VehicleAsset,
  sources: string[],
  customerVisible: boolean,
): { riskLevel: string; reason: string; needsReview: boolean } {
  const reasons: string[] = [];
  let risk = "low";

  const operatorOnly =
    sources.length > 0 &&
    sources.every((s) => s === "OPERATOR_SLUG_PRIMARY_BATTERY" || s === "OPERATOR_FUEL_PRIMARY");
  const defaultOnly =
    sources.includes("asset.defaultBatteryCode") &&
    !sources.includes("OPERATOR_SLUG_PRIMARY_BATTERY") &&
    !sources.includes("OPERATOR_FUEL_PRIMARY");
  const fuelOnly =
    sources.includes("OPERATOR_FUEL_PRIMARY") && !sources.includes("OPERATOR_SLUG_PRIMARY_BATTERY");

  if (defaultOnly) {
    reasons.push("defaultBatteryCode만으로 매칭");
    risk = "medium";
  }
  if (fuelOnly) {
    reasons.push("OPERATOR_FUEL_PRIMARY(연료 분기)만으로 slug-level 매칭 없음");
    risk = "high";
  }
  if (operatorOnly && fuelOnly) risk = "high";

  const page = getVehicleBatteryPageData(slug);
  const fuelCount = page.fuelGroups.filter((g) => g.fuelLabel !== "확인 필요" && g.fuelLabel !== "공통").length;
  if (fuelCount > 1 && fuelOnly) {
    reasons.push(`연료 그룹 ${fuelCount}개 — 연료별 규격 분기 검수 필요`);
    risk = "high";
  }

  if (asset.catalogId && asset.catalogId !== asset.id) {
    reasons.push(`catalogId(${asset.catalogId}) ≠ slug(${asset.id})`);
    if (risk === "low") risk = "medium";
  }

  const stem = slugImageStem(slug);
  if (asset.imageFile && !norm(asset.imageFile).includes(norm(stem)) && !norm(stem).includes(norm(asset.imageFile.replace(/\.[^.]+$/, "")))) {
    reasons.push(`이미지 파일명(${asset.imageFile})과 slug stem 불일치`);
    if (risk === "low") risk = "medium";
  }

  if (!customerVisible) {
    reasons.push("hasCatalogBatteryMatch=true 이지만 고객 카드 미노출");
    risk = "high";
  }

  return {
    riskLevel: risk,
    reason: reasons.length ? reasons.join("; ") : "운영 차종표·이미지·이름 정합",
    needsReview: risk !== "low",
  };
}

type ConflictRow = {
  possibleCanonicalSlug: string;
  nameA: string;
  nameB: string;
  sourceA: string;
  sourceB: string;
  reason: string;
  confidence: "high" | "medium" | "low";
  needsHumanReview: boolean;
};

function compareNames(
  slug: string,
  nameA: string,
  sourceA: string,
  nameB: string,
  sourceB: string,
  ctx: { modelGroup?: string; yearA?: string; yearB?: string; genA?: Set<string>; genB?: Set<string> },
): ConflictRow | null {
  if (!nameA?.trim() || !nameB?.trim()) return null;
  if (norm(nameA) === norm(nameB)) return null;

  const genA = ctx.genA ?? extractGenerationTokens(nameA);
  const genB = ctx.genB ?? extractGenerationTokens(nameB);
  const genConflict =
    genA.size > 0 && genB.size > 0 && ![...genA].some((g) => genB.has(g));

  const yearA = parseYearRange(ctx.yearA);
  const yearB = parseYearRange(ctx.yearB);
  const yearConflict = yearA.start != null && yearB.start != null && !yearsOverlap(yearA, yearB);

  let confidence: "high" | "medium" | "low" = "medium";
  let reason = "표기명 불일치";

  if (genConflict) {
    confidence = "low";
    reason = `세대 코드 불일치 (${[...genA].join("/")} vs ${[...genB].join("/")})`;
  } else if (yearConflict) {
    confidence = "low";
    reason = "연식 범위 불일치";
  } else if (genA.size > 0 && genB.size > 0 && [...genA].some((g) => genB.has(g))) {
    confidence = "medium";
    reason = "동일 세대로 보이나 표기명 상이";
  } else {
    confidence = "low";
    reason = "세대·연식 정보 부족 — 동일 차량 여부 불명확";
  }

  return {
    possibleCanonicalSlug: slug,
    nameA,
    nameB,
    sourceA,
    sourceB,
    reason,
    confidence,
    needsHumanReview: true,
  };
}

// ---------------------------------------------------------------------------
// Per-slug assembly
// ---------------------------------------------------------------------------

type SourceDumpRow = Record<string, unknown>;

function buildAliasMaps() {
  const byAssetId = new Map<string, typeof vehicleAliasDbV01>();
  const bySlugHint = new Map<string, typeof vehicleAliasDbV01>();

  for (const entry of vehicleAliasDbV01) {
    const listH = bySlugHint.get(entry.slugHint) ?? [];
    listH.push(entry);
    bySlugHint.set(entry.slugHint, listH);

    const assetId = resolveAliasAssetId(entry.slugHint);
    if (assetId) {
      const listA = byAssetId.get(assetId) ?? [];
      listA.push(entry);
      byAssetId.set(assetId, listA);
    }
  }
  return { byAssetId, bySlugHint };
}

function generationConfigForSlug(slug: string) {
  const v04 = VEHICLE_GENERATIONS_V04.find((g) => g.id === slug);
  const chev = VEHICLE_GENERATIONS_CHEVROLET.find((g) => g.id === slug);
  return { v04, chev };
}

function canonicalEntriesForSlug(slug: string) {
  return VEHICLE_CANONICAL_REGISTRY.filter((e) => e.assetId === slug || e.catalogId === slug);
}

function buildRow(asset: VehicleAsset, adminBySlug: Map<string, ReturnType<typeof buildAdminVehicleRows>[0]>, publicImages: Map<string, string[]>, aliasMaps: ReturnType<typeof buildAliasMaps>): SourceDumpRow {
  const slug = asset.id;
  const admin = adminBySlug.get(slug);
  const profile = getVehicleDbProfile(slug);
  const dbRecs = getRecordsForSlug(slug);
  const card = getVehicleCardBatteryInfo(slug);
  const page = getVehicleBatteryPageData(slug);
  const detail = getVehicleDetail(slug);
  const genCfg = generationConfigForSlug(slug);
  const aliasEntries = aliasMaps.byAssetId.get(slug) ?? [];
  const canonical = canonicalEntriesForSlug(slug);
  const platform = catalogVehicles.find((v) => v.id === slug || v.id === asset.catalogId);

  const tablePrimary = resolveCatalogPrimaryBattery(slug, asset);
  const tableCandidates = resolveCatalogBatteryCandidates(slug, asset);
  const operatorSlug = OPERATOR_SLUG_PRIMARY_BATTERY[slug] ?? "";
  const operatorFuel = OPERATOR_FUEL_PRIMARY[slug] ?? null;
  const resolvedCustomer = resolveCustomerCatalogPrimaryBattery(slug);
  const catalogMatch = hasCatalogBatteryMatch(slug, asset);
  const batteryStatus = resolveBatteryMatchStatus(tablePrimary, tableCandidates);
  const fuelCards = buildFuelHeroCardGroups(slug, page.fuelGroups);
  const salesExcluded = isVehicleFullyLithiumSalesExcluded(slug);
  const customerVisible = catalogMatch && fuelCards.length > 0 && !salesExcluded;

  const enrich = ENRICHMENT.find((e) => (e as { vehicleId?: string }).vehicleId === slug);
  const sources: string[] = ["src/lib/car-assets.ts"];
  if (admin) sources.push("src/lib/admin/data/vehicles-admin.ts");
  if (dbRecs.length) sources.push("src/data/vehicle-battery-db.json");
  if (enrich) sources.push("src/data/vehicle-battery-enrichment.json");
  if (aliasEntries.length) sources.push("src/data/vehicle-alias-db.ts");
  if (genCfg.v04) sources.push("src/data/vehicle-generation-v04.config.ts");
  if (genCfg.chev) sources.push("src/data/vehicle-generation-chevrolet.config.ts");
  if (operatorSlug || operatorFuel) sources.push("src/lib/vehicle-operator-battery-tables.ts");
  if (platform) sources.push("src/lib/platform-catalog.ts");

  const allAliases = [
    ...asset.aliases,
    ...aliasEntries.flatMap((e) => [...e.aliases, ...e.displayAliases]),
    ...(genCfg.v04?.searchAliases ?? []),
    ...(genCfg.chev?.searchAliases ?? []),
    ...canonical.flatMap((c) => c.aliases),
  ];

  const displayAliases = [
    ...aliasEntries.flatMap((e) => e.displayAliases),
    ...(genCfg.v04?.searchAliases ?? []),
  ];

  const fuelLabels = page.fuelGroups.map((g) => g.fuelLabel);
  const fuelBatteries = Object.fromEntries(
    page.fuelGroups.map((g) => [g.fuelLabel, {
      primary: g.primaryBattery,
      options: g.batteryOptions,
      alternatives: g.alternatives,
      catalogPrimary: resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel),
    }]),
  );

  const imagePathsOnDisk = asset.imageFile ? (publicImages.get(asset.imageFile) ?? []) : [];

  const codeName =
    aliasEntries.map((e) => e.generationCode).filter(Boolean).join(" | ") ||
    [...extractGenerationTokens(asset.displayName, asset.generationName, asset.id)].join(" | ") ||
    "";

  return {
    slug,
    maker: vehicleAssetBrandLabel(asset.brand),
    vehicleName: asset.displayName,
    displayName: asset.displayName,
    yearRange: asset.yearRange ?? admin?.yearRange ?? "—",
    fuel: fuelLabels.join(" | ") || platform?.fuel || detail.fuel || "—",
    generationName: asset.generationName ?? aliasEntries[0]?.generationName ?? genCfg.v04?.generationName ?? "",
    codeName,
    aliases: [...new Set(allAliases)],
    displayAliases: [...new Set(displayAliases)],
    imagePath: asset.image || "",
    imageFileName: asset.imageFile || "",
    imageAlt: asset.displayName,
    imagePathsOnDisk,
    imageStemFromSlug: slugImageStem(slug),
    tablePrimaryBattery: tablePrimary,
    tableCandidates,
    operatorSlugBattery: operatorSlug,
    operatorFuelBattery: operatorFuel,
    defaultBatteryCode: asset.defaultBatteryCode ?? "",
    recommendedBattery: detail.recommendedBattery ?? "",
    primaryBatteryCode: page.summary?.representativeBattery ?? card.displayCode ?? "",
    resolvedCustomerBattery: resolvedCustomer,
    customerRepresentativeBattery: customerFacingRepresentativeBattery(slug, page.fuelGroups),
    hasCatalogBatteryMatch: catalogMatch,
    batteryMatchStatus: batteryStatus,
    vehicleStatus: admin?.vehicleStatus ?? "—",
    imageStatus: admin?.imageStatus ?? (asset.image ? "present" : "missing"),
    salesExcluded,
    reviewReason: admin ? vehicleReviewReasonLabel(admin) : "",
    customerBatteryCardVisible: customerVisible,
    customerBatteryCardCount: fuelCards.length,
    catalogId: asset.catalogId ?? "",
    modelGroup: asset.modelGroup,
    dbModels: asset.dbModels ?? profile?.dbModels ?? [],
    tags: asset.tags ?? [],
    recommendExcluded: Boolean(asset.recommendExcluded),
    batteryNotes: asset.batteryNotes ?? "",
    batteryMatchStatusAsset: asset.batteryMatchStatus ?? "",
    dbRecordCount: dbRecs.length,
    dbRecordsSummary: dbRecs.slice(0, 5).map((r) => ({
      id: r.id,
      displayName: r.displayName,
      fuel: r.fuel,
      primaryBattery: r.primaryBattery,
      status: r.status,
      confidence: r.confidence,
    })),
    enrichment: enrich ?? null,
    fuelBatteries,
    platformCatalog: platform
      ? { id: platform.id, displayName: platform.displayName, batteryCode: platform.batteryCode, fuel: platform.fuel }
      : null,
    aliasEntries: aliasEntries.map((e) => ({
      slugHint: e.slugHint,
      canonicalName: e.canonicalName,
      generationCode: e.generationCode,
      yearRange: e.yearRange,
    })),
    generationConfig: genCfg.v04 ?? genCfg.chev ?? null,
    canonicalRegistry: canonical.map((c) => ({
      canonicalKey: c.canonicalKey,
      displayName: c.displayName,
      dbQuery: c.dbQuery,
    })),
    matchedSources: matchedSources(slug, asset),
    sourceFiles: [...new Set(sources)],
    rawAsset: {
      id: asset.id,
      brand: asset.brand,
      modelGroup: asset.modelGroup,
      displayName: asset.displayName,
      generationName: asset.generationName,
      catalogId: asset.catalogId,
      imageFile: asset.imageFile,
      image: asset.image,
      defaultBatteryCode: asset.defaultBatteryCode,
      aliases: asset.aliases,
      yearRange: asset.yearRange,
      dbModels: asset.dbModels,
      tags: asset.tags,
    },
  };
}

function collectConflicts(rows: SourceDumpRow[]): ConflictRow[] {
  const conflicts: ConflictRow[] = [];
  const seen = new Set<string>();

  const push = (c: ConflictRow | null) => {
    if (!c) return;
    const key = `${c.possibleCanonicalSlug}|${norm(c.nameA)}|${norm(c.nameB)}|${c.sourceA}|${c.sourceB}`;
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push(c);
  };

  for (const row of rows) {
    const slug = String(row.slug);
    const displayName = String(row.displayName);
    const yearRange = String(row.yearRange);
    const genCtx = { yearA: yearRange, yearB: yearRange };

    push(
      compareNames(
        slug,
        displayName,
        "car-assets.displayName",
        String(row.imageFileName).replace(/\.[^.]+$/, ""),
        "imageFileName(stem)",
        { ...genCtx, genB: extractGenerationTokens(slug) },
      ),
    );

    if (row.catalogId && row.catalogId !== slug) {
      push({
        possibleCanonicalSlug: slug,
        nameA: slug,
        nameB: String(row.catalogId),
        sourceA: "asset.id",
        sourceB: "asset.catalogId",
        reason: "slug와 catalogId 불일치",
        confidence: "medium",
        needsHumanReview: true,
      });
    }

    const aliasEntries = row.aliasEntries as { canonicalName: string; slugHint: string; yearRange?: string; generationCode?: string }[];
    for (const ae of aliasEntries) {
      push(
        compareNames(
          slug,
          displayName,
          "car-assets.displayName",
          ae.canonicalName,
          `vehicle-alias-db(${ae.slugHint})`,
          {
            yearA: yearRange,
            yearB: ae.yearRange,
            genA: extractGenerationTokens(displayName, String(row.codeName)),
            genB: extractGenerationTokens(ae.canonicalName, ae.generationCode),
          },
        ),
      );
      if (ae.slugHint !== slug && !SLUG_HINT_TO_ASSET_ID[ae.slugHint]) {
        push({
          possibleCanonicalSlug: slug,
          nameA: slug,
          nameB: ae.slugHint,
          sourceA: "asset.id",
          sourceB: "alias.slugHint(unmapped)",
          reason: "alias slugHint가 asset id와 다르고 SLUG_HINT 맵에 없음",
          confidence: "low",
          needsHumanReview: true,
        });
      }
    }

    const genCfg = row.generationConfig as { displayName?: string; yearRange?: string; generationName?: string } | null;
    if (genCfg?.displayName) {
      push(
        compareNames(
          slug,
          displayName,
          "car-assets.displayName",
          genCfg.displayName,
          "generation.config.displayName",
          {
            yearA: yearRange,
            yearB: genCfg.yearRange,
            genA: extractGenerationTokens(displayName, String(row.generationName)),
            genB: extractGenerationTokens(genCfg.displayName, genCfg.generationName),
          },
        ),
      );
    }

    const platform = row.platformCatalog as { displayName?: string; id?: string } | null;
    if (platform?.displayName) {
      push(
        compareNames(slug, displayName, "car-assets.displayName", platform.displayName, "platform-catalog.displayName", {
          yearA: yearRange,
          yearB: yearRange,
        }),
      );
    }

    for (const rec of (row.dbRecordsSummary as { displayName: string }[]) ?? []) {
      push(
        compareNames(slug, displayName, "car-assets.displayName", rec.displayName, "vehicle-battery-db.displayName", {
          yearA: yearRange,
          genA: extractGenerationTokens(displayName, String(row.codeName)),
          genB: extractGenerationTokens(rec.displayName),
        }),
      );
    }
  }

  // Cross-slug: duplicate modelGroup + overlapping years + similar display
  const assets = rows.map((r) => ({
    slug: String(r.slug),
    displayName: String(r.displayName),
    modelGroup: String(r.modelGroup),
    yearRange: String(r.yearRange),
  }));

  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const a = assets[i]!;
      const b = assets[j]!;
      if (a.modelGroup !== b.modelGroup) continue;
      const ya = parseYearRange(a.yearRange);
      const yb = parseYearRange(b.yearRange);
      if (!yearsOverlap(ya, yb)) continue;
      const ga = extractGenerationTokens(a.displayName, a.slug);
      const gb = extractGenerationTokens(b.displayName, b.slug);
      if (ga.size && gb.size && ![...ga].some((g) => gb.has(g))) continue;
      if (norm(a.displayName) === norm(b.displayName)) {
        conflicts.push({
          possibleCanonicalSlug: a.slug,
          nameA: `${a.slug} (${a.displayName})`,
          nameB: `${b.slug} (${b.displayName})`,
          sourceA: "car-assets",
          sourceB: "car-assets",
          reason: "동일 modelGroup·겹치는 연식·유사 세대 — slug 중복 후보",
          confidence: "low",
          needsHumanReview: true,
        });
      }
    }
  }

  return conflicts.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}

function buildMatchedReview(rows: SourceDumpRow[]): Record<string, unknown>[] {
  return rows
    .filter((r) => r.batteryMatchStatus === "matched" && !r.salesExcluded)
    .map((r) => {
      const slug = String(r.slug);
      const sources = r.matchedSources as string[];
      const customerVisible = Boolean(r.customerBatteryCardVisible);
      const risk = riskLevelForMatched(slug, r.rawAsset as VehicleAsset, sources, customerVisible);
      return {
        slug,
        vehicleName: r.displayName,
        yearRange: r.yearRange,
        fuel: r.fuel,
        currentMatchedBattery: r.tablePrimaryBattery,
        matchedSource: sources.join(" | "),
        customerVisible,
        riskLevel: risk.riskLevel,
        reason: risk.reason,
        needsReview: risk.needsReview,
      };
    });
}

function buildUnmatchedReview(rows: SourceDumpRow[], aliasMaps: ReturnType<typeof buildAliasMaps>): Record<string, unknown>[] {
  return rows
    .filter((r) => r.batteryMatchStatus === "unmatched" && !r.salesExcluded)
    .map((r) => {
      const slug = String(r.slug);
      const displayName = String(r.displayName);
      const modelGroup = String(r.modelGroup);

      // DB 후보: 같은 modelGroup + brand
      const dbCandidates = DB_RECORDS.filter((rec) => {
        const mg = norm(modelGroup);
        return (
          norm(rec.model).includes(mg) ||
          norm(rec.displayName).includes(mg) ||
          (r.dbModels as string[]).some((m) => norm(rec.model).includes(norm(m)))
        );
      })
        .slice(0, 3)
        .map((rec) => ({ displayName: rec.displayName, primaryBattery: rec.primaryBattery, id: rec.id }));

      const aliasCandidate = [...aliasMaps.byAssetId.entries()]
        .filter(([id]) => id !== slug)
        .flatMap(([id, entries]) =>
          entries
            .filter((e) => norm(e.canonicalName).includes(norm(displayName)) || norm(displayName).includes(norm(e.canonicalName)))
            .map((e) => ({ slug: id, canonicalName: e.canonicalName, slugHint: e.slugHint })),
        )
        .slice(0, 3);

      const enrichCandidate = ENRICHMENT.find((e) => {
        const vid = (e as { vehicleId?: string }).vehicleId ?? "";
        return norm((e as { model?: string }).model ?? "").includes(norm(modelGroup));
      }) as { vehicleId?: string; primaryBattery?: string } | undefined;

      const reasons: string[] = [];
      if (!r.imageFileName) reasons.push("이미지 파일 없음");
      else if ((r.imagePathsOnDisk as string[]).length === 0) reasons.push("public/assets에 이미지 파일 미존재");
      if ((r.dbRecordCount as number) > 0) reasons.push("DB 레코드는 있으나 catalog 매칭 미완료");
      if (aliasCandidate.length) reasons.push("유사 alias가 다른 slug에 연결됨");
      if (enrichCandidate) reasons.push(`enrichment 후보 vehicleId=${enrichCandidate.vehicleId}`);
      if (!reasons.length) reasons.push("운영 차종표·operator·defaultBatteryCode 모두 없음");

      let riskLevel = "low";
      if ((r.dbRecordCount as number) > 0 && (r.imageFileName as string)) riskLevel = "medium";
      if (aliasCandidate.length && (r.imageFileName as string)) riskLevel = "medium";
      if (norm(displayName) !== norm((r.imageFileName as string).replace(/\.[^.]+$/, "").replace(/_/g, ""))) {
        if (riskLevel === "low") riskLevel = "medium";
      }

      return {
        slug,
        vehicleName: displayName,
        yearRange: r.yearRange,
        fuel: r.fuel,
        imageFileName: r.imageFileName,
        aliases: (r.aliases as string[]).slice(0, 8).join(" | "),
        possibleMatchedName:
          dbCandidates[0]?.displayName ??
          aliasCandidate[0]?.canonicalName ??
          (enrichCandidate as { model?: string })?.model ??
          "",
        possibleMatchedSlug: aliasCandidate[0]?.slug ?? enrichCandidate?.vehicleId ?? "",
        possibleBatterySource: dbCandidates[0]
          ? `vehicle-battery-db:${dbCandidates[0].id}`
          : enrichCandidate
            ? "vehicle-battery-enrichment.json"
            : "",
        reasonUnmatched: reasons.join("; "),
        riskLevel,
        needsHumanReview: riskLevel !== "low" || (r.dbRecordCount as number) > 0,
      };
    });
}

function topReviewCandidates(
  conflicts: ConflictRow[],
  matchedReview: Record<string, unknown>[],
  unmatchedReview: Record<string, unknown>[],
): Record<string, unknown>[] {
  const items: Record<string, unknown>[] = [];

  for (const c of conflicts.filter((x) => x.confidence !== "low").slice(0, 20)) {
    items.push({
      kind: "name_conflict",
      slug: c.possibleCanonicalSlug,
      label: `${c.nameA} ↔ ${c.nameB}`,
      confidence: c.confidence,
      reason: c.reason,
      needsHumanReview: c.needsHumanReview,
    });
  }

  for (const m of matchedReview.filter((r) => r.riskLevel === "high" || r.needsReview).slice(0, 20)) {
    items.push({
      kind: "matched_risk",
      slug: m.slug,
      label: m.vehicleName,
      confidence: m.riskLevel === "high" ? "high" : "medium",
      reason: m.reason,
      needsHumanReview: m.needsReview,
    });
  }

  for (const u of unmatchedReview.filter((r) => r.riskLevel === "medium" || r.needsHumanReview).slice(0, 20)) {
    items.push({
      kind: "unmatched_alias",
      slug: u.slug,
      label: u.vehicleName,
      confidence: u.riskLevel === "medium" ? "medium" : "low",
      reason: u.reasonUnmatched,
      needsHumanReview: u.needsHumanReview,
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return items
    .sort((a, b) => order[a.confidence as keyof typeof order] - order[b.confidence as keyof typeof order])
    .slice(0, 50);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const generatedAt = new Date().toISOString();
  fs.mkdirSync(REPORTS, { recursive: true });

  const adminRows = buildAdminVehicleRows();
  const adminBySlug = new Map(adminRows.map((r) => [r.slug, r]));
  const publicImages = allPublicVehicleImages();
  const aliasMaps = buildAliasMaps();

  const rows = vehicleAssets.map((asset) => buildRow(asset, adminBySlug, publicImages, aliasMaps));

  const matched = rows.filter((r) => r.batteryMatchStatus === "matched" && !r.salesExcluded);
  const unmatched = rows.filter((r) => r.batteryMatchStatus === "unmatched" && !r.salesExcluded);
  const excluded = rows.filter((r) => r.salesExcluded);
  const customerVisible = rows.filter((r) => r.customerBatteryCardVisible);
  const customerHidden = rows.filter((r) => !r.customerBatteryCardVisible && !r.salesExcluded);

  const conflicts = collectConflicts(rows);
  const matchedReview = buildMatchedReview(rows);
  const unmatchedReview = buildUnmatchedReview(rows, aliasMaps);
  const top50 = topReviewCandidates(conflicts, matchedReview, unmatchedReview);

  const dataSources = [
    { path: "src/lib/car-assets.ts", kind: "vehicle_asset_registry", keyBy: "slug", battery: "defaultBatteryCode", image: "imageFile", alias: "aliases", customer: true, admin: true },
    { path: "src/data/vehicle-battery-db.json", kind: "battery_db", keyBy: "id+displayName", battery: true, image: false, alias: "aliases", customer: "indirect", admin: false },
    { path: "src/data/vehicle-battery-enrichment.json", kind: "battery_enrichment", keyBy: "vehicleId", battery: true, image: "imagePath", alias: "aliases", customer: false, admin: false },
    { path: "src/data/vehicle-battery-user-confirmed.json", kind: "battery_user_confirmed", keyBy: "id", battery: true, image: false, alias: "aliases", customer: false, admin: false },
    { path: "src/lib/vehicle-operator-battery-tables.ts", kind: "operator_catalog", keyBy: "slug", battery: true, image: false, alias: false, customer: true, admin: true },
    { path: "src/data/vehicle-alias-db.ts", kind: "search_alias", keyBy: "slugHint", battery: false, image: false, alias: true, customer: true, admin: true },
    { path: "src/data/vehicle-generation-v04.config.ts", kind: "generation_v04", keyBy: "id", battery: "battery", image: "imageFile", alias: "searchAliases", customer: true, admin: false },
    { path: "src/data/vehicle-generation-chevrolet.config.ts", kind: "generation_chevrolet", keyBy: "id", battery: "battery", image: "imageFile", alias: "searchAliases", customer: true, admin: false },
    { path: "src/lib/search/vehicle-canonical-registry.ts", kind: "canonical_search", keyBy: "assetId", battery: false, image: false, alias: true, customer: true, admin: false },
    { path: "src/lib/search/vehicle-alias-slug-map.ts", kind: "slug_hint_map", keyBy: "slugHint→assetId", battery: false, image: false, alias: true, customer: true, admin: false },
    { path: "src/lib/platform-catalog.ts", kind: "platform_catalog", keyBy: "id", battery: "batteryCode", image: false, alias: false, customer: true, admin: false },
    { path: "src/lib/vehicleBattery.ts", kind: "runtime_resolver", keyBy: "slug", battery: true, image: false, alias: false, customer: true, admin: false },
    { path: "src/lib/admin/data/vehicles-admin.ts", kind: "admin_vehicle_rows", keyBy: "slug", battery: true, image: true, alias: false, customer: false, admin: true },
    { path: "src/lib/admin/data/matching-audit.ts", kind: "admin_matching_rows", keyBy: "slug", battery: true, image: true, alias: false, customer: false, admin: true },
    { path: "public/assets/cars-normalized/**", kind: "image_files", keyBy: "imageFileName", battery: false, image: true, alias: false, customer: true, admin: true },
    { path: "public/assets/vehicles/cars-normalized/**", kind: "image_files_v04", keyBy: "imageFileName", battery: false, image: true, alias: false, customer: true, admin: false },
  ];

  const dumpPayload = {
    generatedAt,
    summary: {
      totalVehicles: rows.length,
      matched: matched.length,
      unmatched: unmatched.length,
      salesExcluded: excluded.length,
      customerBatteryCardVisible: customerVisible.length,
      customerBatteryCardHidden: customerHidden.length,
      nameAliasConflicts: conflicts.length,
      dbRecordCount: DB_RECORDS.length,
      aliasEntryCount: vehicleAliasDbV01.length,
      enrichmentCount: ENRICHMENT.length,
      userConfirmedCount: USER_CONFIRMED.length,
      publicImageFileCount: publicImages.size,
      operatorSlugCount: Object.keys(OPERATOR_SLUG_PRIMARY_BATTERY).length,
      operatorFuelSlugCount: Object.keys(OPERATOR_FUEL_PRIMARY).length,
    },
    dataSources,
    operatorTables: {
      OPERATOR_SLUG_PRIMARY_BATTERY,
      OPERATOR_FUEL_PRIMARY,
    },
    auditCrossCheck: {
      matchedSlugs: matched.map((r) => r.slug),
      unmatchedSlugs: unmatched.map((r) => r.slug),
      salesExcludedSlugs: excluded.map((r) => r.slug),
      customerVisibleSlugs: customerVisible.map((r) => r.slug),
      customerHiddenSlugs: customerHidden.map((r) => r.slug),
    },
    top50ReviewCandidates: top50,
    rows,
  };

  fs.writeFileSync(
    path.join(REPORTS, "full-vehicle-battery-source-dump.json"),
    JSON.stringify(dumpPayload, null, 2),
    "utf8",
  );

  const csvHeaders = [
    "slug", "maker", "vehicleName", "displayName", "yearRange", "fuel", "generationName", "codeName",
    "aliases", "displayAliases", "imagePath", "imageFileName", "imageAlt",
    "tablePrimaryBattery", "tableCandidates", "operatorSlugBattery", "operatorFuelBattery",
    "defaultBatteryCode", "recommendedBattery", "primaryBatteryCode", "resolvedCustomerBattery",
    "hasCatalogBatteryMatch", "batteryMatchStatus", "vehicleStatus", "imageStatus",
    "salesExcluded", "reviewReason", "sourceFiles",
  ];

  const csvRows = rows.map((r) => ({
    ...r,
    aliases: (r.aliases as string[]).join(" | "),
    displayAliases: (r.displayAliases as string[]).join(" | "),
    tableCandidates: (r.tableCandidates as string[]).join(" | "),
    operatorFuelBattery: r.operatorFuelBattery
      ? JSON.stringify(r.operatorFuelBattery)
      : "",
    sourceFiles: (r.sourceFiles as string[]).join(" | "),
  }));

  writeCsv(path.join(REPORTS, "full-vehicle-battery-source-dump.csv"), csvHeaders, csvRows);
  writeCsv(
    path.join(REPORTS, "vehicle-name-alias-conflicts.csv"),
    ["possibleCanonicalSlug", "nameA", "nameB", "sourceA", "sourceB", "reason", "confidence", "needsHumanReview"],
    conflicts as unknown as Record<string, unknown>[],
  );
  writeCsv(
    path.join(REPORTS, "battery-match-existing-review.csv"),
    ["slug", "vehicleName", "yearRange", "fuel", "currentMatchedBattery", "matchedSource", "customerVisible", "riskLevel", "reason", "needsReview"],
    matchedReview,
  );
  writeCsv(
    path.join(REPORTS, "battery-match-unmatched-review.csv"),
    ["slug", "vehicleName", "yearRange", "fuel", "imageFileName", "aliases", "possibleMatchedName", "possibleMatchedSlug", "possibleBatterySource", "reasonUnmatched", "riskLevel", "needsHumanReview"],
    unmatchedReview,
  );

  console.log("\n=== FULL VEHICLE BATTERY SOURCE DUMP ===");
  console.log("generatedAt:", generatedAt);
  console.log("total:", rows.length);
  console.log("matched:", matched.length);
  console.log("unmatched:", unmatched.length);
  console.log("sales_excluded:", excluded.length);
  console.log("customer_card_visible:", customerVisible.length);
  console.log("customer_card_hidden:", customerHidden.length);
  console.log("name_conflicts:", conflicts.length);
  console.log("\nWrote reports/full-vehicle-battery-source-dump.json");
  console.log("Wrote reports/full-vehicle-battery-source-dump.csv");
  console.log("Wrote reports/vehicle-name-alias-conflicts.csv");
  console.log("Wrote reports/battery-match-existing-review.csv");
  console.log("Wrote reports/battery-match-unmatched-review.csv");
}

main();
