import Link from "next/link";
import { CUSTOMER_LOGIN_PAGE, CUSTOMER_SIGNUP_PAGE } from "@/lib/customer-auth-routes";

type Props = {
  redirect?: string | null;
  showSignup?: boolean;
  showLogin?: boolean;
};

export function AuthGuestLinks({
  redirect,
  showSignup = true,
  showLogin = false,
}: Props) {
  const loginHref = redirect
    ? `${CUSTOMER_LOGIN_PAGE}?redirect=${encodeURIComponent(redirect)}`
    : CUSTOMER_LOGIN_PAGE;
  const signupHref = redirect
    ? `${CUSTOMER_SIGNUP_PAGE}?redirect=${encodeURIComponent(redirect)}`
    : CUSTOMER_SIGNUP_PAGE;

  return (
    <div className="bm-auth-guest-links">
      <p className="bm-auth-guest-links__lead">
        배터리 주문·결제는 로그인 후 진행됩니다.
      </p>
      <div className="bm-auth-guest-links__grid">
        {showLogin ? (
          <Link href={loginHref} className="bm-auth-guest-link bm-auth-guest-link--accent">
            로그인하고 주문 계속하기
          </Link>
        ) : null}
        {showSignup ? (
          <Link href={signupHref} className="bm-auth-guest-link bm-auth-guest-link--accent">
            회원가입하고 주문하기
          </Link>
        ) : null}
      </div>
    </div>
  );
}
