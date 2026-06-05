import type { HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import { getBatteryPrices, formatBatteryPriceWon } from "@/lib/battery-prices";
import type { HomeCatalogBrandId } from "@/lib/home-main-catalog-data";

/** 메인 라인업 카드 — 후기·차종·가격 (운영 가격표 연동) */
export type HomeCatalogCardDisplay = {
  rating: number;
  reviewCount: number;
  /** 짧은 문자열, 예: "아반떼 · K3 · 코나" */
  representativeVehicles: string;
  onsitePriceWon: number | null;
  internetPriceWon: number | null;
};

const META_BY_CODE: Partial<
  Record<string, Pick<HomeCatalogCardDisplay, "rating" | "reviewCount" | "representativeVehicles">>
> = {
  AGM60L: { rating: 4.8, reviewCount: 12, representativeVehicles: "아반떼 · K3 · 코나" },
  AGM70L: { rating: 4.9, reviewCount: 9, representativeVehicles: "쏘렌토 · 스포티지 · 투싼" },
  AGM80L: { rating: 4.8, reviewCount: 14, representativeVehicles: "그랜저 · K5 · G80" },
  AGM95L: { rating: 4.7, reviewCount: 7, representativeVehicles: "팰리세이드 · 카니발 · G90" },
  AGM95R: { rating: 4.9, reviewCount: 6, representativeVehicles: "GV80 · G80" },
  AGM105L: { rating: 5.0, reviewCount: 5, representativeVehicles: "G90 · EQ900 · K9" },
  GB90R: { rating: 4.9, reviewCount: 8, representativeVehicles: "렉스턴 · 마이티" },
  GB80L: { rating: 4.7, reviewCount: 10, representativeVehicles: "그랜저HG · LF쏘나타" },
  GB100R: { rating: 4.8, reviewCount: 6, representativeVehicles: "뉴쏘렌토 · 쏘렌토" },
  DIN74L: { rating: 4.8, reviewCount: 11, representativeVehicles: "QM6 · SM6 · 말리부" },
  CMF57412: { rating: 4.7, reviewCount: 5, representativeVehicles: "말리부 · SM5" },
  CMF80L: { rating: 4.8, reviewCount: 7, representativeVehicles: "i40 · QM5" },
  CMF90R: { rating: 4.6, reviewCount: 4, representativeVehicles: "스포티지R · 렉스턴" },
  CMF40L: { rating: 4.7, reviewCount: 3, representativeVehicles: "레이 · 모닝" },
  CMF100R: { rating: 4.8, reviewCount: 5, representativeVehicles: "봉고3 · 카니발" },
};

function seedFromCode(code: string): number {
  return [...code].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function fallbackMeta(product: HomeCatalogProduct): Pick<
  HomeCatalogCardDisplay,
  "rating" | "reviewCount" | "representativeVehicles"
> {
  const seed = seedFromCode(product.searchCode);
  const vehiclesByType: Record<string, string> = {
    AGM: "아반떼 · K3 · 쏘렌토",
    DIN: "GV80 · G90 · K8",
    일반형: "그랜저 · 쏘나타 · 스포티지",
    "EV 보조 12V": "아이오닉5 · EV6 · 코나 EV",
  };
  return {
    rating: Math.round((4.5 + (seed % 6) * 0.1) * 10) / 10,
    reviewCount: 4 + (seed % 12),
    representativeVehicles: vehiclesByType[product.typeTag] ?? "국산 승용 · SUV",
  };
}

function brandFromProduct(product: HomeCatalogProduct): HomeCatalogBrandId {
  return product.id.startsWith("solite") ? "solite" : "rocket";
}

export function getHomeCatalogCardDisplay(product: HomeCatalogProduct): HomeCatalogCardDisplay {
  const brand = brandFromProduct(product);
  const prices = getBatteryPrices(brand, product.searchCode);
  const meta = META_BY_CODE[product.searchCode] ?? fallbackMeta(product);
  return {
    ...meta,
    onsitePriceWon: prices.onsitePriceWon,
    internetPriceWon: prices.internetPriceWon,
  };
}

/** @deprecated formatBatteryPriceWon 사용 */
export function formatCatalogPriceWon(amount: number | null | undefined): string {
  return formatBatteryPriceWon(amount);
}
