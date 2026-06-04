"use client";

import Link from "next/link";
import {
  BATTERY_SPEC_DETAIL_VIEW_LABEL,
  batterySpecDetailViewHref,
  buildBatteryCheckoutHref,
} from "@/lib/battery-card-cta";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { bm } from "@/lib/design-tokens";

type Props = {
  batteryCode: string;
  /** 레거시 — shop 패널 등. 미지정 시 체크아웃 buy_now */
  onOrder?: () => void;
  /** 주문하기 링크 (onOrder 없을 때). 미지정 시 buildBatteryCheckoutHref */
  orderHref?: string;
  vehicleSlug?: string;
  brand?: "rocket" | "solite";
};

export function BatteryProductCardActions({
  batteryCode,
  onOrder,
  orderHref,
  vehicleSlug,
  brand,
}: Props) {
  const code = batteryCode.trim();
  const specHref = batterySpecDetailViewHref(code, brand ? { brand } : undefined);
  const checkoutHref =
    orderHref ??
    buildBatteryCheckoutHref({
      battery: code,
      vehicle: vehicleSlug,
      brand,
      flow: "buy_now",
    });
  const reviewsHref = `${batteryDetailHref(code)}#battery-reviews`;

  return (
    <div className="mt-auto flex flex-col gap-2.5 pt-3" data-product-card-actions={code}>
      <Link
        href={reviewsHref}
        className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-100 transition hover:bg-emerald-100 hover:text-emerald-900"
      >
        리뷰 보기
      </Link>
      <Link
        href={specHref}
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
      ) : (
        <Link
          href={checkoutHref}
          className={`${bm.btnPrimary} w-full justify-center py-4 text-base font-black shadow-sm transition hover:shadow-md`}
        >
          주문하기
        </Link>
      )}
    </div>
  );
}
