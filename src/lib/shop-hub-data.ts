import { getBatteryFitmentVehicleLabels } from "@/lib/battery-fitment-display";
import { brandSpecMatchingTable } from "./brand-hub-data";
import { compareHref, getBattery, getBrand, getVehicleName, searchHref, shopProducts, type ShopProduct } from "./platform-data";

export const BRAND_SHOP_LABEL = "BATTERY MANAGER · 배터리 쇼핑";

export const SHOP_PAGE_SIZE = 8;

export type ShopBasicFilter = "전체" | "AGM" | "DIN" | "EV" | "상용차";

export type ShopDetailFilter =
  | "L단자"
  | "R단자"
  | "60Ah대"
  | "70Ah대"
  | "80Ah대"
  | "90Ah 이상"
  | "로케트"
  | "쏠라이트"
  | "승용/SUV"
  | "상용차"
  | "EV 보조배터리";

export const shopBasicFilters: ShopBasicFilter[] = ["전체", "AGM", "DIN", "EV", "상용차"];

export const shopDetailFilters: ShopDetailFilter[] = [
  "L단자",
  "R단자",
  "60Ah대",
  "70Ah대",
  "80Ah대",
  "90Ah 이상",
  "로케트",
  "쏠라이트",
  "승용/SUV",
  "상용차",
  "EV 보조배터리",
];

export type ShopProductMeta = {
  usage: string;
  badges: { label: string; tone: "blue" | "green" | "amber" }[];
  featuredVehicles: string[];
};

const productMetaByCode: Record<string, ShopProductMeta> = {
  AGM60L: {
    usage: "소형 SUV · ISG · HEV 보조",
    badges: [
      { label: "ISG 추천", tone: "green" },
      { label: "소형 SUV", tone: "blue" },
    ],
    featuredVehicles: ["셀토스", "쏘렌토 MQ4 HEV", "투싼 NX4"],
  },
  AGM70L: {
    usage: "중형 세단 · SUV · ISG",
    badges: [
      { label: "ISG 추천", tone: "green" },
      { label: "중형 SUV", tone: "blue" },
    ],
    featuredVehicles: ["K5 DL3", "투싼 NX4", "셀토스"],
  },
  AGM80L: {
    usage: "ISG 세단 · 대형 SUV",
    badges: [
      { label: "ISG 추천", tone: "green" },
      { label: "SUV·대형 세단", tone: "blue" },
    ],
    featuredVehicles: ["그랜저 IG", "쏘렌토 MQ4", "카니발 KA4"],
  },
  AGM95L: {
    usage: "대형 SUV · 승합 · ISG",
    badges: [
      { label: "ISG 추천", tone: "green" },
      { label: "대형 SUV", tone: "blue" },
    ],
    featuredVehicles: ["쏘렌토 MQ4", "팰리세이드", "카니발 KA4"],
  },
  AGM95R: {
    usage: "R단자 대형 · ISG",
    badges: [
      { label: "R단자", tone: "amber" },
      { label: "대형 SUV", tone: "blue" },
    ],
    featuredVehicles: ["쏘렌토 MQ4", "팰리세이드"],
  },
  AGM105L: {
    usage: "대형 SUV · 승합",
    badges: [
      { label: "ISG 추천", tone: "green" },
      { label: "승합·대형", tone: "blue" },
    ],
    featuredVehicles: ["팰리세이드", "카니발 KA4", "쏘렌토 MQ4"],
  },
  DIN74L: {
    usage: "일반 세단 · DIN 교체",
    badges: [
      { label: "ISG 주의", tone: "amber" },
      { label: "일반 DIN", tone: "blue" },
    ],
    featuredVehicles: ["그랜저 IG", "K5 DL3", "쏘나타"],
  },
  DIN60L: {
    usage: "소형 일반 차량",
    badges: [{ label: "ISG 비권장", tone: "amber" }],
    featuredVehicles: ["K5 DL3", "아반떼"],
  },
  DIN80L: {
    usage: "중형 일반 세단",
    badges: [{ label: "ISG 주의", tone: "amber" }],
    featuredVehicles: ["쏘나타", "K5"],
  },
  "EV 12V": {
    usage: "EV 보조전원 · 12V",
    badges: [
      { label: "EV 전용", tone: "green" },
      { label: "보조배터리", tone: "blue" },
    ],
    featuredVehicles: ["EV6", "아이오닉5"],
  },
  "EV 12V AGM": {
    usage: "EV AGM 보조전원",
    badges: [
      { label: "EV 전용", tone: "green" },
      { label: "AGM 보조", tone: "blue" },
    ],
    featuredVehicles: ["EV6", "아이오닉5"],
  },
  CMF100R: {
    usage: "상용차 · R단자 대형",
    badges: [
      { label: "상용차", tone: "amber" },
      { label: "100R 계열", tone: "blue" },
    ],
    featuredVehicles: ["포터2 2020~", "봉고3", "팰리세이드"],
  },
  CMF90R: {
    usage: "상용차 · R단자",
    badges: [
      { label: "상용차", tone: "amber" },
      { label: "90R 계열", tone: "blue" },
    ],
    featuredVehicles: ["포터2 ~2019", "봉고3"],
  },
  CMF57412: {
    usage: "DIN H6 · 쏠라이트",
    badges: [
      { label: "DIN74L 대응", tone: "blue" },
      { label: "ISG 주의", tone: "amber" },
    ],
    featuredVehicles: ["그랜저 IG", "K5 DL3"],
  },
  CMF56219: {
    usage: "DIN H6 · 62Ah",
    badges: [
      { label: "DIN62L 표기", tone: "blue" },
      { label: "ISG 주의", tone: "amber" },
    ],
    featuredVehicles: ["K5 DL3", "쏘나타"],
  },
};

