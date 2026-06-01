import { ROCKET_SPECS } from "@/data/battery/brands/rocket-specs";
import { SOLITE_SPECS } from "@/data/battery/brands/solite-specs";
import { getBrandSpecsByBrand } from "@/data/battery/batterySpecIndex";
import { formatDimensionsDisplay } from "@/data/battery/spec-helpers";
import type { BatteryBrand, BatteryBrandSpec } from "@/data/battery/types";

export const CUSTOMER_BRAND_HUB_IDS = ["rocket", "solite"] as const;
export type CustomerBrandHubId = (typeof CUSTOMER_BRAND_HUB_IDS)[number];

export type BrandHubTheme = {
  id: CustomerBrandHubId;
  label: string;
  pageBg: string;
  panelBg: string;
  bannerBg: string;
  bannerText: string;
  bannerMuted: string;
  bannerImageWrap: string;
  tabActive: string;
  tabIdle: string;
  accent: string;
  accentLine: string;
  insightCard: string;
  insightIconWrap: string;
  productCard: string;
  productImageBg: string;
  productCardHover: string;
  badgeAgm: string;
  badgeDin: string;
  badgeCmf: string;
  badgeDefault: string;
  washGradient: string;
};

export const BRAND_HUB_THEMES: Record<CustomerBrandHubId, BrandHubTheme> = {
  rocket: {
    id: "rocket",
    label: "로케트",
    pageBg: "bg-gradient-to-b from-black via-zinc-950 to-black",
    panelBg: "text-zinc-100",
    bannerBg:
      "bg-gradient-to-br from-black via-zinc-950 to-red-950 ring-1 ring-red-600/30 shadow-[0_20px_50px_-20px_rgba(220,38,38,0.45)]",
    bannerText: "text-white",
    bannerMuted: "text-zinc-300",
    bannerImageWrap: "bg-zinc-900 ring-1 ring-red-500/25",
    tabActive: "bg-red-600 text-white shadow-lg shadow-red-900/50 ring-2 ring-red-400/40",
    tabIdle:
      "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-700 hover:bg-zinc-800 hover:text-zinc-100",
    accent: "text-red-400",
    accentLine: "bg-red-500",
    insightCard: "border-l-4 border-red-500 bg-zinc-900/95 ring-1 ring-zinc-800",
    insightIconWrap: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
    productCard: "bg-zinc-950 ring-1 ring-zinc-800",
    productImageBg: "bg-zinc-900",
    productCardHover: "hover:ring-red-500/60 hover:shadow-[0_8px_30px_-12px_rgba(220,38,38,0.35)]",
    badgeAgm: "bg-red-500/20 text-red-200 ring-red-500/40",
    badgeDin: "bg-zinc-800 text-zinc-200 ring-zinc-600",
    badgeCmf: "bg-zinc-800 text-zinc-300 ring-zinc-600",
    badgeDefault: "bg-zinc-800 text-zinc-300 ring-zinc-600",
    washGradient:
      "linear-gradient(100deg, transparent 0%, rgba(220,38,38,0.4) 40%, rgba(0,0,0,0.85) 100%)",
  },
  solite: {
    id: "solite",
    label: "쏠라이트",
    pageBg: "bg-gradient-to-b from-sky-50 via-white to-slate-50",
    panelBg: "text-slate-900",
    bannerBg:
      "bg-gradient-to-br from-white via-sky-50 to-blue-50 ring-1 ring-blue-200 shadow-md",
    bannerText: "text-slate-950",
    bannerMuted: "text-slate-600",
    bannerImageWrap: "bg-white ring-1 ring-blue-100 shadow-sm",
    tabActive: "bg-blue-600 text-white shadow-lg shadow-blue-300/50 ring-2 ring-blue-300/50",
    tabIdle:
      "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-900 hover:ring-blue-200",
    accent: "text-blue-600",
    accentLine: "bg-blue-500",
    insightCard: "border-l-4 border-blue-500 bg-white ring-1 ring-blue-100 shadow-md",
    insightIconWrap: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    productCard: "bg-white ring-1 ring-slate-200 shadow-sm",
    productImageBg: "bg-gradient-to-b from-sky-50/80 to-white",
    productCardHover: "hover:ring-blue-300 hover:shadow-lg hover:shadow-blue-100/80",
    badgeAgm: "bg-violet-50 text-violet-800 ring-violet-100",
    badgeDin: "bg-sky-50 text-sky-800 ring-sky-100",
    badgeCmf: "bg-slate-100 text-slate-700 ring-slate-200",
    badgeDefault: "bg-slate-100 text-slate-700 ring-slate-200",
    washGradient:
      "linear-gradient(100deg, transparent 0%, rgba(59,130,246,0.3) 40%, rgba(255,255,255,0.95) 100%)",
  },
};

