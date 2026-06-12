"use client";

import Link from "next/link";
import { PublicBenefitsCarousel } from "@/components/benefits/PublicBenefitsCarousel";
import { FirstOrderMemberBanner } from "@/components/benefits/FirstOrderMemberBanner";
import { BenefitCardVisual } from "@/components/benefits/BenefitCardVisual";
import { BenefitsNotices } from "@/components/benefits/BenefitsNotices";
import {
  BENEFIT_CARDS,
  FIRST_ORDER_3_BENEFIT,
  HUB_BENEFIT_FIRST_ORDER_3,
} from "@/lib/benefits-data";

export function BenefitsHubClient() {
  const coming = BENEFIT_CARDS.filter((c) => c.status === "coming_soon");
  return (
    <div className="bm-zone bm-zone--benefit space-y-8" data-page="benefits-hub">
      <FirstOrderMemberBanner />
      <PublicBenefitsCarousel showHeader={false} variant="hub" filter="benefits" autoPlay={false} showMoreLink={false} />

      {coming.length > 0 ? (
        <section>
          <h2 className="text-sm font-black text-slate-800">추가 혜택 안내</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coming.map((card) => (
              <BenefitCardVisual key={card.id} card={card} asLink={false} />
            ))}
          </div>
        </section>
      ) : null}

      <BenefitsNotices />

      <p className="text-center text-[11px] font-semibold text-slate-400">
        대표 혜택:{" "}
        <Link href={HUB_BENEFIT_FIRST_ORDER_3} className="font-black text-amber-800 hover:underline">
          {FIRST_ORDER_3_BENEFIT.title}
        </Link>
      </p>
    </div>
  );
}
