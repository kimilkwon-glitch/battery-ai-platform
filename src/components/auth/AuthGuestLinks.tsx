import Link from "next/link";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_SIGNUP_PAGE,
  GUEST_ORDER_CHECK_PAGE,
  GUEST_ORDER_PAGE,
} from "@/lib/customer-auth-routes";

type Props = {
  showSignup?: boolean;
  showLogin?: boolean;
};

export function AuthGuestLinks({ showSignup = true, showLogin = false }: Props) {
  return (
    <div className="bm-auth-guest-links">
      <p className="bm-auth-guest-links__lead">
        회원가입 없이도 주문 요청과 주문 조회가 가능합니다.
      </p>
      <div className="bm-auth-guest-links__grid">
        <Link href={GUEST_ORDER_PAGE} className="bm-auth-guest-link">
          비회원 주문하기
        </Link>
        <Link href={GUEST_ORDER_CHECK_PAGE} className="bm-auth-guest-link">
          비회원 주문조회
        </Link>
        {showSignup ? (
          <Link href={CUSTOMER_SIGNUP_PAGE} className="bm-auth-guest-link bm-auth-guest-link--accent">
            회원가입
          </Link>
        ) : null}
        {showLogin ? (
          <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-guest-link bm-auth-guest-link--accent">
            로그인
          </Link>
        ) : null}
      </div>
    </div>
  );
}
