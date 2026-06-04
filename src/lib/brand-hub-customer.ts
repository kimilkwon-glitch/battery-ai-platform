import { getBrandSpecsByBrand } from "@/data/battery/batterySpecIndex";
import { formatDimensionsDisplay } from "@/data/battery/spec-helpers";
import {
  auditBrandHubFieldGaps,
  brandHubManufacturerLine,
  brandHubPrimaryTitle,
  brandSpecPool,
  listBrandHubCatalogForTab,
  mergeBrandSpecWithBaseNorm,
  specMatchesBrandHubFamilyTab,
} from "@/lib/brand-hub-catalog";
import type { BatteryBrand, BatteryBrandSpec } from "@/data/battery/types";
import { batterySpecHref } from "@/lib/canonical-battery-code";

export const CUSTOMER_BRAND_HUB_IDS = ["rocket", "solite"] as const;

/** 배너 로고 캐시 무효화 */
export const BRAND_HUB_LOGO_REV = "20260603-ui-logo-clean-v1";
export type CustomerBrandHubId = (typeof CUSTOMER_BRAND_HUB_IDS)[number];

export type BrandHubLogoAssets = {
  /** 배너 기본(밝은 배경용) */
  src: string;
  /** 어두운 배너 배경용 */
  logoLight?: string;
  /** 밝은 배너 배경용(진한 로고) */
  logoDark?: string;
  width: number;
  height: number;
  alt: string;
  fallbackText: string;
};

export const BRAND_HUB_LOGOS: Record<CustomerBrandHubId, BrandHubLogoAssets> = {
  rocket: {
    src: "/assets/brand/rocket-logo-light.png",
    logoLight: "/assets/brand/rocket-logo-light.png",
    logoDark: "/assets/brand/rocket-logo-light.png",
    width: 574,
    height: 280,
    alt: "로케트 배터리 로고",
    fallbackText: "로케트 배터리",
  },
  solite: {
    src: "/assets/brand/solite-logo-light.png",
    logoLight: "/assets/brand/solite-logo-light.png",
    logoDark: "/assets/brand/solite-logo-light.png",
    width: 472,
    height: 196,
    alt: "쏠라이트 배터리 로고",
    fallbackText: "쏠라이트 배터리",
  },
};

/** 배너 — 원본 로고(PNG) 색상 유지, 명패 배경으로 대비 */
export function brandHubBannerLogoSrc(brandId: CustomerBrandHubId): string {
  const assets = BRAND_HUB_LOGOS[brandId];
  return `${assets.src}?v=${BRAND_HUB_LOGO_REV}`;
}

