import type { CustomerBrandHubId } from "@/lib/brand-hub-customer";

/** 브랜드 배너 로고 명패 — 배경·필터 분기 */
export type BrandHubLogoPanelVariant = "default" | "darkHighContrast";

export type BrandHubLogoPresentation = {
  panelVariant: BrandHubLogoPanelVariant;
  imageClassName: string;
  surfaceClassName: string;
};

const PRESENTATION: Record<CustomerBrandHubId, BrandHubLogoPresentation> = {
  rocket: {
    panelVariant: "darkHighContrast",
    imageClassName: "brand-hub-logo-image--high-contrast",
    surfaceClassName: "brand-hub-logo-image-surface--dark-panel",
  },
  solite: {
    panelVariant: "default",
    imageClassName: "",
    surfaceClassName: "",
  },
};

export function getBrandHubLogoPresentation(brandId: CustomerBrandHubId): BrandHubLogoPresentation {
  return PRESENTATION[brandId];
}