export type FeaturedSpec = {
  displayCode: string;
  productCode: string;
  brandId: string;
  usage: string;
  vehicles: string[];
  href: string;
};

export const featuredSpecs: FeaturedSpec[] = [
  {
    displayCode: "AGM60L",
    productCode: "AGM60L",
    brandId: "rocket",
    usage: "소형 SUV · ISG · HEV",
    vehicles: ["셀토스", "쏘렌토 MQ4 HEV"],
    href: searchHref("AGM60L"),
  },
  {
    displayCode: "AGM70L",
    productCode: "AGM70L",
    brandId: "rocket",
    usage: "중형 SUV · ISG",
    vehicles: ["K5 DL3", "투싼 NX4"],
    href: searchHref("AGM70L"),
  },
  {
    displayCode: "AGM80L",
    productCode: "AGM80L",
    brandId: "rocket",
    usage: "ISG 세단 · 대형 SUV",
    vehicles: ["그랜저 IG", "쏘렌토 MQ4", "카니발 KA4"],
    href: searchHref("AGM80L"),
  },
  {
    displayCode: "100R",
    productCode: "CMF100R",
    brandId: "solite",
    usage: "포터2 · 상용차 R단자",
    vehicles: ["포터2 2020~", "봉고3"],
    href: searchHref("100R"),
  },
];

export const preOrderChecklist = [
  "기존 배터리 규격 (AGM/DIN/CMF 표기)",
  "단자 방향 L / R",
  "차량 연식 · 연료 (가솔린/디젤/HEV/LPG)",
  "ISG · 스마트충전 여부",
  "AGM vs DIN 차이 (ISG 차량 다운그레이드 주의)",
] as const;

export const specNotationRows = [
  { label: "100R", detail: "GB100R / CMF100R 계열 — 포터2 2020년 이후" },
  { label: "DIN74L", detail: "GB57820 / CMF57412 계열 — 일반 DIN H6" },
  { label: "DIN62L", detail: "56219(CMF56219) 계열 — 소형 DIN H6" },
  { label: "AGM80L", detail: "로케트 AGM80L ↔ 쏠라이트 CMF80L (용도·등록 확인)" },
];

export const shopSidebarChecklist = preOrderChecklist;

export const shopPopularComparisons = [
  { label: "AGM70L vs AGM80L", href: compareHref("AGM70L", "AGM80L") },
  { label: "AGM80L vs DIN74L", href: compareHref("AGM80L", "DIN74L") },
  { label: "90R vs 100R", href: compareHref("CMF90R", "CMF100R") },
  { label: "AGM80L vs CMF80L", href: compareHref("AGM80L", "CMF80L") },
];

export const shopSidebarLinks = [
  { label: "차량으로 찾기", href: "/vehicles", desc: "차종·연료별 안내" },
  { label: "사진으로 확인", href: "/analysis/photo", desc: "단자·규격 OCR" },
  { label: "배터리 비교", href: "/compare", desc: "규격 차이 확인" },
  { label: "규격 상담", href: "/ai", desc: "문의·Q&A" },
] as const;