export type BrandHubBannerCopy = {
  title: string;
  headline: string;
  description: string;
  heroCode: string;
};

export const BRAND_HUB_BANNER: Record<CustomerBrandHubId, BrandHubBannerCopy> = {
  rocket: {
    title: "로케트 배터리",
    headline: "국산차 교체 현장에서 가장 익숙한 대표 브랜드",
    description:
      "일반형, DIN, AGM까지 폭넓게 갖춘 라인업으로 승용차와 SUV 교체 상담에서 자주 안내되는 브랜드입니다.",
    heroCode: "AGM80L",
  },
  solite: {
    title: "쏠라이트 배터리",
    headline: "CMF 표기 중심의 깔끔한 국산 배터리 라인업",
    description:
      "현대·기아 계열 순정 교체 흐름에서 익숙한 브랜드이며, 일반형과 DIN 규격을 직관적으로 확인하기 좋습니다.",
    heroCode: "CMF80L",
  },
};

export type BrandHubInsightCard = {
  title: string;
  lead: string;
  body: string;
  bullets: string[];
};

export const BRAND_HUB_INSIGHTS: Record<
  CustomerBrandHubId,
  { advantage: BrandHubInsightCard; field: BrandHubInsightCard }
> = {
  rocket: {
    advantage: {
      title: "브랜드가 말하는 장점",
      lead: "검증된 시동 성능과 폭넓은 규격 구성",
      body: "일반형부터 AGM까지 폭넓게 갖춘 라인업으로 차종별 대응 폭이 넓습니다.",
      bullets: [
        "일반형부터 AGM까지 대응",
        "승용·SUV 교체 상담에 자주 사용",
        "익숙한 대표 브랜드",
      ],
    },
    field: {
      title: "현장 코멘트",
      lead: "문의가 많은 만큼 설명이 빠른 편입니다.",
      body: "고객이 브랜드를 익숙하게 알고 있는 경우가 많아 일반 교체 문의에서 안내하기 편합니다.",
      bullets: [
        "시동성 중심 문의에 적합",
        "기존 장착 제품과 비교 설명이 쉬움",
        "국산차 교체 상담에서 익숙함",
      ],
    },
  },
  solite: {
    advantage: {
      title: "브랜드가 말하는 장점",
      lead: "CMF 중심의 직관적인 제품 체계",
      body: "일반형과 DIN 계열을 깔끔하게 구분해 볼 수 있어 규격 확인이 비교적 쉽습니다.",
      bullets: [
        "CMF 표기 중심",
        "일반형·DIN 라인 구분 용이",
        "현대·기아 순정 교체 흐름에 익숙함",
      ],
    },
    field: {
      title: "현장 코멘트",
      lead: "기존 장착 제품과 비교해 안내하기 편한 편입니다.",
      body: "특히 현대·기아 계열 차량에서는 기존 라벨과 비교해 설명하기 쉬운 경우가 많습니다.",
      bullets: [
        "순정 대체 문의에서 설명이 편함",
        "규격명 확인 흐름이 깔끔함",
        "가격대 선택지 안내가 쉬움",
      ],
    },
  },
};

