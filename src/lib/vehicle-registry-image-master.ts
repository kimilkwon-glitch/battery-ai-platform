import fs from "fs";
import path from "path";
import {
  bodyTypeFromAsset,
  vehicleAssets,
  type CarBrandKey,
  type VehicleAsset,
} from "@/lib/car-assets";
import { isLightBodyVehicle } from "@/lib/vehicle-image-analysis";
import {
  OPERATOR_FUEL_PRIMARY,
  OPERATOR_SLUG_PRIMARY_BATTERY,
} from "@/lib/vehicle-operator-battery-tables";

export type ImageReviewPriority = "P0" | "P1" | "P2" | "P3";

export type VehicleRegistryImageMasterRow = {
  index: number;
  slug: string;
  brand: CarBrandKey;
  vehicleNameKo: string;
  vehicleNameEn: string;
  generationCode: string;
  yearFrom: number | null;
  yearTo: number | null;
  representativeYear: number | null;
  bodyType: string;
  fuelTypes: string;
  batteryCodes: string;
  imageFile: string;
  currentImagePath: string | null;
  v04SourceImagePath: string | null;
  backupImagePath: string | null;
  generatedReviewPath: string | null;
  hasCurrentImage: boolean;
  hasV04SourceImage: boolean;
  hasBackupImage: boolean;
  isMissingImage: boolean;
  isOrphan: false;
  imageAuditStatus: string;
  imageReviewPriority: ImageReviewPriority;
  notes: string;
};

export type VehicleImageOrphanRow = {
  brand: string;
  imageFile: string;
  filePath: string;
  guessedSlug: string | null;
  reason: string;
};

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const BACKUP_ROOT = path.join(PUBLIC, "assets", "vehicles-original-backup");
const GENERATED_REVIEW_ROOT = path.join(PUBLIC, "assets", "cars-generated-review");

const USER_REPORTED_SLUGS = new Set([
  "tucson-jm",
  "ssangyong-tivoli-air-2016",
  "ssangyong-tivoli-armour-2017",
]);

const DISK_ROOTS = [
  { key: "cars-normalized", dir: path.join(PUBLIC, "assets", "cars-normalized") },
  { key: "vehicles-cars-normalized", dir: path.join(PUBLIC, "assets", "vehicles", "cars-normalized") },
] as const;

export type AuditEntryLike = {
  slug: string;
  visualRiskStatus?: string;
  visualRiskReason?: string;
  status?: string;
  lightBodyHint?: boolean;
  largeDiffFromBackup?: boolean;
  restoreCandidate?: boolean;
  graySmearScore?: number;
  currentVsBackupDiff?: number | null;
};

function toPublicPath(abs: string | null): string | null {
  if (!abs) return null;
  const rel = path.relative(PUBLIC, abs).replace(/\\/g, "/");
  return rel ? `/${rel}` : null;
}

