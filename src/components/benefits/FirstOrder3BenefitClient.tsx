"use client";

import Link from "next/link";
import { BenefitCardMedia } from "@/components/home/BenefitCardMedia";
import { CouponIssuerPanel } from "@/components/benefits/CouponIssuerPanel";
import { FIRST_ORDER_3_BENEFIT, HUB_BENEFITS } from "@/lib/benefits-data";
import { HUB_SHOP_ANCHORS } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import type { HomeBenefitCard } from "@/lib/home-benefits-data";

export function FirstOrder3BenefitClient() {
  const card = FIRST_ORDER_3_BENEFIT as HomeBenefitCard;

  return (
    <div className="bm-zone bm-zone--benefit mx-auto max-w-2xl space-y-6" data-page="benefit-first-order-3">
      <div className="overflow-hidden rounded-2xl border border-amber-200/80 shadow-md">
        <BenefitCardMedia card={card} variant="detail" />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-wide text-amber-800">혜택</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{FIRST_ORDER_3_BENEFIT.title}</h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          첫 주문 고객을 위한 3% 혜택입니다. 적용 가능 여부와 조건은 주문 상담 시 확인됩니다. 자동 결제 할인이
          아니며, 발급한 쿠폰 코드를 택배주문·채팅상담·고객센터 문의 시 제시해 주세요.
        </p>
      </div>

      <CouponIssuerPanel
        benefitId="first-order-3"
        benefitName={FIRST_ORDER_3_BENEFIT.title}
      />

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h2 className="text-sm font-black text-slate-900">적용 조건 안내</h2>
        <ul className="list-inside list-disc space-y-2 text-xs font-medium leading-relaxed text-slate-600">
          <li>일부 상품·차량·규격에만 적용될 수 있습니다.</li>
          <li>첫 주문 여부·반납 조건·프로모션 중복 여부는 상담 시 확인합니다.</li>
          <li>정확한 할인 금액은 주문 확정 전 안내드립니다.</li>
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h2 className="text-sm font-black text-slate-900">사용 방법</h2>
        <ol className="list-inside list-decimal space-y-2 text-xs font-medium leading-relaxed text-slate-600">
          <li>아래에서 쿠폰을 발급하고 코드를 복사합니다.</li>
          <li>택배주문 상담, 배터리 상세 주문 영역, 고객센터 문의, 채팅상담 시 쿠폰 코드를 알려 주세요.</li>
          <li>상담 시 차량명·연식·규격·반납 여부를 함께 확인하면 처리가 빠릅니다.</li>
        </ol>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href={HUB_SHOP_ANCHORS.orderCheck} className={bm.btnSecondary}>
            택배주문 안내
          </Link>
          <Link href={HUB_BENEFITS} className={bm.btnTertiary}>
            혜택 목록
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-[11px] font-medium text-amber-900/90">
        쿠폰은 localStorage에 임시 저장됩니다. 운영용 발급·중복 방지·만료 관리는 DB·인증 연동이 필요합니다.
      </section>
    </div>
  );
}