export type BrandHubTheme = {
  id: CustomerBrandHubId;
  label: string;
  /** 배너 로고 — 글래스 명패 */
  logoGlass: string;
  /** 탭 바깥 래퍼 — 밝은 컨트롤 영역 */
  tabRail: string;
  /** 브랜드 무드 패널 셸 */
  panelShell: string;
  panelBg: string;
  bannerBg: string;
  bannerText: string;
  bannerMuted: string;
  /** 패널·제품 카드 등 (밝은/어두운 영역별 가독성) */
  contentTitle: string;
  contentMuted: string;
  /** 인사이트 카드 전용 — 로고/배너 토큰과 분리 */
  insightTitle: string;
  insightBody: string;
  insightBullet: string;
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
    tabRail:
      "rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-4",
    panelShell:
      "bg-[#0B0D12] ring-1 ring-[#242A36] shadow-[0_20px_48px_-28px_rgba(0,0,0,0.55)]",
    panelBg: "text-[#CBD5E1]",
    bannerBg:
      "bg-gradient-to-br from-[#111318] via-[#151922] to-[#1a0f10] ring-1 ring-[#2d3544] shadow-[0_20px_40px_-24px_rgba(229,57,53,0.28)]",
    logoGlass:
      "brand-hub-logo-glass brand-hub-logo-glass--rocket inline-flex max-w-full shrink-0 items-center justify-center rounded-xl",
    bannerText: "!text-[#E5E7EB]",
    bannerMuted: "text-[#CBD5E1]",
    contentTitle: "text-[#E5E7EB]",
    contentMuted: "text-[#AEB8C6]",
    insightTitle: "text-[#F1F5F9]",
    insightBody: "text-[#CBD5E1]",
    insightBullet: "text-[#E5E7EB]",
    bannerImageWrap: "bg-[#151922] ring-1 ring-[#2d3544]",
    tabActive:
      "bg-[#E53935] text-white shadow-[0_10px_28px_-10px_rgba(229,57,53,0.65)] ring-2 ring-[#F87171]/40 motion-safe:hover:-translate-y-0.5",
    tabIdle:
      "bg-slate-50 text-slate-600 ring-1 ring-slate-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:text-slate-900 motion-safe:hover:shadow-[0_10px_24px_-14px_rgba(229,57,53,0.35)] motion-safe:hover:ring-red-200/80",
    accent: "text-[#F87171]",
    accentLine: "bg-[#E53935]",
    insightCard:
      "border-l-4 border-[#E53935] bg-[#171c26] ring-1 ring-[#2d3544] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.55)]",
    insightIconWrap: "bg-[#3A1F28] text-[#FCA5A5] ring-1 ring-[#7F1D1D]/60",
    productCard:
      "bg-[#171c26] ring-1 ring-[#2d3544] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.5)]",
    productImageBg: "bg-[#111318]",
    productCardHover:
      "motion-safe:hover:-translate-y-1 hover:ring-[#E53935]/60 hover:shadow-[0_16px_36px_-14px_rgba(229,57,53,0.4)]",
    badgeAgm: "bg-[#3A1F28] text-[#FCA5A5] ring-1 ring-[#7F1D1D] font-semibold",
    badgeDin: "bg-[#1E293B] text-[#93C5FD] ring-1 ring-[#334155] font-semibold",
    badgeCmf: "bg-[#2A2F38] text-[#D1D5DB] ring-1 ring-[#475569] font-semibold",
    badgeDefault: "bg-[#2A2F38] text-[#CBD5E1] ring-1 ring-[#475569] font-semibold",
    washGradient:
      "linear-gradient(100deg, transparent 0%, rgba(229,57,53,0.28) 42%, rgba(11,13,18,0.92) 100%)",
  },
  solite: {
    id: "solite",
    label: "쏠라이트",
    tabRail:
      "rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4",
    panelShell: "bg-gradient-to-b from-[#F8FAFC] via-white to-[#EFF6FF] ring-1 ring-slate-200/80",
    panelBg: "text-slate-800",
    bannerBg:
      "bg-gradient-to-br from-[#0c1220] via-[#111827] to-[#0f1a2e] ring-1 ring-[#1e3a5f]/80 shadow-[0_20px_40px_-24px_rgba(37,99,235,0.32)]",
    logoGlass:
      "brand-hub-logo-glass brand-hub-logo-glass--solite inline-flex max-w-full shrink-0 items-center justify-center rounded-xl",
    bannerText: "!text-[#E5E7EB]",
    bannerMuted: "text-[#CBD5E1]",
    contentTitle: "text-[#0F172A]",
    contentMuted: "text-[#475569]",
    insightTitle: "text-[#111827]",
    insightBody: "text-[#334155]",
    insightBullet: "text-[#1F2937]",
    bannerImageWrap: "bg-[#111827]/90 ring-1 ring-[#1e3a5f]/70",
    tabActive:
      "bg-[#2563EB] text-white shadow-[0_10px_28px_-10px_rgba(37,99,235,0.45)] ring-2 ring-[#93C5FD]/50 motion-safe:hover:-translate-y-0.5",
    tabIdle:
      "bg-slate-50 text-slate-700 ring-1 ring-slate-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:text-[#1D4ED8] motion-safe:hover:shadow-[0_10px_24px_-14px_rgba(37,99,235,0.28)] motion-safe:hover:ring-[#BFDBFE]",
    accent: "text-[#2563EB]",
    accentLine: "bg-[#3B82F6]",
    insightCard:
      "border-l-4 border-[#2563EB] bg-white ring-1 ring-slate-200/90 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.1)]",
    insightIconWrap: "bg-[#EFF6FF] text-[#2563EB] ring-1 ring-[#BFDBFE]",
    productCard:
      "bg-white ring-1 ring-slate-200/90 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.08)]",
    productImageBg: "bg-gradient-to-b from-[#F0F9FF] to-white",
    productCardHover:
      "motion-safe:hover:-translate-y-1 hover:ring-[#3B82F6]/55 hover:shadow-[0_14px_32px_-12px_rgba(37,99,235,0.22)]",
    badgeAgm: "bg-violet-50 text-violet-800 ring-1 ring-violet-200 font-semibold",
    badgeDin: "bg-sky-50 text-sky-800 ring-1 ring-sky-200 font-semibold",
    badgeCmf: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 font-semibold",
    badgeDefault: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 font-semibold",
    washGradient:
      "linear-gradient(100deg, transparent 0%, rgba(59,130,246,0.22) 40%, rgba(255,255,255,0.96) 100%)",
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
    headline: "국산 차량 교체 시장에서 가장 익숙한 대표 브랜드",
    description:
      "로케트는 일반형, DIN, AGM 계열까지 폭넓게 구성되어 있어 국산차 교체 상담에서 가장 자주 비교되는 브랜드입니다. 순정 장착 규격과 동일한 방향으로 안내하기 쉬워, 처음 배터리를 교체하는 고객도 이해하기 편한 편입니다.",
    heroCode: "AGM80L",
  },
  solite: {
    title: "쏠라이트 배터리",
    headline: "CMF 표기 중심의 깔끔한 국산 배터리 라인업",
    description:
      "쏠라이트는 현대·기아 순정 교체 흐름에서 익숙한 브랜드로, CMF 표기를 중심으로 일반형과 DIN 계열을 확인하기 좋습니다. 가격대와 규격 선택지를 함께 비교하기 쉬워 상담용 대체 브랜드로 활용하기 좋습니다.",
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
      lead: "일반형·DIN·AGM까지 폭넓은 라인업",
      body: "국산차 교체 상담에서 익숙한 브랜드로, 규격 비교와 설명 흐름이 잡히기 쉽습니다.",
      bullets: [
        "일반형·DIN·AGM까지 폭넓은 라인업",
        "국산차 교체 상담에서 익숙한 브랜드",
        "규격 비교와 설명이 쉬움",
      ],
    },
    field: {
      title: "현장 코멘트",
      lead: "차종별 순정 규격과 비교해 설명하기 편합니다.",
      body: "고객 인지도가 높아 상담 전환이 빠른 편이며, 기존 장착 제품과 나란히 비교해 안내하기 좋습니다.",
      bullets: [
        "차종별 순정 규격 비교가 쉬움",
        "고객 인지도가 높아 상담이 수월함",
        "교체 상담에서 설명 전환이 빠른 편",
      ],
    },
  },
  solite: {
    advantage: {
      title: "브랜드가 말하는 장점",
      lead: "CMF 표기 중심의 제품 체계",
      body: "현대·기아 교체 상담에서 규격명을 함께 비교하기 좋고, 가격대 선택지 설명이 수월합니다.",
      bullets: [
        "CMF 표기 중심",
        "일반형·DIN 라인 구분 용이",
        "현대·기아 교체 상담에서 설명이 편함",
      ],
    },
    field: {
      title: "현장 코멘트",
      lead: "기존 장착 제품과 비교해 안내하기 편합니다.",
      body: "가격대와 규격 선택지를 함께 설명하기 쉬워, 상담용 대체 브랜드로 활용하기 좋습니다.",
      bullets: [
        "기존 장착 제품과 비교 안내가 쉬움",
        "가격대 선택지 설명이 수월함",
        "규격 확인 흐름이 깔끔함",
      ],
    },
  },
};

