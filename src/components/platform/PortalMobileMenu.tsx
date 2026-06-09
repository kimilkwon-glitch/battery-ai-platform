"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GuideMobileAccordion } from "@/components/platform/GuideMegaMenu";
import { portalNavPrimary } from "@/components/platform/PortalHeaderNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_MYPAGE,
  CUSTOMER_SIGNUP_PAGE,
} from "@/lib/customer-auth-routes";

export function PortalMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, displayName, logout, ready } = useCustomerAuth();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="portal-header-menu-btn portal-header-menu-btn--accent inline-flex size-9 shrink-0 items-center justify-center rounded-full lg:hidden"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="모바일 메뉴">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute inset-y-0 right-0 flex w-[min(88vw,20rem)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="text-sm font-black text-slate-900">메뉴</span>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                aria-label="메뉴 닫기"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                {!ready ? (
                  <span className="h-8 w-24 animate-pulse rounded-full bg-slate-100" aria-hidden />
                ) : isLoggedIn ? (
                  <>
                    <Link
                      href={CUSTOMER_MYPAGE}
                      className="rounded-full bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200"
                    >
                      {displayName ? `${displayName.slice(0, 8)}님` : "마이페이지"}
                    </Link>
                    <button
                      type="button"
                      className="rounded-full px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
                      onClick={() => void logout()}
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={CUSTOMER_LOGIN_PAGE}
                      className="rounded-full px-3 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200"
                    >
                      로그인
                    </Link>
                    <Link
                      href={CUSTOMER_SIGNUP_PAGE}
                      className="rounded-full bg-[var(--bm-primary)] px-3 py-2 text-xs font-extrabold text-white"
                    >
                      회원가입
                    </Link>
                    <Link
                      href={CUSTOMER_MYPAGE}
                      className="rounded-full px-3 py-2 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200"
                    >
                      MY
                    </Link>
                  </>
                )}
              </div>

              <ul className="space-y-1">
                {portalNavPrimary.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <GuideMobileAccordion />
                </li>
              </ul>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
