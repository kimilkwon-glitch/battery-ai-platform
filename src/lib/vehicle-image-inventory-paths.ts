import path from "path";
import type { VehicleAsset } from "@/lib/car-assets";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

const BACKUP_ROOT = path.join(PUBLIC, "assets", "vehicles-original-backup");
const GENERATED_REVIEW_ROOT = path.join(PUBLIC, "assets", "cars-generated-review");

export const VEHICLE_IMAGE_DISK_ROOTS = [
  { key: "cars-normalized", dir: path.join(PUBLIC, "assets", "cars-normalized") },
  {
    key: "vehicles-cars-normalized",
    dir: path.join(PUBLIC, "assets", "vehicles", "cars-normalized"),
  },
] as const;

export function toPublicAssetPath(abs: string | null): string | null {
  if (!abs) return null;
  const rel = path.relative(PUBLIC, abs).replace(/\\/g, "/");
  return rel ? `/${rel}` : null;
}

export function resolvePrimaryDiskPath(asset: VehicleAsset): string | null {
  const url = asset.image.includes("/assets/vehicles/cars-normalized/")
    ? asset.image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
    : asset.image;
  if (!url.startsWith("/assets/cars-normalized/")) return null;
  return path.join(PUBLIC, url.replace(/^\//, "").replace(/\//g, path.sep));
}

export function resolveV04DiskPath(asset: VehicleAsset): string | null {
  if (!asset.image.includes("/assets/vehicles/cars-normalized/")) return null;
  return path.join(PUBLIC, asset.image.replace(/^\//, "").replace(/\//g, path.sep));
}

export function resolveBackupDiskPath(primaryDiskPath: string | null): string | null {
  if (!primaryDiskPath) return null;
  const relFromCars = path
    .relative(path.join(PUBLIC, "assets", "cars-normalized"), primaryDiskPath)
    .replace(/\\/g, "/");
  if (relFromCars.startsWith("..")) return null;
  return path.join(BACKUP_ROOT, "cars-normalized", relFromCars);
}

export function resolveModelGeneratedDiskPath(
  asset: VehicleAsset,
  modelFolder: "flux-dev" | "flux-1.1-pro",
): string | null {
  if (!asset.imageFile.trim()) return null;
  return path.join(GENERATED_REVIEW_ROOT, modelFolder, asset.brand, asset.imageFile);
}

/** legacy flat path — flux-dev 서브폴더 없을 때 fallback */
export function resolveLegacyGeneratedDiskPath(asset: VehicleAsset): string | null {
  if (!asset.imageFile.trim()) return null;
  return path.join(GENERATED_REVIEW_ROOT, asset.brand, asset.imageFile);
}