export const BRAND_HUB_FOOTNOTE: Record<CustomerBrandHubId, string> = {
  rocket: "표기·제조 시기에 따라 수치가 달라질 수 있습니다. 주문 전 차종·라벨을 함께 확인하세요.",
  solite: "CMF·DIN 품번은 라벨과 함께 대조하는 것이 안전합니다. 상세 제원은 규격 상세에서 확인하세요.",
};

const BRAND_KEY: Record<CustomerBrandHubId, BatteryBrand> = {
  rocket: "ROCKET",
  solite: "SOLITE",
};

const FAMILY_SORT: Record<string, number> = {
  AGM: 0,
  CMF: 1,
  GB: 2,
  DIN: 3,
  COMMERCIAL: 4,
};

function specPickScore(spec: BatteryBrandSpec, brandId: CustomerBrandHubId): number {
  let score = 0;
  if (spec.code === spec.productName) score += 20;
  if (brandId === "solite" && spec.code.startsWith("CMF")) score += 15;
  if (brandId === "rocket" && (spec.code.startsWith("GB") || spec.code.startsWith("AGM"))) score += 15;
  if (spec.code.length >= 5) score += 5;
  score += (spec.capacityAh20Hr ?? 0) / 100;
  return score;
}

function dedupeBrandSpecs(specs: BatteryBrandSpec[], brandId: CustomerBrandHubId): BatteryBrandSpec[] {
  const byNorm = new Map<string, BatteryBrandSpec>();
  for (const s of specs) {
    const prev = byNorm.get(s.normalizedCode);
    if (!prev || specPickScore(s, brandId) > specPickScore(prev, brandId)) {
      byNorm.set(s.normalizedCode, s);
    }
  }
  return [...byNorm.values()].sort((a, b) => {
    const fa = FAMILY_SORT[a.family] ?? 9;
    const fb = FAMILY_SORT[b.family] ?? 9;
    if (fa !== fb) return fa - fb;
    return (a.capacityAh20Hr ?? 0) - (b.capacityAh20Hr ?? 0) || a.code.localeCompare(b.code);
  });
}

/** 브랜드 제원 DB — 고객 노출 제품 전체 */
export function listBrandHubProducts(brandId: CustomerBrandHubId): BatteryBrandSpec[] {
  const pool = brandId === "rocket" ? ROCKET_SPECS : SOLITE_SPECS;
  const visible = pool.filter((s) => s.exposeToCustomer !== false && s.brand === BRAND_KEY[brandId]);
  return dedupeBrandSpecs(visible, brandId);
}

export type BrandHubSpecCardData = {
  code: string;
  displayCode: string;
  familyLabel: string;
  cca: string;
  rc: string;
  size: string;
  detailHref: string;
};

export function familyLabelForSpec(spec: BatteryBrandSpec): string {
  if (spec.family === "AGM") return "AGM";
  if (spec.family === "DIN") return "DIN";
  if (spec.family === "CMF") return "일반형";
  if (spec.family === "COMMERCIAL") return "상용";
  if (spec.family === "GB") return "일반형";
  return spec.family ?? "배터리";
}

export function resolveBrandHubSpecCard(
  code: string,
  brandId: CustomerBrandHubId,
  specInput?: BatteryBrandSpec,
): BrandHubSpecCardData {
  const brand = BRAND_KEY[brandId];
  const spec =
    specInput ??
    getBrandSpecsByBrand(code, brand)[0] ??
    listBrandHubProducts(brandId).find((s) => s.code === code);
  const displayCode = spec?.productName ?? code;
  const detailHref = `/batteries/${encodeURIComponent(code)}`;
  const sizeStr = spec?.dimensionsMm
    ? (formatDimensionsDisplay(spec.dimensionsMm) ?? "—")
    : "—";

  return {
    code,
    displayCode,
    familyLabel: spec ? familyLabelForSpec(spec) : "—",
    cca: spec?.cca != null ? String(spec.cca) : "—",
    rc: spec?.rc != null ? String(spec.rc) : "—",
    size: sizeStr,
    detailHref,
  };
}

export function isCustomerBrandHubId(id: string): id is CustomerBrandHubId {
  return CUSTOMER_BRAND_HUB_IDS.includes(id as CustomerBrandHubId);
}
