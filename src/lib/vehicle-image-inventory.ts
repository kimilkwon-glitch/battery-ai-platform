import "server-only";

import fs from "fs";
import path from "path";
import { vehicleAssets, type CarBrandKey, type VehicleAsset } from "@/lib/car-assets";
import { carDisplayImageUrl } from "@/lib/car-image-url";
import {
  assessVehicleImageRisk,
  bucketRestoreLists,
  isLightBodyVehicle,
  type VehicleImageLegacyStatus,
  type VehicleImagePixelMetrics,
  type VisualRiskStatus,
} from "@/lib/vehicle-image-analysis";

export { isLightBodyVehicle };

export type VehicleImageStatus = VehicleImageLegacyStatus;

export type VehicleImageInventoryEntry = {
  slug: string;
  catalogId?: string;
  displayName: string;
  brand: CarBrandKey;
  modelGroup: string;
  imageFile: string;
  imageUrl: string;
  backupImageUrl: string | null;
  primaryDiskPath: string | null;
  primaryExists: boolean;
  v04DiskPath: string | null;
  v04Exists: boolean;
  backupDiskPath: string | null;
  backupExists: boolean;
  /** @deprecated use generatedFluxDev* / generatedFlux11Pro* */
  generatedReviewImageUrl: string | null;
  /** @deprecated use generatedFluxDev* / generatedFlux11Pro* */
  generatedReviewDiskPath: string | null;
  /** @deprecated use generatedFluxDev* / generatedFlux11Pro* */
  generatedReviewExists: boolean;
  generatedFluxDevImageUrl: string | null;
  generatedFluxDevDiskPath: string | null;
  generatedFluxDevExists: boolean;
  generatedFlux11ProImageUrl: string | null;
  generatedFlux11ProDiskPath: string | null;
  generatedFlux11ProExists: boolean;
  gitPreNormalizeRecoverable: boolean;
  /** @deprecated legacy — visualRiskStatus 우선 */
  status: VehicleImageStatus;
  statusReason: string;
  visualRiskStatus: VisualRiskStatus;
  visualRiskReason: string;
  holeScore: number;
  backupHoleScore: number | null;
  graySmearScore: number;
  backupGraySmearScore: number | null;
  whiteBodyErosionScore: number;
  backupWhiteBodyErosionScore: number | null;
  edgeFloodRiskScore: number;
  currentVsBackupDiff: number | null;
  brightBodyRatio: number;
  lightBodyHint: boolean;
  restoreCandidate: boolean;
  restorePriority: "immediate" | "manual" | "none";
  regenerationCandidate: boolean;
  manualBrightOkReview: boolean;
  largeDiffFromBackup: boolean;
  isOrphanFile: false;
};

export type OrphanVehicleImageFile = {
  relativePath: string;
  absolutePath: string;
  brand: string;
  fileName: string;
  isOrphanFile: true;
};

export type VehicleImageInventorySummary = {
  generatedAt: string;
  totalDiskPngCount: number;
  registryAssetCount: number;
  linkedWithPrimaryFile: number;
  missingPrimaryFile: number;
  orphanFileCount: number;
  statusCounts: Record<VehicleImageStatus, number>;
  visualRiskCounts: Record<VisualRiskStatus, number>;
  restoreCandidateCount: number;
  brightReviewCount: number;
  manualBrightOkCount: number;
  pathRoots: string[];
};

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

const DISK_ROOTS = [
  { key: "cars-normalized", dir: path.join(PUBLIC, "assets", "cars-normalized") },
  {
    key: "vehicles-cars-normalized",
    dir: path.join(PUBLIC, "assets", "vehicles", "cars-normalized"),
  },
] as const;

const BACKUP_ROOT = path.join(PUBLIC, "assets", "vehicles-original-backup");
const GENERATED_REVIEW_ROOT = path.join(PUBLIC, "assets", "cars-generated-review");

function toPublicPath(abs: string | null): string | null {
  if (!abs) return null;
  const rel = path.relative(PUBLIC, abs).replace(/\\/g, "/");
  return rel ? `/${rel}` : null;
}

