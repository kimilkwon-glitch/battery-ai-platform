"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CustomerActionModal } from "@/components/common/CustomerActionModal";
import { isCustomerLoggedIn } from "@/lib/customer-auth-session";
import { getCustomerVehicles } from "@/lib/customer-vehicles-storage";
import {
  applySignupVehicleSelection,
  isSignupVehicleSelectActive,
  isSignupVehicleSelectMode,
  SIGNUP_VEHICLE_SELECT_MODE,
} from "@/lib/signup-vehicle-draft";
import {
  buildLoginRedirectUrl,
  buildSignupRedirectUrl,
  saveVehicleFromDetail,
} from "@/lib/save-vehicle-from-detail";
import { HUB_MYPAGE } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

type ModalKind = null | "guest";

type ToastState = null | { type: "success" | "error"; message: string };

export type SaveVehicleRegisterButtonProps = {
  slug: string;
  displayName: string;
  yearRange?: string;
  fuelHint?: string | null;
  recommendedBattery?: string;
  batteryOptions?: string[];
  /** 로그인/가입 후 복귀 시 자동 저장 시도 */
  autoSaveOnMount?: boolean;
  className?: string;
  label?: string;
  source?: "vehicleDetail" | "vehicleSearch" | "vehicleBrowse";
  /** 회원가입 중 차량 선택 흐름 — 로그인 요구 없이 가입 폼으로 복귀 */
  signupVehicleSelect?: boolean;
  /** 연료·연식 미선택 등으로 등록 차단 */
  registerBlocked?: boolean;
  blockedMessage?: string;
};

function isSlugRegistered(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return getCustomerVehicles().some((v) => v.slug === slug);
}

export function SaveVehicleRegisterButton({
  slug,
  displayName,
  yearRange,
  fuelHint,
  recommendedBattery,
  batteryOptions = [],
  autoSaveOnMount = false,
  className,
  label = "내 차량으로 정보등록",
  source = "vehicleDetail",
  signupVehicleSelect = false,
  registerBlocked = false,
  blockedMessage = "연료를 선택해 주세요.",
}: SaveVehicleRegisterButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [registered, setRegistered] = useState(false);
  const [saving, setSaving] = useState(false);

  const inSignupVehicleSelect =
    signupVehicleSelect ||
    isSignupVehicleSelectMode(searchParams.get("mode")) ||
    isSignupVehicleSelectActive();

  useEffect(() => {
    setRegistered(isSlugRegistered(slug));
  }, [slug]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const persistVehicle = useCallback(() => {
    setSaving(true);
    const result = saveVehicleFromDetail({
      slug,
      displayName,
      yearRange,
      fuelHint: fuelHint ?? undefined,
      recommendedBattery,
      batteryOptions,
      source,
    });
    setSaving(false);
    if (result.ok) {
      setRegistered(true);
      setToast({ type: "success", message: "차량정보가 등록되었습니다." });
      return true;
    }
    setToast({
      type: "error",
      message: result.error || "차량 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    });
    return false;
  }, [slug, displayName, yearRange, fuelHint, recommendedBattery, batteryOptions, source]);

  const returnToSignupWithVehicle = useCallback(() => {
    setSaving(true);
    applySignupVehicleSelection({
      slug,
      displayName,
      yearRange,
      fuelHint,
      recommendedBattery,
    });
    setSaving(false);
    router.push("/signup?vehicle_selected=1");
  }, [slug, displayName, yearRange, fuelHint, recommendedBattery, router]);

  const handleClick = () => {
    if (saving || registered) return;
    if (registerBlocked) {
      setToast({ type: "error", message: blockedMessage });
      return;
    }
    if (inSignupVehicleSelect && !isCustomerLoggedIn()) {
      returnToSignupWithVehicle();
      return;
    }
    if (!isCustomerLoggedIn()) {
      setModal("guest");
      return;
    }
    persistVehicle();
  };

  useEffect(() => {
    if (!autoSaveOnMount) return;
    if (!isCustomerLoggedIn()) return;
    if (isSlugRegistered(slug)) {
      setRegistered(true);
      return;
    }
    persistVehicle();
  }, [autoSaveOnMount, slug, persistVehicle]);

  const loginHref = buildLoginRedirectUrl(slug);
  const signupHref = buildSignupRedirectUrl(slug);
  const buttonLabel = inSignupVehicleSelect && !isCustomerLoggedIn() ? "이 차량 선택" : label;
  const buttonClassName = className ?? `${bm.btnSecondary} text-sm font-black`;

  return (
    <>
      {registered && !inSignupVehicleSelect ? (
        <Link
          href={HUB_MYPAGE}
          className={buttonClassName}
          data-action="save-vehicle-done"
        >
          마이페이지에서 확인
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={saving}
          aria-disabled={registerBlocked || saving}
          className={buttonClassName}
          data-action={inSignupVehicleSelect ? "signup-vehicle-select" : "save-vehicle"}
          data-signup-mode={inSignupVehicleSelect ? SIGNUP_VEHICLE_SELECT_MODE : undefined}
        >
          {saving ? "등록 중..." : buttonLabel}
        </button>
      )}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`bm-vehicle-register-toast bm-vehicle-register-toast--${toast.type}`}
        >
          <p className="bm-vehicle-register-toast__message">{toast.message}</p>
          {toast.type === "success" ? (
            <Link href={HUB_MYPAGE} className="bm-vehicle-register-toast__action">
              마이페이지에서 확인
            </Link>
          ) : null}
        </div>
      ) : null}

      <CustomerActionModal
        open={modal === "guest"}
        onClose={() => setModal(null)}
        title="회원가입 후 이용 가능합니다"
        footer={
          <>
            <Link href={signupHref} className={`${bm.btnPrimary} w-full justify-center text-sm font-black sm:flex-1`}>
              회원가입하기
            </Link>
            <Link href={loginHref} className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`}>
              로그인하기
            </Link>
            <button
              type="button"
              data-testid="save-vehicle-modal-close"
              className={`${bm.btnTertiary} w-full justify-center text-sm font-black sm:flex-1`}
              onClick={() => setModal(null)}
            >
              닫기
            </button>
          </>
        }
      >
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          차량 정보를 저장하면 다음 주문부터 규격 확인과 주문 과정이 더 편해집니다.
        </p>
      </CustomerActionModal>
    </>
  );
}
