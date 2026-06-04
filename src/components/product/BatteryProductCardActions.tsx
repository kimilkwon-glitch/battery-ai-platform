"use client";

import Link from "next/link";
import {
  BATTERY_SPEC_DETAIL_VIEW_LABEL,
  resolveBatteryProductCardLinks,
  type BatteryProductBrandSlug,
} from "@/lib/battery-card-cta";

const ACTION_BASE =
  "inline-flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-black transition sm:py-3";

type Props = {
  batteryCode: string;
  brandId?: BatteryProductBrandSlug | string | null;
  onOrder?: () => void;
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
    <div
      className="home-spec-card-actions flex flex-col gap-2"
      data-product-card-actions={links.batteryCode}
    >
      <Link
        href={links.reviewHref}
        className={`${ACTION_BASE} bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90 hover:bg-emerald-200`}
      >
        리뷰 보기
      </Link>
      <Link
        href={links.batterySpecGuideHref}
        className={`${ACTION_BASE} bg-blue-50 text-blue-950 ring-1 ring-blue-200/90 hover:bg-blue-100`}
      >
        {BATTERY_SPEC_DETAIL_VIEW_LABEL}
      </Link>
      {onOrder ? (
        <button
          type="button"
          onClick={onOrder}
          className={`${ACTION_BASE} bg-[var(--bm-primary)] text-white shadow-sm ring-1 ring-blue-600/30 hover:bg-blue-700`}
        >
          주문하기
        </button>
      ) : productHref ? (
        <Link
          href={productHref}
          className={`${ACTION_BASE} bg-[var(--bm-primary)] text-white shadow-sm ring-1 ring-blue-600/30 hover:bg-blue-700`}
        >
          주문하기
        </Link>
      ) : (
        <span
          className={`${ACTION_BASE} cursor-not-allowed border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400`}
          aria-disabled
        >
          상품 준비중
        </span>
      )}
    </div>
  );
}
