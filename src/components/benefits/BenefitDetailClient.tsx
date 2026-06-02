"use client";

import Link from "next/link";
import { BenefitCardMedia } from "@/components/home/BenefitCardMedia";
import { BenefitsNotices } from "@/components/benefits/BenefitsNotices";
import { CouponIssuerPanel } from "@/components/benefits/CouponIssuerPanel";
import { FirstOrder3AutoApplyPanel } from "@/components/benefits/FirstOrder3AutoApplyPanel";
import {
  type BenefitCardConfig,
  HUB_BENEFITS,
} from "@/lib/benefits-data";
import { HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export function BenefitDetailClient({ benefit }: { benefit: BenefitCardConfig }) {
  const ctaLinks =
    benefit.id === "first-order-3"
      ? [
          { href: HUB_SHOP_ANCHORS.orderCheck, label: "택배주문 안내" },
          { href: HUB_BENEFITS, label: "혜택 목록", tertiary: true },
        ]
      : benefit.id === "replacement-service"
        ? [
            { href: HUB_STORE_ANCHORS.visit, label: "매장·출장 안내" },
            { href: HUB_BENEFITS, label: "혜택 목록", tertiary: true },
          ]
        : [
            { href: HUB_STORE_DETAIL, label: "매장·출장 안내" },
            { href: HUB_BENEFITS, label: "혜택 목록", tertiary: true },
          ];

  return (
    <div className="bm-zone bm-zone--benefit mx-auto max-w-2xl space-y-6" data-page={`benefit-${benefit.id}`}>
      <div className="overflow-hidden rounded-2xl border border-amber-200/80 shadow-md">
        <BenefitCardMedia card={benefit} variant="detail" priority />
      </div>

      <div>
        <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-900 ring-1 ring-amber-200">
          {benefit.label}
        </span>
        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{benefit.title}</h1>
        <p className="mt-1 text-xs font-semibold text-slate-500">{benefit.description}</p>
        {benefit.note ? (
          <p className="mt-1 text-[11px] font-medium text-slate-400">{benefit.note}</p>
        ) : null}
        {benefit.detailIntro ? (
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{benefit.detailIntro}</p>
        ) : null}
      </div>

      {benefit.couponBenefitId ? (
        <CouponIssuerPanel benefitId={benefit.couponBenefitId} benefitName={benefit.title} />
      ) : null}

      {benefit.detailBullets && benefit.detailBullets.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
          <h2 className="text-sm font-black text-slate-900">안내</h2>
          <ul className="list-inside list-disc space-y-2 text-xs font-medium leading-relaxed text-slate-600">
            {benefit.detailBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            {ctaLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.tertiary ? bm.btnTertiary : bm.btnSecondary}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {benefit.id === "first-order-3" ? <FirstOrder3AutoApplyPanel /> : null}

      {benefit.couponBenefitId ? (
        <section className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-[11px] font-medium text-amber-900/90">
          쿠폰은 localStorage에 임시 저장됩니다. 운영용 발급·중복 방지·만료 관리는 DB·인증 연동이 필요합니다.
        </section>
      ) : null}

      <BenefitsNotices />
    </div>
  );
}