function resolvePrimaryDiskPath(asset: VehicleAsset): string | null {
  const url = asset.image.includes("/assets/vehicles/cars-normalized/")
    ? asset.image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
    : asset.image;
  if (!url.startsWith("/assets/cars-normalized/")) return null;
  return path.join(PUBLIC, url.replace(/^\//, "").replace(/\//g, path.sep));
}

function resolveV04DiskPath(asset: VehicleAsset): string | null {
  if (!asset.image.includes("/assets/vehicles/cars-normalized/")) return null;
  return path.join(PUBLIC, asset.image.replace(/^\//, "").replace(/\//g, path.sep));
}

function resolveBackupDiskPath(primaryDiskPath: string | null): string | null {
  if (!primaryDiskPath) return null;
  const relFromCars = path
    .relative(path.join(PUBLIC, "assets", "cars-normalized"), primaryDiskPath)
    .replace(/\\/g, "/");
  if (relFromCars.startsWith("..")) return null;
  return path.join(BACKUP_ROOT, "cars-normalized", relFromCars);
}

function resolveModelGeneratedDiskPath(
  asset: VehicleAsset,
  modelFolder: "flux-dev" | "flux-1-1-pro",
): string | null {
  if (!asset.imageFile.trim()) return null;
  return path.join(GENERATED_REVIEW_ROOT, modelFolder, asset.brand, asset.imageFile);
}

/** legacy flat path — flux-dev 서브폴더 없을 때 fallback */
function resolveLegacyGeneratedDiskPath(asset: VehicleAsset): string | null {
  if (!asset.imageFile.trim()) return null;
  return path.join(GENERATED_REVIEW_ROOT, asset.brand, asset.imageFile);
}

export function walkVehiclePngFiles(): { relativePath: string; absolutePath: string; brand: string }[] {
  const out: { relativePath: string; absolutePath: string; brand: string }[] = [];
  for (const { key, dir } of DISK_ROOTS) {
    if (!fs.existsSync(dir)) continue;
    const brands = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const brandDir of brands) {
      const brandPath = path.join(dir, brandDir.name);
      const files = fs.readdirSync(brandPath).filter((f) => f.toLowerCase().endsWith(".png"));
      for (const file of files) {
        const absolutePath = path.join(brandPath, file);
        const relativePath = `${key}/${brandDir.name}/${file}`;
        out.push({ relativePath, absolutePath, brand: brandDir.name });
      }
    }
  }
  return out;
}

export function buildRegistryImageFileSet(): Set<string> {
  const set = new Set<string>();
  for (const asset of vehicleAssets) {
    set.add(asset.imageFile.toLowerCase());
    const primary = resolvePrimaryDiskPath(asset);
    if (primary) set.add(path.basename(primary).toLowerCase());
  }
  return set;
}

export type VehicleImageAnalysisRecord = VehicleImagePixelMetrics & {
  raw?: Buffer;
  width?: number;
  height?: number;
  channels?: number;
};

export function buildVehicleImageInventory(
  analysisByPath: Map<string, VehicleImageAnalysisRecord> = new Map(),
  pairDiffBySlug: Map<string, number> = new Map(),
): {
  entries: VehicleImageInventoryEntry[];
  orphans: OrphanVehicleImageFile[];
  summary: VehicleImageInventorySummary;
  restoreBuckets: ReturnType<typeof bucketRestoreLists>;
} {
  const diskFiles = walkVehiclePngFiles();
  const registryFiles = buildRegistryImageFileSet();

  const entries: VehicleImageInventoryEntry[] = vehicleAssets.map((asset) => {
    const primaryDiskPath = resolvePrimaryDiskPath(asset);
    const v04DiskPath = resolveV04DiskPath(asset);
    const backupDiskPath = resolveBackupDiskPath(primaryDiskPath);
    const generatedFluxDevDiskPath = resolveModelGeneratedDiskPath(asset, "flux-dev");
    const generatedFlux11ProDiskPath = resolveModelGeneratedDiskPath(asset, "flux-1-1-pro");
    const legacyGeneratedDiskPath = resolveLegacyGeneratedDiskPath(asset);
    const primaryExists = primaryDiskPath ? fs.existsSync(primaryDiskPath) : false;
    const v04Exists = v04DiskPath ? fs.existsSync(v04DiskPath) : false;
    const backupExists = backupDiskPath ? fs.existsSync(backupDiskPath) : false;
    const generatedFluxDevExists =
      (generatedFluxDevDiskPath ? fs.existsSync(generatedFluxDevDiskPath) : false) ||
      (legacyGeneratedDiskPath ? fs.existsSync(legacyGeneratedDiskPath) : false);
    const generatedFlux11ProExists = generatedFlux11ProDiskPath
      ? fs.existsSync(generatedFlux11ProDiskPath)
      : false;
    const generatedFluxDevPublic =
      generatedFluxDevDiskPath && fs.existsSync(generatedFluxDevDiskPath)
        ? toPublicPath(generatedFluxDevDiskPath)
        : legacyGeneratedDiskPath && fs.existsSync(legacyGeneratedDiskPath)
          ? toPublicPath(legacyGeneratedDiskPath)
          : generatedFluxDevDiskPath
            ? toPublicPath(generatedFluxDevDiskPath)
            : null;

    const currentAnalysis = primaryDiskPath ? analysisByPath.get(primaryDiskPath) : undefined;
    const backupAnalysis = backupDiskPath ? analysisByPath.get(backupDiskPath) : undefined;

    const current: VehicleImagePixelMetrics = currentAnalysis ?? {
      holeScore: 0,
      whiteBodyErosionScore: 0,
      graySmearScore: 0,
      edgeFloodRiskScore: 0,
      brightBodyRatio: 0,
    };
    const backup = backupAnalysis ?? null;
    const currentVsBackupDiff = pairDiffBySlug.get(asset.id) ?? null;

    const risk = assessVehicleImageRisk(
      { current, backup, currentVsBackupDiff },
      asset,
      { primaryExists, backupExists },
    );

    const imageUrl = asset.image.includes("/assets/vehicles/cars-normalized/")
      ? asset.image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
      : asset.image;

    return {
      slug: asset.id,
      catalogId: asset.catalogId,
      displayName: asset.displayName,
      brand: asset.brand,
      modelGroup: asset.modelGroup,
      imageFile: asset.imageFile,
      imageUrl,
      backupImageUrl: backupDiskPath ? toPublicPath(backupDiskPath) : null,
      primaryDiskPath: primaryDiskPath ? toPublicPath(primaryDiskPath) : null,
      primaryExists,
      v04DiskPath: v04DiskPath ? toPublicPath(v04DiskPath) : null,
      v04Exists,
      backupDiskPath: backupDiskPath ? toPublicPath(backupDiskPath) : null,
      backupExists,
      generatedReviewImageUrl: generatedFluxDevPublic,
      generatedReviewDiskPath: generatedFluxDevPublic,
      generatedReviewExists: generatedFluxDevExists,
      generatedFluxDevImageUrl: generatedFluxDevPublic,
      generatedFluxDevDiskPath: generatedFluxDevPublic,
      generatedFluxDevExists,
      generatedFlux11ProImageUrl: generatedFlux11ProDiskPath
        ? toPublicPath(generatedFlux11ProDiskPath)
        : null,
      generatedFlux11ProDiskPath: generatedFlux11ProDiskPath
        ? toPublicPath(generatedFlux11ProDiskPath)
        : null,
      generatedFlux11ProExists,
      gitPreNormalizeRecoverable: Boolean(primaryDiskPath),
      status: risk.legacyStatus,
      statusReason: risk.legacyReason,
      visualRiskStatus: risk.visualRiskStatus,
      visualRiskReason: risk.visualRiskReason,
      holeScore: current.holeScore,
      backupHoleScore: backup?.holeScore ?? null,
      graySmearScore: current.graySmearScore,
      backupGraySmearScore: backup?.graySmearScore ?? null,
      whiteBodyErosionScore: current.whiteBodyErosionScore,
      backupWhiteBodyErosionScore: backup?.whiteBodyErosionScore ?? null,
      edgeFloodRiskScore: current.edgeFloodRiskScore,
      currentVsBackupDiff,
      brightBodyRatio: current.brightBodyRatio,
      lightBodyHint: risk.lightBodyHint,
      restoreCandidate: risk.restoreCandidate,
      restorePriority: risk.restorePriority,
      regenerationCandidate: risk.regenerationCandidate,
      manualBrightOkReview: risk.manualBrightOkReview,
      largeDiffFromBackup: currentVsBackupDiff != null && currentVsBackupDiff > 0.022,
      isOrphanFile: false as const,
    };
  });

  const orphans: OrphanVehicleImageFile[] = [];
  const seenOrphan = new Set<string>();
  for (const file of diskFiles) {
    if (file.relativePath.startsWith("vehicles-cars-normalized/")) continue;
    const base = path.basename(file.absolutePath).toLowerCase();
    if (registryFiles.has(base)) continue;
    if (seenOrphan.has(file.absolutePath)) continue;
    seenOrphan.add(file.absolutePath);
    orphans.push({
      relativePath: file.relativePath,
      absolutePath: file.absolutePath,
      brand: file.brand,
      fileName: path.basename(file.absolutePath),
      isOrphanFile: true,
    });
  }

  const statusCounts: Record<VehicleImageStatus, number> = {
    OK: 0,
    DISPLAY_ISSUE: 0,
    DAMAGED_FILE: 0,
    NEEDS_CHECK: 0,
    MISSING_FILE: 0,
  };
  const visualRiskCounts: Record<VisualRiskStatus, number> = {
    OK: 0,
    DAMAGED_FILE: 0,
    NEEDS_CHECK: 0,
    BRIGHT_REVIEW: 0,
    RESTORE_CANDIDATE_REVIEW: 0,
    MISSING_FILE: 0,
  };
  for (const e of entries) {
    statusCounts[e.status]++;
    visualRiskCounts[e.visualRiskStatus]++;
  }

  const restoreBuckets = bucketRestoreLists(entries);

  return {
    entries,
    orphans,
    restoreBuckets,
    summary: {
      generatedAt: new Date().toISOString(),
      totalDiskPngCount: diskFiles.length,
      registryAssetCount: vehicleAssets.length,
      linkedWithPrimaryFile: entries.filter((e) => e.primaryExists).length,
      missingPrimaryFile: entries.filter((e) => !e.primaryExists).length,
      orphanFileCount: orphans.length,
      statusCounts,
      visualRiskCounts,
      restoreCandidateCount: entries.filter((e) => e.restoreCandidate).length,
      brightReviewCount: entries.filter((e) => e.visualRiskStatus === "BRIGHT_REVIEW").length,
      manualBrightOkCount: entries.filter((e) => e.manualBrightOkReview).length,
      pathRoots: DISK_ROOTS.map((r) => r.dir.replace(ROOT, "").replace(/\\/g, "/")),
    },
  };
}

export function vehicleImageUrlFromFile(brand: string, imageFile: string): string {
  return carDisplayImageUrl(brand as "hyundai" | "kia", imageFile);
}