const COMMERCIAL_VEHICLE_IDS = new Set(["porter2-new", "porter2-old", "porter2-ev"]);
const COMMERCIAL_CODES = /100R|90R|CMF100|CMF90R|GB100|GB90/i;

function parseAh(capacity: string): number {
  const m = capacity.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

export function isCommercialProduct(p: ShopProduct): boolean {
  if (COMMERCIAL_CODES.test(p.batteryCode)) return true;
  if (p.vehicleIds.some((id) => COMMERCIAL_VEHICLE_IDS.has(id))) return true;
  if (p.type === "CMF" && p.terminal === "R" && parseAh(p.capacity) >= 90) return true;
  return false;
}

export function isPassengerProduct(p: ShopProduct): boolean {
  if (p.type === "EV") return false;
  return !isCommercialProduct(p);
}

export function getProductMeta(p: ShopProduct): ShopProductMeta {
  const fitmentVehicles = getBatteryFitmentVehicleLabels(p.batteryCode, 3);
  const custom = productMetaByCode[p.batteryCode];
  if (custom) {
    return {
      ...custom,
      featuredVehicles: fitmentVehicles.length >= 2 ? fitmentVehicles : custom.featuredVehicles,
    };
  }

  const b = getBattery(p.batteryCode, p.brandId);
  const vehicles = p.vehicleIds.slice(0, 3).map(getVehicleName);
  const badges: ShopProductMeta["badges"] = [];

  if (b.isgFit === "매우 적합" || b.isgFit === "적합") {
    badges.push({ label: "ISG 추천", tone: "green" });
  } else if (b.isgFit === "조건부") {
    badges.push({ label: "ISG 주의", tone: "amber" });
  }
  if (p.type === "EV") badges.push({ label: "EV 보조", tone: "green" });
  if (isCommercialProduct(p)) badges.push({ label: "상용차", tone: "amber" });
  if (p.terminal === "R") badges.push({ label: "R단자", tone: "amber" });

  return {
    usage: b.pros || `${p.type} ${p.capacity}`,
    badges: badges.length ? badges : [{ label: p.type, tone: "blue" }],
    featuredVehicles: vehicles.length ? vehicles : ["차량별 배터리 확인"],
  };
}

export function matchesBasicFilter(p: ShopProduct, filter: ShopBasicFilter): boolean {
  if (filter === "전체") return true;
  if (filter === "상용차") return isCommercialProduct(p);
  if (filter === "EV") return p.type === "EV";
  if (filter === "DIN") return p.type === "DIN" || p.batteryCode.startsWith("CMF57") || p.batteryCode.startsWith("CMF56");
  return p.type === filter;
}

export function matchesDetailFilter(p: ShopProduct, filter: ShopDetailFilter): boolean {
  const ah = parseAh(p.capacity);
  switch (filter) {
    case "L단자":
      return p.terminal === "L";
    case "R단자":
      return p.terminal === "R";
    case "60Ah대":
      return ah >= 55 && ah <= 65;
    case "70Ah대":
      return ah >= 66 && ah <= 75;
    case "80Ah대":
      return ah >= 76 && ah <= 85;
    case "90Ah 이상":
      return ah >= 90;
    case "로케트":
      return p.brandId === "rocket";
    case "쏠라이트":
      return p.brandId === "solite";
    case "승용/SUV":
      return isPassengerProduct(p);
    case "상용차":
      return isCommercialProduct(p);
    case "EV 보조배터리":
      return p.type === "EV";
    default:
      return true;
  }
}

export function filterShopProducts(
  products: ShopProduct[],
  basic: ShopBasicFilter,
  details: Set<ShopDetailFilter>,
): ShopProduct[] {
  return products.filter((p) => {
    if (!matchesBasicFilter(p, basic)) return false;
    for (const d of details) {
      if (!matchesDetailFilter(p, d)) return false;
    }
    return true;
  });
}

export function findShopProductByCode(code: string): ShopProduct | undefined {
  if (code === "100R") {
    return shopProducts.find((p) => p.batteryCode === "CMF100R") ?? shopProducts.find((p) => /100R/i.test(p.batteryCode));
  }
  return shopProducts.find((p) => p.batteryCode === code);
}

export function badgeToneClass(tone: "blue" | "green" | "amber"): string {
  if (tone === "green") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (tone === "amber") return "bg-amber-50 text-amber-800 ring-amber-100";
  return "bg-blue-50 text-blue-700 ring-blue-100";
}

export { brandSpecMatchingTable };
