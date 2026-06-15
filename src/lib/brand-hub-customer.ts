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
export const BRAND_HUB_LOGO_REV = "20260615-display-trim-v1";
export type CustomerBrandHubId = (typeof CUSTOMER_BRAND_HUB_IDS)[number];

export type BrandHubLogoLayout = "stacked";

export type BrandHubLogoAssets = {
  src: string;
  width: number;
  height: number;
  alt: string;
  fallbackText: string;
  layout: BrandHubLogoLayout;
};

export const BRAND_HUB_LOGOS: Record<CustomerBrandHubId, BrandHubLogoAssets> = {
  rocket: {
    src: "/assets/brand/sebang-logo-stacked-display.png",
    width: 190,
    height: 74,
    alt: "세방전지 로고",
    fallbackText: "세방전지",
    layout: "stacked",
  },
  solite: {
    src: "/assets/brand/solite-high-performance-logo-stacked-display.png",
    width: 159,
    height: 93,
    alt: "하이성능쏠라이트 로고",
    fallbackText: "하이성능쏠라이트",
    layout: "stacked",
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
      "rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_4px_16px_-12px_rgba(36,48,64,0.12)] sm:p-4",
    panelShell:
      "bg-white ring-1 ring-slate-200/80 shadow-[0_8px_24px_-16px_rgba(36,48,64,0.08)]",
    panelBg: "text-[var(--bm-text)]",
    bannerBg: "brand-detail-hero brand-detail-hero--rocket",
    logoGlass:
      "brand-logo-plaque brand-logo-plaque--rocket inline-flex max-w-full shrink-0 items-center justify-center",
    bannerText: "text-[var(--bm-text)]",
    bannerMuted: "text-[var(--bm-text-sub)]",
    contentTitle: "text-[var(--bm-text)]",
    contentMuted: "text-[var(--bm-text-sub)]",
    insightTitle: "text-[var(--bm-text)]",
    insightBody: "text-[var(--bm-text-sub)]",
    insightBullet: "text-[var(--bm-text)]",
    bannerImageWrap: "brand-product-stage brand-product-stage--rocket",
    tabActive:
      "bg-[var(--brand-rocket-primary)] text-white shadow-sm ring-1 ring-[var(--brand-rocket-border)] motion-safe:hover:-translate-y-0.5",
    tabIdle:
      "bg-white text-slate-600 ring-1 ring-slate-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[var(--brand-rocket-soft)] motion-safe:hover:text-[var(--brand-rocket-primary)] motion-safe:hover:ring-[var(--brand-rocket-border)]",
    accent: "text-[var(--brand-rocket-primary)]",
    accentLine: "bg-[var(--brand-rocket-primary)]",
    insightCard:
      "brand-strength-card bg-white ring-1 ring-[var(--brand-rocket-border)] border-l-[3px] border-l-[var(--brand-rocket-primary)] shadow-[0_4px_14px_-10px_rgba(36,48,64,0.08)]",
    insightIconWrap:
      "bg-[var(--brand-rocket-soft)] text-[var(--brand-rocket-primary)] ring-1 ring-[var(--brand-rocket-border)]",
    productCard:
      "bg-white ring-1 ring-slate-200/90 shadow-[0_4px_16px_-12px_rgba(36,48,64,0.08)]",
    productImageBg: "bg-gradient-to-b from-[var(--brand-rocket-soft)] to-white",
    productCardHover:
      "motion-safe:hover:-translate-y-0.5 hover:ring-[var(--brand-rocket-border)] hover:shadow-[0_8px_20px_-12px_rgba(36,48,64,0.12)]",
    badgeAgm: "bg-[var(--brand-rocket-soft)] text-[var(--brand-rocket-muted)] ring-1 ring-[var(--brand-rocket-border)] font-semibold",
    badgeDin: "bg-slate-50 text-slate-700 ring-1 ring-slate-200 font-semibold",
    badgeCmf: "bg-slate-50 text-slate-700 ring-1 ring-slate-200 font-semibold",
    badgeDefault: "bg-slate-50 text-slate-700 ring-1 ring-slate-200 font-semibold",
    washGradient: "transparent",
  },
  solite: {
    id: "solite",
    label: "쏠라이트",
    tabRail:
      "rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4",
    panelShell: "bg-white ring-1 ring-slate-200/80 shadow-[0_8px_24px_-16px_rgba(36,48,64,0.08)]",
    panelBg: "text-[var(--bm-text)]",
    bannerBg: "brand-detail-hero brand-detail-hero--solite",
    logoGlass:
      "brand-logo-plaque brand-logo-plaque--solite inline-flex max-w-full shrink-0 items-center justify-center",
    bannerText: "text-[var(--bm-text)]",
    bannerMuted: "text-[var(--bm-text-sub)]",
    contentTitle: "text-[var(--bm-text)]",
    contentMuted: "text-[var(--bm-text-sub)]",
    insightTitle: "text-[var(--bm-text)]",
    insightBody: "text-[var(--bm-text-sub)]",
    insightBullet: "text-[var(--bm-text)]",
    bannerImageWrap: "brand-product-stage brand-product-stage--solite",
    tabActive:
      "bg-[var(--brand-solite-primary)] text-white shadow-sm ring-1 ring-[var(--brand-solite-border)] motion-safe:hover:-translate-y-0.5",
    tabIdle:
      "bg-white text-slate-600 ring-1 ring-slate-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[var(--brand-solite-soft)] motion-safe:hover:text-[var(--brand-solite-primary)] motion-safe:hover:ring-[var(--brand-solite-border)]",
    accent: "text-[var(--brand-solite-primary)]",
    accentLine: "bg-[var(--brand-solite-primary)]",
    insightCard:
      "brand-strength-card bg-white ring-1 ring-[var(--brand-solite-border)] border-l-[3px] border-l-[var(--brand-solite-primary)] shadow-[0_4px_14px_-10px_rgba(36,48,64,0.08)]",
    insightIconWrap:
      "bg-[var(--brand-solite-soft)] text-[var(--brand-solite-primary)] ring-1 ring-[var(--brand-solite-border)]",
    productCard:
      "bg-white ring-1 ring-slate-200/90 shadow-[0_4px_16px_-12px_rgba(36,48,64,0.08)]",
    productImageBg: "bg-gradient-to-b from-[var(--brand-solite-soft)] to-white",
    productCardHover:
      "motion-safe:hover:-translate-y-0.5 hover:ring-[var(--brand-solite-border)] hover:shadow-[0_8px_20px_-12px_rgba(36,48,64,0.12)]",
    badgeAgm: "bg-violet-50 text-violet-800 ring-1 ring-violet-200 font-semibold",
    badgeDin: "bg-sky-50 text-sky-800 ring-1 ring-sky-200 font-semibold",
    badgeCmf: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 font-semibold",
    badgeDefault: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 font-semibold",
    washGradient: "transparent",
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
      "일반형·DIN·AGM까지 폭넓게 구성되어 있어, 순정 규격과 맞춰 비교하기 좋습니다. 처음 교체하시는 분도 이해하기 쉬운 편이에요.",
    heroCode: "AGM80L",
  },
  solite: {
    title: "쏠라이트 배터리",
    headline: "CMF 규격 중심, 비교하기 쉬운 국산 배터리",
    description:
      "현대·기아 순정 교체 흐름에서 익숙한 브랜드예요. CMF 표기를 중심으로 일반형·DIN을 함께 확인하고 가격대별로 비교하기 좋습니다.",
    heroCode: "CMF80L",
  },
};

