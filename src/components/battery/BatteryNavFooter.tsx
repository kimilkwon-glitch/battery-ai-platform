import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import { compareHref, guideHref } from "@/lib/platform-data";
import {
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_USED_BATTERY,
} from "@/lib/customer-center-routes";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";

export function BatteryNavFooter({ code }: { code: string }) {
  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <details className="group">
        <summary className="cursor-pointer text-xs font-black text-slate-600 marker:content-none">
          <span className="inline-flex items-center gap-1">
            추가 이동
            <span className="text-[10px] font-bold text-slate-400 group-open:hidden">펼치기</span>
          </span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <Link className={`${bm.btnTertiary} text-[11px]`} href={compareHref(code, "DIN74L")}>
            규격 비교
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={guideHref("terminal-lr")}>
            규격 가이드
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href="/order-checklist">
            주문 전 체크
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={CUSTOMER_CENTER_ORDER_GUIDE}>
            주문 안내
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={CUSTOMER_CENTER_USED_BATTERY}>
            폐전지 반납
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={HUB_SUPPORT}>
            고객센터
          </Link>
        </div>
      </details>
    </section>
  );
}

