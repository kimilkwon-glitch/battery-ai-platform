/**
 * 차량 이미지·세대 DB — platform Vehicle.id와 연결
 * 이미지: public/assets/cars/{brandKey}/{imageFile}
 */
import {
  hyundaiGrandeurGenerations,
  hyundaiGrandeurHub,
  hyundaiModelHubs,
  type CarBrandKey,
  type CarGeneration,
  type CarModelKey,
} from "@/data/cars";
import { carImageForVehicleId } from "@/lib/car-assets";
import { carDisplayImageUrl } from "@/lib/car-image-url";

const generationById = new Map<string, CarGeneration>(
  hyundaiGrandeurGenerations.map((g) => [g.id, g]),
);

/**
 * 차량 PNG URL — 반드시 imageFile(underscore 파일명)만 사용.
 * generationId(URL slug, dash)는 여기에 넣지 않음.
 */
export function carAssetUrl(brandKey: CarBrandKey, imageFile: string): string {
  let file = imageFile.trim();

  // 실수로 slug.png 가 넘어온 경우: grandeur-ig.png → DB의 grandeur_ig.png
  if (/^grandeur-[a-z0-9-]+\.png$/i.test(file) && !file.includes("_")) {
    const slug = file.replace(/\.png$/i, "");
    const gen = getCarGeneration(slug);
    if (gen) {
      file = gen.imageFile;
    }
  }

  return carDisplayImageUrl(brandKey, file);
}

/** 세대 카드/상세 — id(slug)가 아닌 imageFile만 사용 */
export function carGenerationImageSrc(generation: CarGeneration): string {
  return carAssetUrl(generation.brandKey, generation.imageFile);
}

/** platform Vehicle.id → 세대 실차 PNG (없으면 null → 실루엣 fallback) */
export function carImageForPlatformVehicleId(platformVehicleId: string): string | null {
  const fromRegistry = carImageForVehicleId(platformVehicleId);
  if (fromRegistry) return fromRegistry;
  const gen = hyundaiGrandeurGenerations.find((g) => g.platformVehicleId === platformVehicleId);
  return gen ? carGenerationImageSrc(gen) : null;
}

export function getCarGeneration(id: string): CarGeneration | undefined {
  return generationById.get(id);
}

export function getCarGenerations(modelKey: CarModelKey, brandKey: CarBrandKey = "hyundai"): CarGeneration[] {
  if (brandKey === "hyundai" && modelKey === "grandeur") {
    return hyundaiGrandeurGenerations;
  }
  return [];
}

export function getCarGenerationIds(modelKey: CarModelKey, brandKey: CarBrandKey = "hyundai"): string[] {
  return getCarGenerations(modelKey, brandKey).map((g) => g.id);
}

export function getHyundaiModelHubs() {
  return hyundaiModelHubs;
}

export function getHyundaiGrandeurHub() {
  return hyundaiGrandeurHub;
}

/** 세대 상세 경로 */
export function carGenerationHref(generationId: string): string {
  const gen = getCarGeneration(generationId);
  if (!gen) return "/vehicles/hyundai/grandeur";
  return `/vehicles/hyundai/${gen.modelKey}/${gen.id}`;
}

export function carModelHubHref(brandKey: CarBrandKey, modelKey: CarModelKey): string {
  return `/vehicles/${brandKey}/${modelKey}`;
}

export function carBrandHref(brandKey: CarBrandKey): string {
  return `/vehicles/${brandKey}`;
}
