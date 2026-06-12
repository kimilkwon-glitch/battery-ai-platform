import Link from "next/link";
import { COMMERCE_ORDER_LOOKUP_PAGE } from "@/lib/customer-center-routes";

/** 메인 좌측 상단 — 비회원 주문조회 진입 */
export function HomeGuestOrderLookupLink() {
  return (
    <div className="home-guest-order-lookup mx-auto w-full max-w-[1240px] px-4 pt-2 sm:px-6">
      <Link
        href={COMMERCE_ORDER_LOOKUP_PAGE}
        className="home-guest-order-lookup__link inline-flex min-h-[2rem] items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
      >
        비회원 주문조회
      </Link>
    </div>
  );
}
