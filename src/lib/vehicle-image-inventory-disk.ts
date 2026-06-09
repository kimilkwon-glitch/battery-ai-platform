/**
 * 로컬 개발·audit 스크립트 전용 — public/assets PNG 전수 fs 스캔.
 * 런타임(admin page, API)에서는 import하지 않는다.
 */
import fs from "fs";
import path from "path";
import { vehicleAssets } from "@/lib/car-assets";
import {
  assessVehicleImageRisk,
  bucketRestoreLists,
  type VehicleImagePixelMetrics,
} from "@/lib/vehicle-image-analysis";
import {
  resolveBackupDiskPath,
  resolveLegacyGeneratedDiskPath,
  resolveModelGeneratedDiskPath,
  resolvePrimaryDiskPath,
  resolveV04DiskPath,
  toPublicAssetPath,
  VEHICLE_IMAGE_DISK_ROOTS,
} from "@/lib/vehicle-image-inventory-paths";
import type { VisualRiskStatus } from "@/lib/vehicle-image-analysis";
import type {
  OrphanVehicleImageFile,
  VehicleImageAnalysisRecord,
  VehicleImageInventoryEntry,
  VehicleImageInventorySummary,
  VehicleImageStatus,
} from "@/lib/vehicle-image-inventory";

const ROOT = process.cwd();

export function walkVehiclePngFiles(): { relativePath: string; absolutePath: string; brand: string }[] {
  const out: { relativePath: string; absolutePath: string; brand: string }[] = [];
  for (const { key, dir } of VEHICLE_IMAGE_DISK_ROOTS) {
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

function buildRegistryImageFileSet(): Set<string> {
  const set = new Set<string>();
  for (const asset of vehicleAssets) {
    set.add(asset.imageFile.toLowerCase());
    const primary = resolvePrimaryDiskPath(asset);
    if (primary) set.add(path.basename(primary).toLowerCase());
  }
  return set;
}

/** fs 기반 전수 스캔 — tools/audit-vehicle-image-assets.ts 전용 */
export function buildVehicleImageInventoryWithDiskScan(
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
    const generatedFlux11ProDiskPath = resolveModelGeneratedDiskPath(asset, "flux-1.1-pro");
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
        ? toPublicAssetPath(generatedFluxDevDiskPath)
        : legacyGeneratedDiskPath && fs.existsSync(legacyGeneratedDiskPath)
          ? toPublicAssetPath(legacyGeneratedDiskPath)
          : generatedFluxDevDiskPath
            ? toPublicAssetPath(generatedFluxDevDiskPath)
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
      backupImageUrl: backupDiskPath ? toPublicAssetPath(backupDiskPath) : null,
      primaryDiskPath: primaryDiskPath ? toPublicAssetPath(primaryDiskPath) : null,
      primaryExists,
      v04DiskPath: v04DiskPath ? toPublicAssetPath(v04DiskPath) : null,
      v04Exists,
      backupDiskPath: backupDiskPath ? toPublicAssetPath(backupDiskPath) : null,
      backupExists,
      generatedReviewImageUrl: generatedFluxDevPublic,
      generatedReviewDiskPath: generatedFluxDevPublic,
      generatedReviewExists: generatedFluxDevExists,
      generatedFluxDevImageUrl: generatedFluxDevPublic,
      generatedFluxDevDiskPath: generatedFluxDevPublic,
      generatedFluxDevExists,
      generatedFlux11ProImageUrl: generatedFlux11ProDiskPath
        ? toPublicAssetPath(generatedFlux11ProDiskPath)
        : null,
      generatedFlux11ProDiskPath: generatedFlux11ProDiskPath
        ? toPublicAssetPath(generatedFlux11ProDiskPath)
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
      pathRoots: VEHICLE_IMAGE_DISK_ROOTS.map((r) => r.dir.replace(ROOT, "").replace(/\\/g, "/")),
    },
  };
}
