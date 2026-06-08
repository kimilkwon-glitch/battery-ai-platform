"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Battery,
  Camera,
  Car,
  Gift,
  MapPin,
  Package,
  ShoppingCart,
  UserCog,
  Wrench,
} from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { getCustomerProfile } from "@/lib/customer-profile-storage";
import { getCustomerVehicles } from "@/lib/customer-vehicles-storage";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_PROFILE_PAGE,
  CUSTOMER_SIGNUP_PAGE,
} from "@/lib/customer-auth-routes";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { MyPageOrdersSection } from "@/components/mypage/MyPageOrdersSection";
import { MYPAGE_ORDER_CTAS } from "@/lib/mypage/mypage-orders-section";
import { HUB_BENEFITS, HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const MENU_ITEMS = [
  {
    title: "내 주문내역",
    desc: "결제·배송·장착 진행 상태를 확인합니다.",
    href: "/mypage#orders",
    icon: Package,
    accent: "#2563eb",
    iconBg: "#eff6ff",
  },
  {
    title: "내 차량정보",
    desc: "등록 차량으로 규격 확인을 빠르게 합니다.",
    href: "/vehicles?register=1",
    icon: Car,
    accent: "#059669",
    iconBg: "#ecfdf5",
  },
  {
    title: "사진 확인 요청 내역",
    desc: "사진으로 규격 확인을 요청한 내역입니다.",
    href: HUB_PHOTO,
    icon: Camera,
    accent: "#d97706",
    iconBg: "#fffbeb",
  },
  {
    title: "배터리 교체 이력",
    desc: "완료된 교체·주문 이력을 확인합니다.",
    href: "/mypage#replacements",
    icon: Wrench,
    accent: "#7c3aed",
    iconBg: "#f5f3ff",
  },
  {
    title: "회원정보 수정",
    desc: "이름, 연락처, 주소, 지점을 관리합니다.",
    href: CUSTOMER_PROFILE_PAGE,
    icon: UserCog,
    accent: "#0f172a",
    iconBg: "#f1f5f9",
  },
  {
    title: "자주 이용하는 지점",
    desc: "덕천점·학장점 안내와 연락처를 봅니다.",
    href: `${HUB_STORE_DETAIL}#stores`,
    icon: MapPin,
    accent: "#dc2626",
    iconBg: "#fef2f2",
  },
] as const;

const STORE_LABELS = {
  deokcheon: "덕천점",
  hakjang: "학장점",
  undecided: "아직 선택하지 않음",
} as const;

export function MyPageClient() {
  const router = useRouter();
  const { isLoggedIn, displayName, logout, member, ready } = useCustomerAuth();
  const [vehicles, setVehicles] = useState<ReturnType<typeof getCustomerVehicles>>([]);
  const [preferredStore, setPreferredStore] = useState<string | null>(null);

  useEffect(() => {
    setVehicles(getCustomerVehicles());
    const fromMember = member?.preferredStore ?? null;
    setPreferredStore(
      fromMember ?? getCustomerProfile()?.preferredStore ?? null,
    );
  }, [member?.id, member?.preferredStore]);

  return (
    <div className="mypage-hub space-y-6" data-page="mypage">
      <section className="bm-mypage-hero">
        <div className="bm-mypage-hero__pattern" aria-hidden />
        <div className="bm-mypage-hero__inner">
          <h1 className="bm-mypage-hero__title">마이페이지</h1>
          <p className="bm-mypage-hero__desc">
            주문 내역, 차량 정보, 혜택을 한곳에서 확인하세요.
          </p>

          {ready && isLoggedIn ? (
            <div className="bm-mypage-welcome">
              <div>
                <p className="text-sm font-bold text-white">
                  {displayName ? `${displayName}님, ` : ""}안녕하세요
                </p>
                <p className="mt-1 text-xs font-semibold text-blue-100">
                  첫 주문 3% 혜택이 자동 적용됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void logout().then(() => router.refresh());
                }}
                className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="bm-mypage-guest-cta">
              <p className="bm-mypage-guest-cta__title">
                로그인하면 주문 내역과 차량 정보를 확인할 수 있습니다.
              </p>
              <div className="bm-mypage-guest-cta__actions">
                <Link href={CUSTOMER_LOGIN_PAGE} className="bm-mypage-guest-cta__btn-primary">
                  로그인
                </Link>
                <Link href={CUSTOMER_SIGNUP_PAGE} className="bm-mypage-guest-cta__btn-secondary">
                  회원가입
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {preferredStore && preferredStore !== "undecided" ? (
        <section className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
          <h2 className="text-xs font-black uppercase tracking-wide text-blue-800">자주 이용하는 지점</h2>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {STORE_LABELS[preferredStore as keyof typeof STORE_LABELS] ?? preferredStore}
          </p>
          <Link
            href={`${HUB_STORE_DETAIL}#store-${preferredStore}`}
            className="mt-2 inline-block text-xs font-bold text-blue-700 hover:underline"
          >
            지점 상세 보기 →
          </Link>
        </section>
      ) : null}

      {vehicles.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">등록한 차량</h2>
          <ul className="mt-3 space-y-2">
            {vehicles.map((v) => (
              <li key={v.id}>
                <Link
                  href={v.href}
                  className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    {v.displayName}
                    {v.yearRange || v.year ? (
                      <span className="ml-2 font-medium text-slate-500">
                        {v.yearRange ?? v.year}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 sm:text-sm">규격 보기 →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="bm-mypage-empty">
          <Car className="mx-auto size-8 text-slate-300" aria-hidden />
          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            차량 정보를 등록하면 다음 주문이 더 빨라집니다.
          </p>
          <div className="mt-3 text-center">
            <Link
              href="/vehicles?register=1"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              차량 등록하기 →
            </Link>
          </div>
        </div>
      )}

      <MyPageOrdersSection isLoggedIn={isLoggedIn} authReady={ready} />

      <section id="replacements" className="bm-mypage-orders scroll-mt-24">
        <h2 className="text-base font-black text-slate-900">배터리 교체 이력</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          완료된 교체·주문은 주문 조회에서 확인할 수 있습니다.
        </p>
        <div className="bm-mypage-orders__empty">
          <Battery className="mx-auto size-8 text-slate-300" aria-hidden />
          <p className="mt-2">교체 완료 후 이력이 여기에 표시됩니다.</p>
          <div className="bm-mypage-orders__actions">
            <Link href={MYPAGE_ORDER_CTAS.consultationLookup} className="bm-auth-inline-btn no-underline">
              상담 접수 조회
            </Link>
          </div>
        </div>
      </section>

      <section className="bm-mypage-menu" aria-label="마이페이지 메뉴">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="bm-mypage-menu__item"
              style={
                {
                  "--item-accent": item.accent,
                  "--item-icon-bg": item.iconBg,
                  "--item-icon-color": item.accent,
                } as React.CSSProperties
              }
            >
              <span className="bm-mypage-menu__icon">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="bm-mypage-menu__body">
                <span className="bm-mypage-menu__title">
                  {item.title}
                  <span className="bm-mypage-menu__arrow" aria-hidden>
                    →
                  </span>
                </span>
                <span className="bm-mypage-menu__desc">{item.desc}</span>
              </span>
            </Link>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black text-slate-900">바로가기</h2>
        <div className="bm-mypage-shortcuts mt-3">
          <Link href={CART_PAGE} className="bm-mypage-shortcut bm-mypage-shortcut--cart">
            <span className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-blue-600" aria-hidden />
              장바구니
            </span>
            <span aria-hidden>→</span>
          </Link>
          <Link href={HUB_BENEFITS} className="bm-mypage-shortcut bm-mypage-shortcut--benefits">
            <span className="flex items-center gap-2">
              <Gift className="size-4 text-amber-600" aria-hidden />
              혜택 안내
            </span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