/** 브랜드 안내 페이지 하단 — CCA·RC 고객용 안내 */
export const BRAND_HUB_CCA_RC_GUIDE = {
  cca: "CCA는 추운 날에도 시동을 걸어주는 힘을 뜻합니다. 숫자가 높을수록 초기 시동 성능이 여유롭습니다.",
  rc: "RC는 배터리가 전기를 버텨주는 시간에 가까운 값입니다. 숫자가 높을수록 전장품 사용 여유가 더 좋습니다.",
} as const;

/** @deprecated BRAND_HUB_CCA_RC_GUIDE 사용 */
export const BRAND_HUB_FOOTNOTE: Record<CustomerBrandHubId, string> = {
  rocket: BRAND_HUB_CCA_RC_GUIDE.cca,
  solite: BRAND_HUB_CCA_RC_GUIDE.rc,
};

const BRAND_KEY: Record<CustomerBrandHubId, BatteryBrand> = {
  rocket: "ROCKET",
  solite: "SOLITE",
};

/** 브랜드 안내 제품 분류 탭 (ROCKET/SOLITE 제원 DB family 기준) */
export const BRAND_HUB_FAMILY_TABS = [
  { id: "general", label: "일반형" },
  { id: "din", label: "DIN" },
  { id: "agm", label: "AGM" },
] as const;

