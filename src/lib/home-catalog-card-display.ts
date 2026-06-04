import type { HomeCatalogProduct } from "@/lib/home-main-catalog-data";

/** 메인 라인업 카드 — 후기·차종·가격 (추후 API/DB 연동용) */
export type HomeCatalogCardDisplay = {
  rating: number;
  reviewCount: number;
  /** 짧은 문자열, 예: "아반떼 · K3 · 코나" */
  representativeVehicles: string;
  onsitePriceWon: number;
  internetPriceWon: number;
};

const BY_CODE: Partial<Record<string, HomeCatalogCardDisplay>> = {
  AGM60L: {
    rating: 4.8,
    reviewCount: 12,
    representativeVehicles: "아반떼 · K3 · 코나",
    onsitePriceWon: 119_000,
    internetPriceWon: 89_000,
  },
  AGM70L: {
    rating: 4.9,
    reviewCount: 9,
    representativeVehicles: "쏘렌토 · 스포티지 · 투싼",
    onsitePriceWon: 129_000,
    internetPriceWon: 99_000,
  },
  AGM80L: {
    rating: 4.8,
    reviewCount: 14,
    representativeVehicles: "그랜저 · K5 · G80",
    onsitePriceWon: 139_000,
    internetPriceWon: 109_000,
  },
  AGM95L: {
    rating: 4.7,
    reviewCount: 7,
    representativeVehicles: "팰리세이드 · 카니발 · G90",
    onsitePriceWon: 159_000,
    internetPriceWon: 129_000,
  },
  AGM95R: {
    rating: 4.9,
    reviewCount: 6,
    representativeVehicles: "모닝 · 레이 · 스파크",
    onsitePriceWon: 125_000,
    internetPriceWon: 95_000,
  },
  AGM105L: {
    rating: 5.0,
    reviewCount: 5,
    representativeVehicles: "G90 · 카니발 · 렉스턴",
    onsitePriceWon: 179_000,
    internetPriceWon: 149_000,
  },
  GB90R: {
    rating: 4.9,
    reviewCount: 8,
    representativeVehicles: "그랜저 · 쏘렌토 · 싼타페",
    onsitePriceWon: 139_000,
    internetPriceWon: 109_000,
  },
  GB80L: {
    rating: 4.7,
    reviewCount: 10,
    representativeVehicles: "쏘나타 · K5 · SM6",
    onsitePriceWon: 129_000,
    internetPriceWon: 99_000,
  },
  GB100R: {
    rating: 4.8,
    reviewCount: 6,
    representativeVehicles: "팰리세이드 · 렉스턴 · 카니발",
    onsitePriceWon: 149_000,
    internetPriceWon: 119_000,
  },
  DIN74L: {
    rating: 4.8,
    reviewCount: 11,
    representativeVehicles: "GV80 · G90 · K8",
    onsitePriceWon: 169_000,
    internetPriceWon: 139_000,
  },
  CMF57412: {
    rating: 4.7,
    reviewCount: 5,
    representativeVehicles: "아반떼 · K3",
    onsitePriceWon: 109_000,
    internetPriceWon: 79_000,
  },
  CMF80L: {
    rating: 4.8,
    reviewCount: 7,
    representativeVehicles: "쏘나타 · K5 · SM6",
    onsitePriceWon: 129_000,
    internetPriceWon: 99_000,
  },
  CMF90R: {
    rating: 4.6,
    reviewCount: 4,
    representativeVehicles: "모닝 · 레이",
    onsitePriceWon: 115_000,
    internetPriceWon: 85_000,
  },
};

function seedFromCode(code: string): number {
  return [...code].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function fallbackByType(product: HomeCatalogProduct): HomeCatalogCardDisplay {
  const seed = seedFromCode(product.searchCode);
  const internet = 79_000 + (seed % 50) * 1_000;
  const onsite = internet + 28_000 + (seed % 8) * 1_000;
  const vehiclesByType: Record<string, string> = {
    AGM: "아반떼 · K3 · 쏘렌토",
    DIN: "GV80 · G90 · K8",
    "일반형": "그랜저 · 쏘나타 · 스포티지",
    "EV 보조 12V": "아이오닉5 · EV6 · 코나 EV",
  };
  return {
    rating: Math.round((4.5 + (seed % 6) * 0.1) * 10) / 10,
    reviewCount: 4 + (seed % 12),
    representativeVehicles: vehiclesByType[product.typeTag] ?? "국산 승용 · SUV",
    onsitePriceWon: onsite,
    internetPriceWon: internet,
  };
}

export function getHomeCatalogCardDisplay(product: HomeCatalogProduct): HomeCatalogCardDisplay {
  return BY_CODE[product.searchCode] ?? fallbackByType(product);
}

export function formatCatalogPriceWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
