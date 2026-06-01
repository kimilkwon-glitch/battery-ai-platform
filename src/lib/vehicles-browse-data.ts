import type { Vehicle } from "@/lib/platform-types";
import { vehicleAssets, type VehicleAsset } from "@/lib/car-assets";
import { vehicles } from "@/lib/platform-data";
import { vehicleLinkForId } from "@/lib/home-page-data";
import { getSearchHref } from "@/lib/battery-search";
import { isKgMobilityBrand } from "@/lib/search/kg-mobility-brand";

export type VehiclesBrandFilter =
  | "전체"
  | "현대"
  | "기아"
  | "제네시스"
  | "KG/쌍용"
  | "수입차"
  | "EV"
  | "상용차";

export const VEHICLES_BRAND_FILTERS: VehiclesBrandFilter[] = [
  "전체",
  "현대",
  "기아",
  "제네시스",
  "KG/쌍용",
  "수입차",
  "EV",
  "상용차",
];

/** 첫 화면 대표 차량 — DB·에셋에 있는 ID만 사용 */
export const VEHICLES_FEATURED_BY_BRAND: Record<Exclude<VehiclesBrandFilter, "전체">, string[]> = {
  현대: ["grandeur-ig", "tucson-nx4", "ioniq5-ne"],
  기아: ["carnival-ka4", "sorento-mq4", "k8-gl3", "seltos-sp2"],
  제네시스: ["g80-rg3"],
  "KG/쌍용": [],
  수입차: ["bmw-g30"],
  EV: ["ioniq5-ne", "ev6"],
  상용차: ["porter2-new", "bongo3-truck", "staria-us4"],
};

/** 전체 탭 기본 노출 순서 (최대 10) */
export const VEHICLES_SHOWCASE_IDS = [
  "grandeur-ig",
  "tucson-nx4",
  "ioniq5-ne",
  "carnival-ka4",
  "sorento-mq4",
  "k8-gl3",
  "seltos-sp2",
  "porter2-new",
  "staria-us4",
] as const;

export const REXTON_SHOWCASE_ITEM: VehiclesBrowseItem = {
  key: "rexton-sports-search",
  vehicleId: "rexton-sports-search",
  title: "KG/쌍용 렉스턴 스포츠",
  href: getSearchHref("렉스턴 스포츠 배터리"),
  brandLabel: "쌍용",
};

export type VehiclesBrowseItem = {
  key: string;
  vehicleId: string;
  title: string;
  href: string;
  brandLabel: string;
};

function assetToItem(asset: VehicleAsset): VehiclesBrowseItem {
  return {
    key: asset.id,
    vehicleId: asset.catalogId ?? asset.id,
    title: asset.displayName,
    href: vehicleLinkForId(asset.catalogId ?? asset.id),
    brandLabel:
      asset.brand === "hyundai"
        ? "현대"
        : asset.brand === "kia"
          ? "기아"
          : asset.brand === "renault"
            ? "르노코리아"
            : asset.brand === "ssangyong"
              ? "쌍용"
              : asset.brand === "kg"
                ? "KGM"
                : asset.brand,
  };
}

function catalogToItem(v: Vehicle): VehiclesBrowseItem {
  return {
    key: v.id,
    vehicleId: v.id,
    title: v.displayName,
    href: vehicleLinkForId(v.id),
    brandLabel: v.brand,
  };
}

function matchesBrandFilter(item: VehiclesBrowseItem, filter: VehiclesBrandFilter): boolean {
  if (filter === "전체") return true;
  const tags = vehicleAssets.find((a) => (a.catalogId ?? a.id) === item.vehicleId || a.id === item.vehicleId)?.tags ?? [];
  const catalog = vehicles.find((v) => v.id === item.vehicleId);
  const fuel = catalog?.fuel ?? "";
  const brand = item.brandLabel;

  if (filter === "현대") return brand === "현대" || brand === "hyundai";
  if (filter === "기아") return brand === "기아" || brand === "kia";
  if (filter === "제네시스") return /제네시스|G80|GV|G90/i.test(item.title) || item.vehicleId.includes("g80");
  if (filter === "KG/쌍용") {
    return (
      isKgMobilityBrand(brand) ||
      item.key === REXTON_SHOWCASE_ITEM.key ||
      /렉스턴|티볼리|코란도|토레스|KG|KGM|쌍용/i.test(item.title)
    );
  }
  if (filter === "수입차") return brand === "BMW" || /BMW|A6|Audi|벤츠/i.test(item.title);
  if (filter === "EV") return tags.includes("EV") || /전기|EV|아이오닉|EV6/i.test(`${item.title} ${fuel}`);
  if (filter === "상용차") {
    return tags.some((t) => ["상용차", "트럭", "밴"].includes(t)) || /포터|봉고|스타리아|상용/i.test(item.title);
  }
  return true;
}

export function getFeaturedBrowseItems(filter: VehiclesBrandFilter): VehiclesBrowseItem[] {
  if (filter === "전체") {
    return getShowcaseBrowseItems();
  }

  return (VEHICLES_FEATURED_BY_BRAND[filter] ?? [])
    .map((id) => resolveBrowseItem(id))
    .filter((x): x is VehiclesBrowseItem => Boolean(x));
}

/** 첫 화면 전용 — 렉스턴 검색 카드 포함, 최대 limit개 */
export function getShowcaseBrowseItems(limit = 10): VehiclesBrowseItem[] {
  const items: VehiclesBrowseItem[] = [];
  const seen = new Set<string>();

  for (const id of VEHICLES_SHOWCASE_IDS) {
    const item = resolveBrowseItem(id);
    if (item && !seen.has(item.key)) {
      seen.add(item.key);
      items.push(item);
    }
  }

  if (!seen.has(REXTON_SHOWCASE_ITEM.key)) {
    items.splice(Math.min(7, items.length), 0, REXTON_SHOWCASE_ITEM);
  }

  return items.slice(0, limit);
}

function resolveBrowseItem(vehicleId: string): VehiclesBrowseItem | null {
  const asset = vehicleAssets.find((a) => a.id === vehicleId || a.catalogId === vehicleId);
  if (asset) return assetToItem(asset);
  const v = vehicles.find((x) => x.id === vehicleId);
  if (v) return catalogToItem(v);
  if (vehicleId === "g80-rg3") {
    return {
      key: "g80-rg3",
      vehicleId: "g80-rg3",
      title: "G80 RG3",
      href: vehicleLinkForId("g80-rg3"),
      brandLabel: "제네시스",
    };
  }
  return null;
}

export function getAllBrowseItems(): VehiclesBrowseItem[] {
  const seen = new Set<string>();
  const items: VehiclesBrowseItem[] = [];

  for (const asset of vehicleAssets) {
    const item = assetToItem(asset);
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    items.push(item);
  }

  for (const v of vehicles) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    items.push(catalogToItem(v));
  }

  return items;
}

export function filterBrowseItems(items: VehiclesBrowseItem[], filter: VehiclesBrandFilter): VehiclesBrowseItem[] {
  return items.filter((item) => matchesBrandFilter(item, filter));
}
