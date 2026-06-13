import Link from "next/link";
import {
  COMMERCE_ORDER_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";

const VEHICLES_SEARCH_PAGE = "/vehicles";

/** 로그인 페이지 — 비회원 주문·주문조회 안내 */
export function GuestCheckoutOptionsCard({ className = "" }: { className?: string }) {
  return (
    <section
      className={`bm-guest-checkout-options ${className}`.trim()}
      aria-labelledby="guest-checkout-options-title"
      data-section="guest-checkout-options"
    >
      <div className="bm-guest-checkout-options__inner">
        <h2 id="guest-checkout-options-title" className="bm-guest-checkout-options__title">
          비회원도 주문할 수 있어요
        </h2>
        <p className="bm-guest-checkout-options__desc">
          회원가입 없이 상품을 주문하거나 기존 주문 내역을 확인할 수 있습니다.
        </p>
        <div className="bm-guest-checkout-options__actions">
          <Link href={VEHICLES_SEARCH_PAGE} className="bm-guest-checkout-options__btn bm-guest-checkout-options__btn--primary">
            비회원으로 주문하기
          </Link>
          <Link
            href={COMMERCE_ORDER_LOOKUP_PAGE}
            className="bm-guest-checkout-options__btn bm-guest-checkout-options__btn--outline"
          >
            비회원 주문조회
          </Link>
        </div>
      </div>
    </section>
  );
}
