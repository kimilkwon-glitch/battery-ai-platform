import type { CustomerBrandHubId } from "@/lib/brand-hub-customer";

/** 브랜드 배너 로고 — 원본 색상 유지, 밝은 safe box로 대비 */
export type BrandHubLogoPanelVariant = "default";

export type BrandHubLogoPresentation = {
  panelVariant: BrandHubLogoPanelVariant;
  imageClassName: string;
  surfaceClassName: string;
};

const PRESENTATION: Record<CustomerBrandHubId, BrandHubLogoPresentation> = {
  rocket: {
    panelVariant: "default",
    imageClassName: "",
    surfaceClassName: "brand-hub-logo-image-surface--safe",
  },
  solite: {
    panelVariant: "default",
    imageClassName: "",
    surfaceClassName: "brand-hub-logo-image-surface--safe",
  },
};

export function getBrandHubLogoPresentation(brandId: CustomerBrandHubId): BrandHubLogoPresentation {
  return PRESENTATION[brandId];
}
