import { IMAGE_FALLBACK } from "@/data/common/constants";
import type { ImageManifestItem } from "@/data/images/imageManifest.schema";
import manifestSample from "@/data/images/imageManifest.sample.json";
import manifestReal from "@/data/images/imageManifest.real.json";
import { pickDataset } from "@/data/common/dataStatus";

export type ResolvedImage = {
  src: string;
  alt: string;
  isFallback: boolean;
};

function loadManifest(): ImageManifestItem[] {
  const { items } = pickDataset(
    manifestReal as ImageManifestItem[],
    manifestSample as ImageManifestItem[],
  );
  return items;
}

function fallbackForType(type: ImageManifestItem["type"]): string {
  switch (type) {
    case "vehicle":
      return IMAGE_FALLBACK.vehicle;
    case "battery":
      return IMAGE_FALLBACK.battery;
    case "brand":
      return IMAGE_FALLBACK.brand;
    case "guide":
      return IMAGE_FALLBACK.guide;
    default:
      return IMAGE_FALLBACK.battery;
  }
}

export function resolveImage(
  type: ImageManifestItem["type"],
  targetId: string,
  alt = "",
): ResolvedImage {
  const manifest = loadManifest();
  const hit = manifest.find(
    (m) => m.type === type && (m.targetId === targetId || m.imageId === targetId),
  );

  if (hit?.path && hit.status !== "missing") {
    return { src: hit.path, alt: hit.alt || alt || targetId, isFallback: false };
  }

  const fb = hit?.fallbackPath || fallbackForType(type);
  return {
    src: fb || IMAGE_FALLBACK.legacyVehicle,
    alt: alt || targetId,
    isFallback: true,
  };
}

export function resolveImagePath(
  type: ImageManifestItem["type"],
  targetId: string,
): string {
  return resolveImage(type, targetId).src;
}
