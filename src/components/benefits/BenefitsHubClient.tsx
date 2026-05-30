"use client";

import Link from "next/link";
import { BenefitCardVisual } from "@/components/benefits/BenefitCardVisual";
import { CouponIssuerPanel } from "@/components/benefits/CouponIssuerPanel";
import {
  BENEFIT_CARDS,
  FIRST_ORDER_3_BENEFIT,
  HUB_BENEFIT_FIRST_ORDER_3,
} from "@/lib/benefits-data";
import { bm } from "@/lib/design-tokens";

export function BenefitsHubClient() {
  const active = BENEFIT_CARDS.filter((c) => c.status === "active");
  const coming = BENEFIT_CARDS.filter((c) => c.status === "coming_soon");

  return (
    <div className="bm-zone bm-zone--benefit space-y-8" data-page="benefits-hub">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((card) => (
          <div key={card.id} className="space-y-4">
            <BenefitCardVisual card={card} asLink />
            {card.couponBenefitId ? (
              <CouponIssuerPanel
                benefitId={card.couponBenefitId}
                benefitName={card.title}
                compact
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link href={card.href} className={bm.btnPrimary}>
                혜택 자세히 보기
              </Link>
            </div>
          </div>
        ))}
      </div>

      {coming.length > 0 ? (
        <section>
          <h2 className="text-sm font-black text-slate-800">추가 혜택 안내</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {coming.map((card) => (
              <BenefitCardVisual key={card.id} card={card} asLink={false} />
            ))}
          </div>
        </section>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">유의사항</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-xs font-medium leading-relaxed text-slate-600">
          <li>혜택 조건·적용 여부는 상품·차량·운영 정책에 따라 달라질 수 있습니다.</li>
          <li>쿠폰은 자동 결제 할인이 아니며, 주문·택배 상담 시 확인 후 안내됩니다.</li>
          <li>발급 쿠폰은 이 브라우저에만 저장되며, 운영용 중복 방지는 DB 연동 후 가능합니다.</li>
          <li>일부 혜택은 조건 확인 후 상담 시 안내됩니다.</li>
        </ul>
      </section>

      <p className="text-center text-[11px] font-semibold text-slate-400">
        대표 혜택:{" "}
        <Link href={HUB_BENEFIT_FIRST_ORDER_3} className="font-black text-amber-800 hover:underline">
          {FIRST_ORDER_3_BENEFIT.title}
        </Link>
      </p>
    </div>
  );
}