export type BrandHubFamilyTabId = (typeof BRAND_HUB_FAMILY_TABS)[number]["id"];

export { specMatchesBrandHubFamilyTab, auditBrandHubFieldGaps };

export function listBrandHubProductsForTab(
  brandId: CustomerBrandHubId,
  tab: BrandHubFamilyTabId,
): BatteryBrandSpec[] {
  return listBrandHubCatalogForTab(brandId, tab);
}

export function countBrandHubProductsByTab(
  brandId: CustomerBrandHubId,
): Record<BrandHubFamilyTabId, number> {
  return {
    general: listBrandHubCatalogForTab(brandId, "general").length,
    din: listBrandHubCatalogForTab(brandId, "din").length,
    agm: listBrandHubCatalogForTab(brandId, "agm").length,
  };
}

export type BrandHubSpecCardData = {
  code: string;
  displayCode: string;
  manufacturerLine: string | null;
  familyLabel: string;
  cca: string;
  rc: string;
  size: string;
  detailHref: string;
};

export function familyLabelForSpec(spec: BatteryBrandSpec): string {
  if (spec.family === "AGM") return "AGM";
  if (spec.family === "DIN") return "DIN";
  if (spec.family === "COMMERCIAL") return "일반형";
  if (spec.family === "CMF" || spec.family === "GB") return "일반형";
  return spec.family ?? "배터리";
}

export function resolveBrandHubSpecCard(
  code: string,
  brandId: CustomerBrandHubId,
  specInput?: BatteryBrandSpec,
): BrandHubSpecCardData {
  const brand = BRAND_KEY[brandId];
  const raw =
    specInput ??
    getBrandSpecsByBrand(code, brand)[0] ??
    brandSpecPool(brandId).find((s) => s.brand === brand && s.code === code);
  const spec = raw ? mergeBrandSpecWithBaseNorm(raw) : undefined;
  const detailCode = spec?.code ?? code;
  const detailHref = batterySpecHref(detailCode);
  const sizeStr = spec?.dimensionsMm
    ? (formatDimensionsDisplay(spec.dimensionsMm) ?? "—")
    : "—";

  return {
    code: detailCode,
    displayCode: spec ? brandHubPrimaryTitle(spec) : code,
    manufacturerLine: spec ? brandHubManufacturerLine(spec, brandId) : null,
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
