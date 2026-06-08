"use client";

import { PublicBenefitsCarousel } from "@/components/benefits/PublicBenefitsCarousel";
import { BENEFITS_HUB_TITLE } from "@/lib/benefits-data";

export function HomeBenefitsCarousel() {
  return (
    <PublicBenefitsCarousel
      showHeader
      variant="main"
      filter="main"
      ariaLabel={BENEFITS_HUB_TITLE}
      className="pb-2 sm:pb-3"
      autoPlay
    />
  );
}
