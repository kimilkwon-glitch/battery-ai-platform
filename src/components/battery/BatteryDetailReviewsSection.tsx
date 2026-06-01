"use client";

import Link from "next/link";
import { bm } from "@/lib/design-tokens";

export function BatteryDetailReviewsSection({ code }: { code: string }) {
  const href = `/reviews?battery=${encodeURIComponent(code)}`;

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
            {code} 규격 장착·교체 후기를 확인하세요.
          </p>
        </div>
        <Link href={href} className={`${bm.btnSecondary} shrink-0 text-xs`}>
          리뷰 보기
        </Link>
      </div>
      <p className="mt-3 text-[11px] font-semibold text-slate-500">
        주문 전 같은 규격 후기를 보면 오주문을 줄일 수 있습니다.
      </p>
    </section>
  );
}
