"use client";

import { BenefitsPromoCarousel } from "@/components/benefits/BenefitsPromoCarousel";
import { BENEFIT_CARDS, BENEFITS_HUB_TITLE } from "@/lib/benefits-data";

export function HomeBenefitsCarousel() {
  return (
    <BenefitsPromoCarousel
      cards={BENEFIT_CARDS}
      showHeader
      variant="main"
      ariaLabel={BENEFITS_HUB_TITLE}
      className="pb-2 sm:pb-3"
      autoPlay
    />
  );
}
