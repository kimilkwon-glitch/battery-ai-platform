"use client";

import { BenefitDetailClient } from "@/components/benefits/BenefitDetailClient";
import { FIRST_ORDER_3_BENEFIT } from "@/lib/benefits-data";

export function FirstOrder3BenefitClient() {
  return <BenefitDetailClient benefit={FIRST_ORDER_3_BENEFIT} />;
}
