"use client";

import Link from "next/link";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export function BatteryDetailFooterCtas({ code }: { code: string }) {
  return (
    <section
      className={`${bm.card} ${bm.cardPad} flex flex-wrap gap-2`}
      aria-label="하단 주문·상담"
      data-battery-detail-footer-ctas
    >
      <Link
        href={`/shop?code=${encodeURIComponent(code)}`}
        className={`${bm.btnPrimary} flex-1 justify-center text-sm sm:flex-none`}
      >
        주문하기
      </Link>
      <Link
        href={HUB_STORE_DETAIL}
        className={`${bm.btnSecondary} flex-1 justify-center text-sm sm:flex-none`}
      >
        매장·출장 상담
      </Link>
      <Link
        href={CUSTOMER_CENTER_HUB}
        className={`${bm.btnTertiary} flex-1 justify-center text-sm sm:flex-none`}
      >
        고객센터 보기
      </Link>
    </section>
  );
}
