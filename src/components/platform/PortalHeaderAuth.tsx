"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_SIGNUP_PAGE,
  CUSTOMER_MYPAGE,
} from "@/lib/customer-auth-routes";

export function PortalHeaderAuth() {
  const router = useRouter();
  const { isLoggedIn, displayName, logout, ready } = useCustomerAuth();

  if (!ready) {
    return (
      <div className="portal-header-auth flex shrink-0 items-center gap-1 sm:gap-1.5">
        <span className="h-8 w-16 animate-pulse rounded-full bg-slate-100" aria-hidden />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="portal-header-auth flex shrink-0 items-center gap-1 sm:gap-1.5">
        <Link
          href={CUSTOMER_MYPAGE}
          className="portal-header-auth-btn hidden rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:inline-flex lg:text-xs"
        >
          {displayName ? `${displayName.slice(0, 8)}님` : "마이페이지"}
        </Link>
        <Link
          href={`${CUSTOMER_MYPAGE}#orders`}
          className="portal-header-auth-btn hidden rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 lg:inline-flex lg:text-xs"
        >
          주문내역
        </Link>
        <Link
          href="/vehicles?register=1"
          className="portal-header-auth-btn hidden rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 xl:inline-flex xl:text-xs"
        >
          차량정보
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.refresh();
          }}
          className="portal-header-auth-btn rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 lg:text-xs"
        >
          로그아웃
        </button>
        <Link
          className="portal-header-my portal-header-auth-btn rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 lg:px-3 lg:text-xs"
          href={CUSTOMER_MYPAGE}
        >
          MY
        </Link>
      </div>
    );
  }

  return (
    <div className="portal-header-auth flex shrink-0 items-center gap-1 sm:gap-1.5">
      <Link
        href={CUSTOMER_LOGIN_PAGE}
        aria-label="로그인"
        className="portal-header-auth-btn inline-flex rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:text-xs"
      >
        로그인
      </Link>
      <Link
        href={CUSTOMER_SIGNUP_PAGE}
        aria-label="회원가입"
        className="portal-header-auth-btn inline-flex rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 lg:text-xs"
      >
        회원가입
      </Link>
      <Link
        className="portal-header-my portal-header-auth-btn rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 lg:px-3 lg:text-xs"
        href={CUSTOMER_MYPAGE}
      >
        MY
      </Link>
    </div>
  );
}