function resolvePrimaryAbs(asset: VehicleAsset): string | null {
  const url = asset.image.includes("/assets/vehicles/cars-normalized/")
    ? asset.image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
    : asset.image;
  if (!url.startsWith("/assets/cars-normalized/") || !asset.imageFile.trim()) return null;
  return path.join(PUBLIC, url.replace(/^\//, "").replace(/\//g, path.sep));
}

function resolveV04PublicPath(asset: VehicleAsset): string | null {
  if (asset.image.includes("/assets/vehicles/cars-normalized/")) return asset.image;
  if (!asset.imageFile.trim()) return null;
  return `/assets/vehicles/cars-normalized/${asset.brand}/${asset.imageFile}`;
}

function resolveV04Abs(asset: VehicleAsset): string | null {
  const pub = resolveV04PublicPath(asset);
  if (!pub) return null;
  return path.join(PUBLIC, pub.replace(/^\//, "").replace(/\//g, path.sep));
}

function resolveBackupAbs(primaryAbs: string | null): string | null {
  if (!primaryAbs) return null;
  const rel = path
    .relative(path.join(PUBLIC, "assets", "cars-normalized"), primaryAbs)
    .replace(/\\/g, "/");
  if (rel.startsWith("..")) return null;
  return path.join(BACKUP_ROOT, "cars-normalized", rel);
}

function resolveGeneratedReviewPublic(asset: VehicleAsset): string | null {
  if (!asset.imageFile.trim()) return null;
  return `/assets/cars-generated-review/${asset.brand}/${asset.imageFile}`;
}

function parseYearRange(yearRange?: string): {
  yearFrom: number | null;
  yearTo: number | null;
  representativeYear: number | null;
} {
  if (!yearRange?.trim()) return { yearFrom: null, yearTo: null, representativeYear: null };
  const openEnded = /현재|present/i.test(yearRange);
  const nums = [...yearRange.matchAll(/\d{4}/g)].map((m) => Number(m[0]));
  const yearFrom = nums[0] ?? null;
  const yearTo = openEnded ? null : (nums[1] ?? nums[0] ?? null);
  let representativeYear: number | null = null;
  if (yearFrom != null && yearTo != null) representativeYear = Math.round((yearFrom + yearTo) / 2);
  else if (yearFrom != null) representativeYear = openEnded ? Math.max(yearFrom, 2023) : yearFrom;
  return { yearFrom, yearTo, representativeYear };
}

function fuelTypesForAsset(asset: VehicleAsset): string {
  const fuels = new Set<string>();
  const tags = asset.tags ?? [];
  if (tags.includes("EV")) fuels.add("전기");
  if (tags.some((t) => /하이브리드|HEV|PHEV/i.test(t))) fuels.add("하이브리드");
  if (tags.some((t) => /디젤/i.test(t))) fuels.add("디젤");
  if (tags.some((t) => /LPG/i.test(t))) fuels.add("LPG");
  if (tags.some((t) => /가솔린/i.test(t))) fuels.add("가솔린");
  const fuelMap = OPERATOR_FUEL_PRIMARY[asset.id];
  if (fuelMap) Object.keys(fuelMap).forEach((k) => fuels.add(k));
  if (fuels.size === 0) fuels.add("가솔린/디젤/LPG (연료별 상이)");
  return [...fuels].join(" | ");
}

function batteryCodesForAsset(asset: VehicleAsset): string {
  const codes = new Set<string>();
  const primary = OPERATOR_SLUG_PRIMARY_BATTERY[asset.id];
  if (primary) codes.add(primary);
  if (asset.defaultBatteryCode) codes.add(asset.defaultBatteryCode);
  const fuelMap = OPERATOR_FUEL_PRIMARY[asset.id];
  if (fuelMap) Object.values(fuelMap).forEach((c) => codes.add(c));
  return [...codes].join(" | ") || "";
}

function generationCodeForAsset(asset: VehicleAsset): string {
  if (asset.generationName?.trim()) return asset.generationName.trim();
  const suffix = asset.id.includes("-") ? asset.id.split("-").slice(1).join("-") : "";
  return suffix || asset.modelGroup;
}

function vehicleNameEnForAsset(asset: VehicleAsset): string {
  const gen = generationCodeForAsset(asset);
  const base = asset.modelGroup.replace(/-/g, " ");
  if (/^[a-z0-9\s-]+$/i.test(gen) && gen !== asset.modelGroup) {
    return `${base} ${gen}`.trim();
  }
  return base;
}

function computeImageReviewPriority(
  asset: VehicleAsset,
  audit: AuditEntryLike | undefined,
  flags: {
    isMissingImage: boolean;
    hasCurrentImage: boolean;
    lightBodyHint: boolean;
    largeDiff: boolean;
  },
): ImageReviewPriority {
  const visual = audit?.visualRiskStatus ?? (flags.isMissingImage ? "MISSING_FILE" : "UNKNOWN");

  if (flags.isMissingImage || !asset.imageFile.trim()) return "P0";
  if (USER_REPORTED_SLUGS.has(asset.id)) return "P0";
  if (visual === "DAMAGED_FILE" || visual === "MISSING_FILE") return "P0";
  if ((audit?.graySmearScore ?? 0) >= 0.28) return "P0";

  if (
    visual === "NEEDS_CHECK" ||
    visual === "BRIGHT_REVIEW" ||
    flags.lightBodyHint ||
    flags.largeDiff
  ) {
    return "P1";
  }

  if (visual === "RESTORE_CANDIDATE_REVIEW" || audit?.restoreCandidate) return "P2";

  if (flags.hasCurrentImage && visual === "OK") return "P3";

  return flags.hasCurrentImage ? "P2" : "P0";
}

function buildNotes(
  asset: VehicleAsset,
  audit: AuditEntryLike | undefined,
  flags: {
    isMissingImage: boolean;
    slugImageMismatch: boolean;
    duplicateImageFile: boolean;
  },
): string {
  const parts: string[] = [];
  if (flags.isMissingImage) parts.push("이미지 파일 누락");
  if (USER_REPORTED_SLUGS.has(asset.id)) parts.push("사용자 제보 검수 대상");
  if (flags.slugImageMismatch) parts.push("slug↔imageFile 명명 불일치 의심");
  if (flags.duplicateImageFile) parts.push("다른 slug와 imageFile 공유");
  if (audit?.visualRiskReason) parts.push(audit.visualRiskReason);
  if (asset.recommendExcluded) parts.push("레거시·추천 제외 세대");
  return parts.join("; ") || "";
}

function guessSlugFromOrphanFileName(fileName: string, brand: string): string | null {
  const base = fileName.replace(/\.png$/i, "").toLowerCase();
  const byFile = vehicleAssets.find(
    (a) => a.imageFile.toLowerCase() === fileName.toLowerCase() && a.brand === brand,
  );
  if (byFile) return byFile.id;
  const byPartial = vehicleAssets.find((a) => {
    const stem = a.imageFile.replace(/\.png$/i, "").toLowerCase();
    return a.brand === brand && (stem === base || base.includes(stem) || stem.includes(base));
  });
  return byPartial?.id ?? null;
}

function slugImageMismatchSuspect(asset: VehicleAsset): boolean {
  if (!asset.imageFile.trim()) return false;
  const stem = asset.imageFile.replace(/\.png$/i, "").toLowerCase();
  const slugNorm = asset.id.replace(/-/g, "_").toLowerCase();
  const modelNorm = asset.modelGroup.toLowerCase();
  if (stem.includes(slugNorm) || slugNorm.includes(stem.replace(/_/g, ""))) return false;
  if (stem.includes(modelNorm)) return false;
  const knownRemaps: Record<string, string> = {
    "staria-us4": "staria_lounge",
    "palisade-lx3": "palisade_lx3",
  };
  if (knownRemaps[asset.id] && stem.includes(knownRemaps[asset.id])) return false;
  return stem.split("_")[0] !== modelNorm.split("-")[0];
}

export function loadAuditBySlug(): Map<string, AuditEntryLike> {
  const map = new Map<string, AuditEntryLike>();
  const reportPath = path.join(ROOT, "reports", "vehicle-image-audit.json");
  if (!fs.existsSync(reportPath)) return map;
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as {
      entries?: AuditEntryLike[];
    };
    for (const e of report.entries ?? []) map.set(e.slug, e);
  } catch {
    /* ignore */
  }
  return map;
}

export function buildVehicleRegistryImageMasterList(auditBySlug = loadAuditBySlug()): {
  rows: VehicleRegistryImageMasterRow[];
  orphans: VehicleImageOrphanRow[];
  meta: {
    generatedAt: string;
    registryCount: number;
    source: string[];
  };
} {
  const imageFileToSlugs = new Map<string, string[]>();
  for (const a of vehicleAssets) {
    if (!a.imageFile.trim()) continue;
    const key = `${a.brand}:${a.imageFile.toLowerCase()}`;
    imageFileToSlugs.set(key, [...(imageFileToSlugs.get(key) ?? []), a.id]);
  }

  const rows: VehicleRegistryImageMasterRow[] = vehicleAssets.map((asset, idx) => {
    const primaryAbs = resolvePrimaryAbs(asset);
    const v04Abs = resolveV04Abs(asset);
    const backupAbs = resolveBackupAbs(primaryAbs);
    const generatedAbs = resolveGeneratedReviewPublic(asset)
      ? path.join(
          GENERATED_REVIEW_ROOT,
          asset.brand,
          asset.imageFile,
        )
      : null;

    const hasCurrentImage = primaryAbs ? fs.existsSync(primaryAbs) : false;
    const hasV04SourceImage = v04Abs ? fs.existsSync(v04Abs) : false;
    const hasBackupImage = backupAbs ? fs.existsSync(backupAbs) : false;
    const hasGeneratedReview = generatedAbs ? fs.existsSync(generatedAbs) : false;

    const isMissingImage = !asset.imageFile.trim() || !hasCurrentImage;
    const audit = auditBySlug.get(asset.id);
    const lightBodyHint =
      audit?.lightBodyHint ?? isLightBodyVehicle(asset, asset.imageFile);
    const largeDiff =
      audit?.largeDiffFromBackup ??
      ((audit?.currentVsBackupDiff ?? 0) > 0.022);

    const dupKey = asset.imageFile.trim()
      ? `${asset.brand}:${asset.imageFile.toLowerCase()}`
      : "";
    const duplicateImageFile = (imageFileToSlugs.get(dupKey)?.length ?? 0) > 1;
    const slugMismatch = slugImageMismatchSuspect(asset);

    const years = parseYearRange(asset.yearRange);
    if (asset.yearStart && years.yearFrom == null) years.yearFrom = asset.yearStart;

    const imageAuditStatus =
      audit?.visualRiskStatus ??
      (isMissingImage ? "MISSING_FILE" : audit?.status ?? "NOT_AUDITED");

    return {
      index: idx + 1,
      slug: asset.id,
      brand: asset.brand,
      vehicleNameKo: asset.displayName,
      vehicleNameEn: vehicleNameEnForAsset(asset),
      generationCode: generationCodeForAsset(asset),
      yearFrom: years.yearFrom,
      yearTo: years.yearTo,
      representativeYear: years.representativeYear,
      bodyType: bodyTypeFromAsset(asset),
      fuelTypes: fuelTypesForAsset(asset),
      batteryCodes: batteryCodesForAsset(asset),
      imageFile: asset.imageFile,
      currentImagePath: primaryAbs ? toPublicPath(primaryAbs) : null,
      v04SourceImagePath: resolveV04PublicPath(asset),
      backupImagePath: backupAbs ? toPublicPath(backupAbs) : null,
      generatedReviewPath: resolveGeneratedReviewPublic(asset),
      hasCurrentImage,
      hasV04SourceImage,
      hasBackupImage,
      isMissingImage,
      isOrphan: false as const,
      imageAuditStatus,
      imageReviewPriority: computeImageReviewPriority(asset, audit, {
        isMissingImage,
        hasCurrentImage,
        lightBodyHint,
        largeDiff,
      }),
      notes: buildNotes(asset, audit, {
        isMissingImage,
        slugImageMismatch: slugMismatch,
        duplicateImageFile,
      }),
    };
  });

  const registryFiles = new Set<string>();
  for (const a of vehicleAssets) {
    if (a.imageFile.trim()) registryFiles.add(a.imageFile.toLowerCase());
    const p = resolvePrimaryAbs(a);
    if (p) registryFiles.add(path.basename(p).toLowerCase());
  }

  const orphans: VehicleImageOrphanRow[] = [];
  const seen = new Set<string>();
  for (const { key, dir } of DISK_ROOTS) {
    if (!fs.existsSync(dir)) continue;
    if (key === "vehicles-cars-normalized") continue;
    for (const brandDir of fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const brandPath = path.join(dir, brandDir.name);
      for (const file of fs.readdirSync(brandPath).filter((f) => f.toLowerCase().endsWith(".png"))) {
        const abs = path.join(brandPath, file);
        if (registryFiles.has(file.toLowerCase()) || seen.has(abs)) continue;
        seen.add(abs);
        const guessed = guessSlugFromOrphanFileName(file, brandDir.name);
        orphans.push({
          brand: brandDir.name,
          imageFile: file,
          filePath: toPublicPath(abs) ?? abs,
          guessedSlug: guessed,
          reason: guessed
            ? "레지스트리 미연결 디스크 파일 — 대체 이미지 후보"
            : "레지스트리 미연결 디스크 파일",
        });
      }
    }
  }

  return {
    rows,
    orphans,
    meta: {
      generatedAt: new Date().toISOString(),
      registryCount: vehicleAssets.length,
      source: [
        "src/lib/car-assets.ts",
        "src/lib/vehicle-asset-v04.ts",
        "src/lib/vehicle-asset-genesis.ts",
        "src/lib/vehicle-asset-chevrolet.ts",
        "reports/vehicle-image-audit.json (imageAuditStatus)",
      ],
    },
  };
}

export const MASTER_LIST_CSV_COLUMNS = [
  "index",
  "slug",
  "brand",
  "vehicleNameKo",
  "vehicleNameEn",
  "generationCode",
  "yearFrom",
  "yearTo",
  "representativeYear",
  "bodyType",
  "fuelTypes",
  "batteryCodes",
  "imageFile",
  "currentImagePath",
  "v04SourceImagePath",
  "backupImagePath",
  "generatedReviewPath",
  "hasCurrentImage",
  "hasV04SourceImage",
  "hasBackupImage",
  "isMissingImage",
  "isOrphan",
  "imageAuditStatus",
  "imageReviewPriority",
  "notes",
] as const;

export function masterRowToCsvRecord(row: VehicleRegistryImageMasterRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const col of MASTER_LIST_CSV_COLUMNS) {
    const v = row[col as keyof VehicleRegistryImageMasterRow];
    out[col] = v == null ? "" : String(v);
  }
  return out;
}

export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function rowsToCsv(rows: VehicleRegistryImageMasterRow[]): string {
  const header = MASTER_LIST_CSV_COLUMNS.join(",");
  const lines = rows.map((row) =>
    MASTER_LIST_CSV_COLUMNS.map((col) => csvEscape(masterRowToCsvRecord(row)[col] ?? "")).join(","),
  );
  return [header, ...lines].join("\n");
}
