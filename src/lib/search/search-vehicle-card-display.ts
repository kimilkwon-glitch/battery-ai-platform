import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";

/** 검색 카드·자동완성 — 차량 이미지 URL 정규화 (제네시스 등 경로 보정) */
export function resolveSearchCardImageSrc(src: string | null | undefined): string | null {
  const trimmed = src?.trim();
  if (!trimmed) return null;
  if (trimmed.includes("/assets/vehicles/cars-normalized/")) {
    return trimmed.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/");
  }
  return trimmed;
}

export type SearchVehicleCardLabels = {
  title: string;
  brand: string;
  yearRange: string;
  imageSrc: string | null;
};

/** 검색 결과 카드 — 차명·브랜드·연식만 (규격·상담 helper 제외) */
export function searchVehicleCardLabels(row: VehicleSearchRow): SearchVehicleCardLabels {
  const brand = (row.note ?? "").trim();
  let title = row.model.trim();
  if (brand && title.startsWith(brand)) {
    title = title.slice(brand.length).trim();
  }
  if (!title) title = row.model.trim();

  const yearRange = row.year?.trim() && row.year !== "-" ? row.year.trim() : "";

  return {
    title,
    brand,
    yearRange,
    imageSrc: resolveSearchCardImageSrc(row.imageSrc),
  };
}
