/** 차량 PNG 경로 — 정규화 우선, 원본 fallback (CarGenerationImage onError) */

export type CarImageBrandKey = "hyundai" | "kia";

export function carOriginalImageUrl(brand: CarImageBrandKey, imageFile: string): string {
  return `/assets/cars/${brand}/${imageFile}`;
}

export function carNormalizedImageUrl(brand: CarImageBrandKey, imageFile: string): string {
  return `/assets/cars-normalized/${brand}/${imageFile}`;
}

/** UI 표시용 — 정규화 PNG 우선 */
export function carDisplayImageUrl(brand: CarImageBrandKey, imageFile: string): string {
  const file = imageFile.trim();
  if (!file) return "";
  return carNormalizedImageUrl(brand, file);
}

export function carDisplayImageFallback(brand: CarImageBrandKey, imageFile: string): string {
  const file = imageFile.trim();
  if (!file) return "";
  return carOriginalImageUrl(brand, file);
}

/** 정규화 URL → 원본 URL (클라이언트 fallback) */
export function carOriginalFromDisplayUrl(displayUrl: string): string | null {
  if (displayUrl.includes("/assets/vehicles/cars-normalized/")) {
    return displayUrl.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/");
  }
  if (displayUrl.includes("/assets/cars-normalized/")) {
    return displayUrl.replace("/assets/cars-normalized/", "/assets/cars/");
  }
  return null;
}

export function isCommercialCarImageFile(imageFile: string): boolean {
  return /porter|bongo/i.test(imageFile);
}
