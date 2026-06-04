"use client";

import Link from "next/link";
import {
  BATTERY_SPEC_DETAIL_VIEW_LABEL,
  resolveBatteryProductCardLinks,
  type BatteryProductBrandSlug,
} from "@/lib/battery-card-cta";
import { bm } from "@/lib/design-tokens";

type Props = {
  batteryCode: string;
  /** rocket | solite | delco … — 미지정 시 rocket(메인 로케트 라인업) */
  brandId?: BatteryProductBrandSlug | string | null;
  /** 레거시 — shop 패널 등 인라인 주문 */
  onOrder?: () => void;
  /** 주문하기 링크 override (거의 사용 안 함) */
  orderHref?: string | null;
};

export function BatteryProductCardActions({
  batteryCode,
  brandId,
  onOrder,
  orderHref,
}: Props) {
  const links = resolveBatteryProductCardLinks({
    batteryCode,
    brandId,
    defaultBrandId: "rocket",
  });
  const productHref = orderHref ?? links.productDetailHref;

  return (
    <div className="mt-auto flex flex-col gap-2.5 pt-3" data-product-card-actions={links.batteryCode}>
      <Link
        href={links.reviewHref}
        className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-center text-xs font-bold text-emerald-800 ring-1 ring-emerald-100 transition hover:bg-emerald-100 hover:text-emerald-900 sm:text-sm"
      >
        리뷰 보기
      </Link>
      <Link
        href={links.batterySpecGuideHref}
        className={`${bm.btnSecondary} w-full justify-center py-3 text-sm font-black transition hover:shadow-sm sm:text-base`}
      >
        {BATTERY_SPEC_DETAIL_VIEW_LABEL}
      </Link>
      {onOrder ? (
        <button
          type="button"
          onClick={onOrder}
          className={`${bm.btnPrimary} w-full justify-center py-4 text-base font-black shadow-sm transition hover:shadow-md`}
        >
          주문하기
        </button>
      ) : productHref ? (
        <Link
          href={productHref}
          className={`${bm.btnPrimary} w-full justify-center py-4 text-base font-black shadow-sm transition hover:shadow-md`}
        >
          주문하기
        </Link>
      ) : (
        <span
          className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-sm font-black text-slate-400"
          aria-disabled
        >
          상품 준비중
        </span>
      )}
    </div>
  );
}
