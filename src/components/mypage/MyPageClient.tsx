"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Battery,
  Car,
  Camera,
  ClipboardList,
  Gift,
  MapPin,
  Package,
  ShoppingCart,
  UserCog,
  X,
} from "lucide-react";
import { CustomerActionModal } from "@/components/common/CustomerActionModal";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { getCustomerProfile } from "@/lib/customer-profile-storage";
import {
  getCustomerVehicles,
  removeCustomerVehicle,
  type CustomerVehicleRecord,
} from "@/lib/customer-vehicles-storage";
import { bm } from "@/lib/design-tokens";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_PROFILE_PAGE,
  CUSTOMER_SIGNUP_PAGE,
} from "@/lib/customer-auth-routes";
import { CART_PAGE, ORDER_REQUEST_LOOKUP_PAGE } from "@/lib/customer-center-routes";
import { MyPageOrdersSection } from "@/components/mypage/MyPageOrdersSection";
import { HUB_BENEFITS, HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const VEHICLE_REGISTER_HREF = "/vehicles?register=1";

const MENU_ITEMS = [
  {
    title: "내 주문내역",
    desc: "결제·배송·장착 진행 상태를 확인합니다.",
    href: "/mypage#orders",
    icon: Package,
    accent: "#2563eb",
    iconBg: "#eff6ff",
    cardBg: "linear-gradient(135deg, #eff6ff 0%, #fff 72%)",
  },
  {
    title: "내 차량정보",
    desc: "등록 차량으로 규격 확인을 빠르게 합니다.",
    href: VEHICLE_REGISTER_HREF,
    icon: Car,
    accent: "#059669",
    iconBg: "#ecfdf5",
    cardBg: "linear-gradient(135deg, #ecfdf5 0%, #fff 72%)",
  },
  {
    title: "상담 접수 내역",
    desc: "문의·상담 접수 현황을 확인합니다.",
    href: ORDER_REQUEST_LOOKUP_PAGE,
    icon: ClipboardList,
    accent: "#7c3aed",
    iconBg: "#f5f3ff",
    cardBg: "linear-gradient(135deg, #f5f3ff 0%, #fff 72%)",
  },
  {
    title: "혜택/쿠폰",
    desc: "회원 혜택과 쿠폰 안내를 확인합니다.",
    href: HUB_BENEFITS,
    icon: Gift,
    accent: "#d97706",
    iconBg: "#fffbeb",
    cardBg: "linear-gradient(135deg, #fffbeb 0%, #fff 72%)",
  },
  {
    title: "사진 확인 요청",
    desc: "사진으로 규격 확인을 요청한 내역입니다.",
    href: HUB_PHOTO,
    icon: Camera,
    accent: "#0891b2",
    iconBg: "#ecfeff",
    cardBg: "linear-gradient(135deg, #ecfeff 0%, #fff 72%)",
  },
  {
    title: "회원정보 수정",
    desc: "이름, 연락처, 주소, 지점을 관리합니다.",
    href: CUSTOMER_PROFILE_PAGE,
    icon: UserCog,
    accent: "#0f172a",
    iconBg: "#f1f5f9",
    cardBg: "linear-gradient(135deg, #f8fafc 0%, #fff 72%)",
  },
  {
    title: "자주 이용하는 지점",
    desc: "덕천점·학장점 안내와 연락처를 봅니다.",
    href: `${HUB_STORE_DETAIL}#stores`,
    icon: MapPin,
    accent: "#dc2626",
    iconBg: "#fef2f2",
    cardBg: "linear-gradient(135deg, #fef2f2 0%, #fff 72%)",
  },
] as const;

const STORE_LABELS = {
  deokcheon: "덕천점",
  hakjang: "학장점",
  undecided: "아직 선택하지 않음",
} as const;

function MyPageClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, displayName, logout, member, ready } = useCustomerAuth();
  const [vehicles, setVehicles] = useState<ReturnType<typeof getCustomerVehicles>>([]);
  const [preferredStore, setPreferredStore] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerVehicleRecord | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showWelcome = searchParams.get("welcome") === "1";

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    try {
      removeCustomerVehicle(deleteTarget.id);
      setVehicles(getCustomerVehicles());
      setDeleteTarget(null);
      setToast({ type: "success", message: "등록 차량이 삭제되었습니다." });
    } catch {
      setToast({ type: "error", message: "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요." });
    }
  };

  useEffect(() => {
    setVehicles(getCustomerVehicles());
    const fromMember = member?.preferredStore ?? null;
    setPreferredStore(fromMember ?? getCustomerProfile()?.preferredStore ?? null);
  }, [member?.id, member?.preferredStore]);

  useEffect(() => {
    if (!showWelcome) return;
    const timer = window.setTimeout(() => {
      router.replace("/mypage", { scroll: false });
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [showWelcome, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
                <p className="bm-mypage-welcome__name">
                  {displayName ? `${displayName}님, ` : ""}안녕하세요
                </p>
                <p className="bm-mypage-welcome__hint">첫 주문 3% 혜택이 자동 적용됩니다.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void logout().then(() => router.refresh());
                }}
                className="bm-mypage-welcome__logout"
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

      {showWelcome && isLoggedIn ? (
        <section className="bm-mypage-welcome-banner" role="status">
          <p className="bm-mypage-welcome-banner__title">가입이 완료되었습니다.</p>
          <p className="bm-mypage-welcome-banner__desc">
            마이페이지에서 내 차량을 등록하면 배터리 규격을 더 쉽게 확인할 수 있습니다.
          </p>
          <Link href={VEHICLE_REGISTER_HREF} className="bm-mypage-welcome-banner__cta">
            마이페이지에서 차량 등록하기
          </Link>
        </section>
      ) : null}

      {preferredStore && preferredStore !== "undecided" ? (
        <section className="bm-mypage-store-pill">
          <h2 className="bm-mypage-store-pill__label">자주 이용하는 지점</h2>
          <p className="bm-mypage-store-pill__value">
            {STORE_LABELS[preferredStore as keyof typeof STORE_LABELS] ?? preferredStore}
          </p>
          <Link
            href={`${HUB_STORE_DETAIL}#store-${preferredStore}`}
            className="bm-mypage-store-pill__link"
          >
            지점 상세 보기 →
          </Link>
        </section>
      ) : null}

      <section className="bm-mypage-vehicles" aria-labelledby="mypage-vehicles-title">
        <div className="bm-mypage-section-head">
          <h2 id="mypage-vehicles-title" className="bm-mypage-section-head__title">
            {vehicles.length > 0 ? "등록된 차량" : "내 차량 등록"}
          </h2>
          {vehicles.length > 0 ? (
            <Link href={VEHICLE_REGISTER_HREF} className="bm-mypage-section-head__link">
              차량 추가
            </Link>
          ) : null}
        </div>

        {vehicles.length === 0 ? (
          <div className="bm-mypage-vehicle-register">
            <span className="bm-mypage-vehicle-register__icon" aria-hidden>
              <Car className="size-6" />
            </span>
            <p className="bm-mypage-vehicle-register__title">아직 등록된 차량이 없습니다.</p>
            <p className="bm-mypage-vehicle-register__desc">
              차량과 연료를 선택하면 배터리 규격을 더 정확하게 확인할 수 있습니다.
            </p>
            <Link href={VEHICLE_REGISTER_HREF} className="bm-mypage-vehicle-register__cta">
              차량 등록하기
            </Link>
          </div>
        ) : (
          <ul className="bm-mypage-vehicle-list">
            {vehicles.map((v) => {
              const metaParts = [
                v.yearRange ?? v.year,
                v.fuel ?? v.fuelHint,
              ].filter(Boolean);
              return (
                <li key={v.id}>
                  <article className="bm-mypage-vehicle-card">
                    <button
                      type="button"
                      className="bm-mypage-vehicle-card__delete"
                      aria-label="등록 차량 삭제"
                      onClick={() => setDeleteTarget(v)}
                    >
                      <X className="size-4" strokeWidth={2.25} aria-hidden />
                    </button>
                    <div className="bm-mypage-vehicle-card__head">
                      <span className="bm-mypage-vehicle-card__icon" aria-hidden>
                        <Car className="size-5" />
                      </span>
                      <div className="bm-mypage-vehicle-card__info">
                        <p className="bm-mypage-vehicle-card__name">{v.displayName}</p>
                        {metaParts.length > 0 ? (
                          <p className="bm-mypage-vehicle-card__meta">{metaParts.join(" · ")}</p>
                        ) : null}
                      </div>
                    </div>
                    {v.recommendedBattery ? (
                      <p className="bm-mypage-vehicle-card__spec">
                        <span className="bm-mypage-vehicle-card__spec-badge">추천 규격</span>
                        {v.recommendedBattery}
                      </p>
                    ) : null}
                    <div className="bm-mypage-vehicle-card__actions">
                      <Link href={v.href} className="bm-mypage-vehicle-card__btn-primary">
                        규격 보기
                      </Link>
                      <Link href={VEHICLE_REGISTER_HREF} className="bm-mypage-vehicle-card__btn-secondary">
                        차량 정보 수정
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <MyPageOrdersSection isLoggedIn={isLoggedIn} authReady={ready} />

      <section id="replacements" className="bm-mypage-orders scroll-mt-24">
        <h2 className="bm-mypage-section-head__title">배터리 교체 이력</h2>
        <p className="bm-mypage-section-head__desc">
          완료된 교체·주문은 주문 조회에서 확인할 수 있습니다.
        </p>
        <div className="bm-mypage-orders__empty bm-mypage-orders__empty--spacious">
          <Battery className="bm-mypage-orders__empty-icon" aria-hidden />
          <p className="bm-mypage-orders__empty-title">아직 교체 이력이 없습니다.</p>
          <p className="bm-mypage-orders__empty-desc">교체 완료 후 이곳에 기록이 표시됩니다.</p>
          <div className="bm-mypage-orders__actions">
            <Link href={ORDER_REQUEST_LOOKUP_PAGE} className="bm-mypage-btn-secondary no-underline">
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
                  "--item-card-bg": item.cardBg,
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

      <section className="bm-mypage-shortcuts-panel">
        <h2 className="bm-mypage-section-head__title">바로가기</h2>
        <div className="bm-mypage-shortcuts">
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

      <CustomerActionModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="등록 차량을 삭제할까요?"
        footer={
          <>
            <button
              type="button"
              autoFocus
              className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`}
              onClick={() => setDeleteTarget(null)}
            >
              취소
            </button>
            <button
              type="button"
              className={`${bm.btnDanger} w-full justify-center text-sm font-black sm:flex-1`}
              onClick={handleDeleteConfirm}
            >
              삭제하기
            </button>
          </>
        }
      >
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          삭제하면 마이페이지에서 해당 차량 정보가 사라집니다. 필요하면 다시 등록할 수 있습니다.
        </p>
        {deleteTarget ? (
          <p className="mt-2 text-sm font-bold text-slate-800">{deleteTarget.displayName}</p>
        ) : null}
      </CustomerActionModal>

      {toast ? (
        <p
          role="status"
          className={`bm-mypage-toast bm-mypage-toast--${toast.type}`}
        >
          {toast.message}
        </p>
      ) : null}
    </div>
  );
}

export function MyPageClient() {
  return (
    <Suspense fallback={null}>
      <MyPageClientInner />
    </Suspense>
  );
}
