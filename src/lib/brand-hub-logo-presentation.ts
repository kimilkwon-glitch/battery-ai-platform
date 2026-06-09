import type { CustomerBrandHubId } from "@/lib/brand-hub-customer";

/** 브랜드 배너 로고 — 원본 색상 유지, 밝은 safe box로 대비 */
export type BrandHubLogoPanelVariant = "stacked";

export type BrandHubLogoPresentation = {
  panelVariant: BrandHubLogoPanelVariant;
  imageClassName: string;
  surfaceClassName: string;
};

const STACKED_PRESENTATION: BrandHubLogoPresentation = {
  panelVariant: "stacked",
  imageClassName: "brand-hub-logo-image--stacked",
  surfaceClassName: "brand-hub-logo-image-surface--safe brand-hub-logo-image-surface--stacked",
};

const PRESENTATION: Record<CustomerBrandHubId, BrandHubLogoPresentation> = {
  rocket: STACKED_PRESENTATION,
  solite: STACKED_PRESENTATION,
};

export function getBrandHubLogoPresentation(brandId: CustomerBrandHubId): BrandHubLogoPresentation {
  return PRESENTATION[brandId];
}
