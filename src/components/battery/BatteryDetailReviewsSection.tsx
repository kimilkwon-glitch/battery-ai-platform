"use client";

import { batteryReviewHref } from "@/lib/battery-product-routes";
import { bm } from "@/lib/design-tokens";

export function BatteryDetailReviewsSection({ code }: { code: string }) {
  const href = batteryReviewHref({ batteryCode: code, brandId: "rocket" });

  return (
    <section
      id="battery-reviews"
      className={`${bm.card} ${bm.cardPad} scroll-mt-24`}
      aria-labelledby="battery-reviews-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="battery-reviews-heading" className="text-sm font-black text-slate-900">
            리뷰
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {code} 규격 장착·교체 후기를 상품 상세에서 확인하세요.
          </p>
        </div>
        <a href={href} className={`${bm.btnSecondary} shrink-0 text-xs`}>
          리뷰 보기
        </a>
      </div>
    </section>
  );
}
