import { getBrandSpecsByBrand, getPrimaryBrandSpec } from "@/data/battery/batterySpecIndex";
import { formatDimensionsDisplay } from "@/data/battery/spec-helpers";
import type { BatteryBrand } from "@/data/battery/types";

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
  tabActive: string;
  tabIdle: string;
  accent: string;
  accentSoft: string;
  cardBg: string;
  cardRing: string;
  specCardHover: string;
  washGradient: string;
};

export const BRAND_HUB_THEMES: Record<CustomerBrandHubId, BrandHubTheme> = {
  rocket: {
    id: "rocket",
    label: "로케트",
    pageBg: "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
    panelBg: "text-white",
    bannerBg:
      "bg-gradient-to-br from-red-950 via-slate-950 to-black ring-1 ring-red-900/40",
    bannerText: "text-white",
    bannerMuted: "text-red-100/80",
    tabActive: "bg-red-600 text-white shadow-lg shadow-red-900/40 ring-2 ring-red-400/50",
    tabIdle:
      "bg-slate-800/80 text-slate-300 ring-1 ring-slate-600 hover:bg-slate-700 hover:text-white",
    accent: "text-red-400",
    accentSoft: "bg-red-500/15 ring-red-500/30",
    cardBg: "bg-slate-900/90 ring-slate-700",
    cardRing: "ring-slate-600",
    specCardHover: "hover:ring-red-500/50 hover:shadow-red-950/30",
    washGradient:
      "linear-gradient(105deg, transparent 0%, rgba(220,38,38,0.35) 45%, rgba(15,23,42,0.9) 100%)",
  },
  solite: {
    id: "solite",
    label: "쏠라이트",
    pageBg: "bg-gradient-to-b from-sky-50 via-white to-slate-50",
    panelBg: "text-slate-900",
    bannerBg:
      "bg-gradient-to-br from-white via-sky-50 to-blue-50 ring-1 ring-blue-200/80 shadow-sm",
    bannerText: "text-slate-950",
    bannerMuted: "text-blue-800/80",
    tabActive: "bg-blue-600 text-white shadow-lg shadow-blue-200/80 ring-2 ring-blue-300/60",
    tabIdle:
      "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-900 hover:ring-blue-200",
    accent: "text-blue-600",
    accentSoft: "bg-blue-50 ring-blue-100",
    cardBg: "bg-white ring-slate-200 shadow-sm",
    cardRing: "ring-slate-200",
    specCardHover: "hover:ring-blue-300 hover:shadow-blue-100/80",
    washGradient:
      "linear-gradient(105deg, transparent 0%, rgba(59,130,246,0.25) 45%, rgba(255,255,255,0.95) 100%)",
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
      "일반형, DIN, AGM까지 폭넓은 규격을 갖춘 브랜드입니다. 승용차와 SUV 교체 상담에서 자주 안내되는 라인업 중 하나입니다.",
    heroCode: "AGM80L",
  },
  solite: {
    title: "쏠라이트 배터리",
    headline: "CMF 표기 중심의 깔끔한 국산 배터리 라인업",
    description:
      "현대·기아 계열 순정 교체 흐름에서 익숙한 브랜드입니다. 일반형과 DIN 규격을 직관적으로 확인하기 좋습니다.",
    heroCode: "CMF80L",
  },
};

export type BrandHubInsightCard = {
  title: string;
  lead: string;
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
      bullets: [
        "일반형부터 AGM까지 대응",
        "승용·SUV 교체 상담에 자주 사용",
        "익숙한 대표 브랜드",
      ],
    },
    field: {
      title: "현장 코멘트",
      lead: "문의가 많은 만큼 설명이 빠른 편입니다.",
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
      bullets: [
        "CMF 표기 중심",
        "일반형·DIN 라인 구분 용이",
        "현대·기아 순정 교체 흐름에 익숙함",
      ],
    },
    field: {
      title: "현장 코멘트",
      lead: "기존 장착 제품과 비교해 안내하기 편한 편입니다.",
      bullets: [
        "순정 대체 문의에서 설명이 편함",
        "규격명 확인 흐름이 깔끔함",
        "가격대 선택지로 안내하기 좋음",
      ],
    },
  },
};

export const BRAND_HUB_FEATURED_CODES: Record<CustomerBrandHubId, string[]> = {
  rocket: ["GB80L", "GB100R", "AGM80L", "AGM95L"],
  solite: ["CMF80L", "CMF100R", "CMF57412", "CMF54459"],
};

export const BRAND_HUB_FOOTNOTE: Record<CustomerBrandHubId, string> = {
  rocket: "표기·제조 시기에 따라 수치가 달라질 수 있습니다. 주문 전 차종·라벨을 함께 확인하세요.",
  solite: "CMF·DIN 품번은 라벨과 함께 대조하는 것이 안전합니다. 상세 제원은 규격 상세에서 확인하세요.",
};

const BRAND_KEY: Record<CustomerBrandHubId, BatteryBrand> = {
  rocket: "ROCKET",
  solite: "SOLITE",
};

export type BrandHubSpecCardData = {
  code: string;
  displayCode: string;
  cca: string;
  rc: string;
  size: string;
  detailHref: string;
};

export function resolveBrandHubSpecCard(
  code: string,
  brandId: CustomerBrandHubId,
): BrandHubSpecCardData {
  const brand = BRAND_KEY[brandId];
  const spec =
    getBrandSpecsByBrand(code, brand)[0] ??
    getPrimaryBrandSpec(code);
  const displayCode = spec?.productName ?? spec?.code ?? code;
  const detailHref = `/batteries/${encodeURIComponent(displayCode)}`;
  const sizeStr = spec?.dimensionsMm
    ? (formatDimensionsDisplay(spec.dimensionsMm) ?? "—")
    : "—";

  return {
    code,
    displayCode,
    cca: spec?.cca != null ? String(spec.cca) : "—",
    rc: spec?.rc != null ? String(spec.rc) : "—",
    size: sizeStr,
    detailHref,
  };
}

export function isCustomerBrandHubId(id: string): id is CustomerBrandHubId {
  return CUSTOMER_BRAND_HUB_IDS.includes(id as CustomerBrandHubId);
}
