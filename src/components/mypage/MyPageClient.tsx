"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { bm } from "@/lib/design-tokens";
import { getCustomerProfile } from "@/lib/customer-profile-storage";
import { getCustomerVehicles } from "@/lib/customer-vehicles-storage";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_SIGNUP_PAGE,
  HUB_PHOTO,
} from "@/lib/customer-auth-routes";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { HUB_BENEFITS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const MENU_ITEMS = [
  {
    title: "내 주문내역",
    desc: "결제 주문·배송·장착 진행 상태를 확인합니다.",
    href: "/mypage#orders",
    empty: "아직 주문 내역이 없습니다.",
  },
  {
    title: "내 차량정보",
    desc: "자주 쓰는 차량을 등록하면 규격 확인이 빨라집니다.",
    href: "/vehicles?register=1",
    empty: "차량 정보를 등록하면 다음 주문이 더 빨라집니다.",
  },
  {
    title: "사진 확인 요청 내역",
    desc: "사진으로 규격 확인을 요청한 내역입니다.",
    href: HUB_PHOTO,
    empty: "사진 확인 요청 내역이 없습니다.",
  },
  {
    title: "배터리 교체 이력",
    desc: "교체 이력을 한곳에서 확인합니다.",
    href: "/mypage#orders",
    empty: "아직 교체 이력이 없습니다.",
  },
  {
    title: "회원정보 수정",
    desc: "이름, 연락처, 자주 이용하는 지점을 관리합니다.",
    href: CUSTOMER_SIGNUP_PAGE,
    empty: null,
  },
  {
    title: "자주 이용하는 지점",
    desc: "덕천점·학장점 중 편한 지점을 선택해 두세요.",
    href: HUB_STORE_DETAIL,
    empty: null,
  },
] as const;

const STORE_LABELS = {
  deokcheon: "덕천점",
  hakjang: "학장점",
  undecided: "아직 선택하지 않음",
} as const;

export function MyPageClient() {
  const router = useRouter();
  const { isLoggedIn, displayName, logout } = useCustomerAuth();
  const [vehicles, setVehicles] = useState<ReturnType<typeof getCustomerVehicles>>([]);
  const [preferredStore, setPreferredStore] = useState<string | null>(null);

  useEffect(() => {
    setVehicles(getCustomerVehicles());
    setPreferredStore(getCustomerProfile()?.preferredStore ?? null);
  }, []);

  return (
    <div className="mypage-hub space-y-6" data-page="mypage">
      <section className={`${bm.card} ${bm.cardPad}`}>
        <h1 className="text-xl font-black text-slate-950 sm:text-2xl">마이페이지</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          주문 내역, 차량 정보, 혜택을 한곳에서 확인하세요.
        </p>
        {isLoggedIn ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
            <div>
              <p className="text-sm font-bold text-emerald-900">
                {displayName ? `${displayName}님, ` : ""}안녕하세요
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-800/90">
                첫 주문 3% 혜택이 자동 적용됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.refresh();
              }}
              className={`${bm.btnTertiary} text-xs`}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80">
            <p className="text-sm font-bold text-slate-800">
              로그인하면 주문 내역, 내 차량 정보, 혜택을 확인할 수 있습니다.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={CUSTOMER_LOGIN_PAGE} className={`${bm.btnPrimary} text-sm font-black`}>
                로그인
              </Link>
              <Link href={CUSTOMER_SIGNUP_PAGE} className={`${bm.btnSecondary} text-sm font-black`}>
                회원가입
              </Link>
            </div>
          </div>
        )}
      </section>

      {preferredStore ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <h2 className="text-sm font-black text-slate-900">자주 이용하는 지점</h2>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {STORE_LABELS[preferredStore as keyof typeof STORE_LABELS] ?? preferredStore}
          </p>
        </section>
      ) : null}

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
                      <span className="ml-2 font-medium text-slate-500">
                        {v.yearRange ?? v.year}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-bold text-blue-700 sm:text-sm">규격 보기 →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="bm-mypage-empty">차량 정보를 등록하면 다음 주문이 더 빨라집니다.</div>
      )}

      <section className="bm-mypage-menu">
        {MENU_ITEMS.map((item) => (
          <Link key={item.title} href={item.href} className="bm-mypage-menu__item">
            <span className="bm-mypage-menu__title">{item.title}</span>
            <span className="bm-mypage-menu__desc">{item.desc}</span>
            {item.empty && !isLoggedIn ? (
              <span className="text-[11px] font-semibold text-slate-400">{item.empty}</span>
            ) : null}
          </Link>
        ))}
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">바로가기</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li>
            <Link
              href={CART_PAGE}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 hover:border-blue-200 hover:bg-blue-50/40"
            >
              장바구니
              <span aria-hidden>→</span>
            </Link>
          </li>
          <li>
            <Link
              href={HUB_BENEFITS}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 hover:border-blue-200 hover:bg-blue-50/40"
            >
              혜택 안내
              <span aria-hidden>→</span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