export type BrandHubAdvantageIconKey =
  | "trophy"
  | "building2"
  | "battery"
  | "star"
  | "car-front"
  | "battery-charging";

export type BrandHubAdvantageItem = {
  icon: BrandHubAdvantageIconKey;
  text: string;
};

export type BrandHubAdvantageSection = {
  title: string;
  items: BrandHubAdvantageItem[];
};

export type BrandHubFieldSection = {
  title: string;
  body: string;
};

export const BRAND_HUB_INSIGHTS: Record<
  CustomerBrandHubId,
  { advantage: BrandHubAdvantageSection; field: BrandHubFieldSection }
> = {
  rocket: {
    advantage: {
      title: "브랜드가 말하는 장점",
      items: [
        {
          icon: "trophy",
          text: "K-BPI 자동차 배터리 부문 16년 연속 1위 이력",
        },
        {
          icon: "building2",
          text: "국내 납축전지 대표 기업 세방전지의 자동차 배터리 브랜드",
        },
        {
          icon: "battery",
          text: "오랜 기간 승용·상용·산업용까지 이어온 배터리 제조 기반",
        },
      ],
    },
    field: {
      title: "현장 코멘트",
      body: "로케트는 국산차 배터리 교체 현장에서 오래 쓰여온 브랜드라 고객님들이 낯설어하지 않는 편입니다. 기존 장착 배터리와 같은 용량으로 맞추거나 가격대별로 비교하기 좋습니다.",
    },
  },
  solite: {
    advantage: {
      title: "브랜드가 말하는 장점",
      items: [
        {
          icon: "star",
          text: "현대·기아 품질 평가 '품질 5스타' 이력",
        },
        {
          icon: "car-front",
          text: "완성차 순정 납품 기반의 자동차 배터리 브랜드",
        },
        {
          icon: "battery-charging",
          text: "AGM·EFB 등 스탑앤고 차량용 라인업 보유",
        },
      ],
    },
    field: {
      title: "현장 코멘트",
      body: "쏠라이트는 현대·기아 차량 고객님들이 익숙하게 받아들이는 브랜드입니다. 순정 납품 이력과 품질 평가 근거가 있어 국산차 교체 상담에서 무난하게 권하기 좋습니다.",
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
