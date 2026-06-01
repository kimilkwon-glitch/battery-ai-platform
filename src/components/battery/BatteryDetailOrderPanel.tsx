"use client";

import Link from "next/link";
import { BatteryGallery } from "@/components/BatteryGallery";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { BatteryAutoDiscountHint } from "@/components/benefits/BatteryAutoDiscountHint";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { bm } from "@/lib/design-tokens";

function orderHubHref(code: string): string {
  return `/shop?code=${encodeURIComponent(code)}`;
}

export function BatteryDetailOrderPanel({
  code,
  typeLabel,
  positioning,
  vehicleSummary,
}: {
  code: string;
  typeLabel: string;
  positioning: string;
  vehicleSummary?: string;
}) {
  const spec = parseBatterySpecDisplay(code);
  const imageSet = batteryImageSetForCode(code);
  const reviewsHref = `/reviews?battery=${encodeURIComponent(code)}`;

  return (
    <section
      id="battery-order"
      className="battery-product-detail scroll-mt-24 space-y-4"
      data-battery-product={code}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="relative space-y-2">
          <BatteryGallery code={code} imageSet={imageSet} minHeightClass="min-h-[240px] sm:min-h-[280px] md:min-h-[300px]" />
        </div>

        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <BatteryWishlistButton code={code} />
          </div>

          <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">배터리 규격</p>
          <h1 className={`${bm.specTitle} mt-0.5 pr-12`} data-spec-code>
            {code}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">{positioning}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <BatterySpecBadge tone="blue">{typeLabel}</BatterySpecBadge>
            <BatterySpecBadge tone="green">{spec.capacity ?? "용량 확인"}</BatterySpecBadge>
            <BatterySpecBadge tone="green">CCA {spec.cca ?? "확인"}</BatterySpecBadge>
            <BatterySpecBadge tone="gray">{spec.terminalLabel ?? "단자 확인"}</BatterySpecBadge>
          </div>
          {vehicleSummary ? (
            <p className="mt-3 text-xs font-medium text-slate-500">
              <span className="font-black text-slate-600">대표 적용: </span>
              {vehicleSummary}
            </p>
          ) : null}

          <div className="mt-4">
            <BatteryAutoDiscountHint />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href={orderHubHref(code)} className={`${bm.btnPrimary} text-center text-sm`}>
              주문하기
            </Link>
            <AddToCartButton
              mode="battery"
              variant="secondary"
              className="w-full justify-center text-sm"
              input={{
                batteryCode: code,
                fitmentStatus: vehicleSummary ? "needs_customer_confirm" : "unknown",
                source: "battery_detail",
              }}
            />
            <Link href={HUB_PHOTO_CHECK} className={`${bm.btnSecondary} text-center text-sm`}>
              사진으로 규격 확인
            </Link>
            <Link href={reviewsHref} className={`${bm.btnTertiary} text-center text-sm`}>
              리뷰 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
