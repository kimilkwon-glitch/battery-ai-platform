"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { getCustomerSession, isCustomerLoggedIn } from "@/lib/customer-auth-session";
import { getCustomerVehicles } from "@/lib/customer-vehicles-storage";
import {
  HUB_BENEFITS,
  HUB_GUIDE,
  HUB_LOGIN,
  HUB_SIGNUP,
  HUB_STORE_DETAIL,
} from "@/lib/customer-hub-routes";
import { CART_PAGE, ORDER_REQUEST_LOOKUP_PAGE } from "@/lib/customer-center-routes";

const MAIN_CARDS = [
  {
    title: "주문 내역",
    body: "주문·상담 진행 상태를 확인합니다.",
    cta: "주문 내역 보기",
    href: ORDER_REQUEST_LOOKUP_PAGE,
    icon: "checklist" as const,
  },
  {
    title: "내 차량 정보",
    body: "자주 쓰는 차량명·연식·배터리 규격을 정리해 두세요.",
    cta: "차량 정보 등록",
    href: "/vehicles?register=1",
    icon: "vehicle" as const,
  },
  {
    title: "쿠폰·혜택",
    body: "회원가입 첫 주문 3% 자동 적용 안내를 확인합니다.",
    cta: "혜택 확인",
    href: HUB_BENEFITS,
    icon: "layers" as const,
  },
  {
    title: "문의·상담",
    body: "배터리 규격 확인, 출장 가능 지역 상담을 요청합니다.",
    cta: "상담하기",
    href: HUB_STORE_DETAIL,
    icon: "phone" as const,
  },
] as const;

const QUICK_LINKS = [
  { label: "장바구니 바로가기", href: CART_PAGE },
  { label: "매장·출장 안내", href: HUB_STORE_DETAIL },
] as const;

export function MyPageClient() {
  const [vehicles, setVehicles] = useState<ReturnType<typeof getCustomerVehicles>>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [sessionName, setSessionName] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(isCustomerLoggedIn());
    setSessionName(getCustomerSession()?.displayName ?? null);
    setVehicles(getCustomerVehicles());
  }, []);

  return (
    <div className="mypage-hub space-y-6" data-page="mypage">
      <section className={`${bm.card} ${bm.cardPad}`}>
        <h1 className="text-xl font-black text-slate-950 sm:text-2xl">마이페이지</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          주문 내역, 차량 정보, 쿠폰 혜택을 한곳에서 확인하세요.
        </p>
        {loggedIn ? (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
            <p className="text-sm font-bold text-emerald-900">
              {sessionName ? `${sessionName}님, ` : ""}로그인되어 있습니다.
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-800/90">
              등록한 차량과 주문·혜택 정보를 아래에서 확인하세요.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80">
            <p className="text-sm font-bold text-slate-800">
              로그인하면 주문 내역, 내 차량 정보, 혜택을 확인할 수 있습니다.
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              아직 가입 전이라면 회원가입 후 첫 주문 혜택을 확인해 보세요.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={HUB_LOGIN} className={`${bm.btnPrimary} text-sm font-black`}>
                로그인
              </Link>
              <Link href={HUB_SIGNUP} className={`${bm.btnSecondary} text-sm font-black`}>
                회원가입
              </Link>
            </div>
          </div>
        )}
      </section>

      {vehicles.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <h2 className="text-base font-black text-slate-900">등록한 차량</h2>
          <ul className="mt-3 space-y-2">
            {vehicles.map((v) => (
              <li key={v.id}>
                <Link
                  href={v.href}
                  className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm font-bold text-slate-800 hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    {v.displayName}
                    {v.yearRange || v.year ? (
                      <span className="ml-2 font-medium text-slate-500">{v.yearRange ?? v.year}</span>
                    ) : null}
                  </span>
                  <span className="text-xs font-bold text-slate-600 sm:text-sm">
                    {v.recommendedBattery ? `${v.recommendedBattery} · ` : ""}
                    <span className="text-blue-700">규격 보기 →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MAIN_CARDS.map((card) => (
          <article key={card.title} className={`${bm.card} ${bm.cardPad} flex flex-col`}>
            <AppIcon iconKey={card.icon} size="md" />
            <h2 className="mt-3 text-base font-black text-slate-900">{card.title}</h2>
            <p className="mt-1 flex-1 text-sm font-medium leading-relaxed text-slate-600">
              {card.body}
            </p>
            <Link
              href={card.href}
              className={`${bm.btnNavy} mt-4 w-full justify-center text-sm font-black`}
            >
              {card.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">바로가기</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-900"
              >
                {link.label}
                <span className="text-slate-400" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={HUB_GUIDE}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-900"
            >
              배터리 가이드
              <span className="text-slate-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
