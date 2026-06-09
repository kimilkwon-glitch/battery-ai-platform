import "server-only";

import { vehicleAssets, type CarBrandKey } from "@/lib/car-assets";
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

export type VehicleImageAnalysisRecord = VehicleImagePixelMetrics & {
  raw?: Buffer;
  width?: number;
  height?: number;
  channels?: number;
};

/** 레지스트리 image 필드 → 표시용 normalized URL (fs/path 미사용) */
function registryPrimaryImageUrl(image: string): string {
  return image.includes("/assets/vehicles/cars-normalized/")
    ? image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
    : image;
}

function registryV04ImageUrl(image: string): string | null {
  return image.includes("/assets/vehicles/cars-normalized/") ? image : null;
}

function registryBackupImageUrl(primaryUrl: string): string | null {
  if (!primaryUrl.startsWith("/assets/cars-normalized/")) return null;
  const rel = primaryUrl.slice("/assets/cars-normalized/".length);
  return `/assets/vehicles-original-backup/cars-normalized/${rel}`;
}

function registryGeneratedImageUrl(
  brand: string,
  imageFile: string,
  modelFolder: "flux-dev" | "flux-1.1-pro" | "legacy",
): string | null {
  if (!imageFile.trim()) return null;
  if (modelFolder === "legacy") {
    return `/assets/cars-generated-review/${brand}/${imageFile}`;
  }
  return `/assets/cars-generated-review/${modelFolder}/${brand}/${imageFile}`;
}

/**
 * 레지스트리(vehicleAssets) 기반 lightweight 인벤토리.
 * public/assets fs 스캔·path.join·existsSync 없음 — Vercel 서버리스 trace 방지.
 */
export function buildVehicleImageInventory(
  analysisByPath: Map<string, VehicleImageAnalysisRecord> = new Map(),
  pairDiffBySlug: Map<string, number> = new Map(),
): {
  entries: VehicleImageInventoryEntry[];
  orphans: OrphanVehicleImageFile[];
  summary: VehicleImageInventorySummary;
  restoreBuckets: ReturnType<typeof bucketRestoreLists>;
} {
  const entries: VehicleImageInventoryEntry[] = vehicleAssets.map((asset) => {
    const imageUrl = registryPrimaryImageUrl(asset.image);
    const v04Url = registryV04ImageUrl(asset.image);
    const backupUrl = registryBackupImageUrl(imageUrl);
    const generatedFluxDevUrl =
      registryGeneratedImageUrl(asset.brand, asset.imageFile, "flux-dev") ??
      registryGeneratedImageUrl(asset.brand, asset.imageFile, "legacy");
    const generatedFlux11ProUrl = registryGeneratedImageUrl(
      asset.brand,
      asset.imageFile,
      "flux-1.1-pro",
    );

    const primaryExists = Boolean(imageUrl && asset.imageFile.trim());
    const v04Exists = Boolean(v04Url);
    const backupExists = Boolean(backupUrl);
    const generatedFluxDevExists = Boolean(generatedFluxDevUrl);
    const generatedFlux11ProExists = Boolean(generatedFlux11ProUrl);

    const current: VehicleImagePixelMetrics = {
      holeScore: 0,
      whiteBodyErosionScore: 0,
      graySmearScore: 0,
      edgeFloodRiskScore: 0,
      brightBodyRatio: 0,
    };
    const backup = null;
    const currentVsBackupDiff = pairDiffBySlug.get(asset.id) ?? null;

    const risk = assessVehicleImageRisk(
      { current, backup, currentVsBackupDiff },
      asset,
      { primaryExists, backupExists },
    );

    return {
      slug: asset.id,
      catalogId: asset.catalogId,
      displayName: asset.displayName,
      brand: asset.brand,
      modelGroup: asset.modelGroup,
      imageFile: asset.imageFile,
      imageUrl,
      backupImageUrl: backupUrl,
      primaryDiskPath: imageUrl,
      primaryExists,
      v04DiskPath: v04Url,
      v04Exists,
      backupDiskPath: backupUrl,
      backupExists,
      generatedReviewImageUrl: generatedFluxDevUrl,
      generatedReviewDiskPath: generatedFluxDevUrl,
      generatedReviewExists: generatedFluxDevExists,
      generatedFluxDevImageUrl: generatedFluxDevUrl,
      generatedFluxDevDiskPath: generatedFluxDevUrl,
      generatedFluxDevExists,
      generatedFlux11ProImageUrl: generatedFlux11ProUrl,
      generatedFlux11ProDiskPath: generatedFlux11ProUrl,
      generatedFlux11ProExists,
      gitPreNormalizeRecoverable: primaryExists,
      status: risk.legacyStatus,
      statusReason: risk.legacyReason,
      visualRiskStatus: risk.visualRiskStatus,
      visualRiskReason: risk.visualRiskReason,
      holeScore: current.holeScore,
      backupHoleScore: null,
      graySmearScore: current.graySmearScore,
      backupGraySmearScore: null,
      whiteBodyErosionScore: current.whiteBodyErosionScore,
      backupWhiteBodyErosionScore: null,
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
    orphans: [],
    restoreBuckets,
    summary: {
      generatedAt: new Date().toISOString(),
      totalDiskPngCount: vehicleAssets.length,
      registryAssetCount: vehicleAssets.length,
      linkedWithPrimaryFile: entries.filter((e) => e.primaryExists).length,
      missingPrimaryFile: entries.filter((e) => !e.primaryExists).length,
      orphanFileCount: 0,
      statusCounts,
      visualRiskCounts,
      restoreCandidateCount: entries.filter((e) => e.restoreCandidate).length,
      brightReviewCount: entries.filter((e) => e.visualRiskStatus === "BRIGHT_REVIEW").length,
      manualBrightOkCount: entries.filter((e) => e.manualBrightOkReview).length,
      pathRoots: ["/assets/cars-normalized", "/assets/vehicles/cars-normalized"],
    },
  };
}

export function vehicleImageUrlFromFile(brand: string, imageFile: string): string {
  return carDisplayImageUrl(brand as "hyundai" | "kia", imageFile);
}
