"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CustomerActionModal } from "@/components/common/CustomerActionModal";
import { isCustomerLoggedIn } from "@/lib/customer-auth-session";
import {
  buildLoginRedirectUrl,
  buildSignupRedirectUrl,
  saveVehicleFromDetail,
} from "@/lib/save-vehicle-from-detail";
import { HUB_MYPAGE } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

type ModalKind = null | "guest" | "success" | "error";

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
};

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
}: SaveVehicleRegisterButtonProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
      setErrorMessage("");
      setModal("success");
      return true;
    }
    setErrorMessage(result.error);
    setModal("error");
    return false;
  }, [slug, displayName, yearRange, fuelHint, recommendedBattery, batteryOptions, source]);

  const handleClick = () => {
    if (saving) return;
    if (!isCustomerLoggedIn()) {
      setModal("guest");
      return;
    }
    persistVehicle();
  };

  useEffect(() => {
    if (!autoSaveOnMount) return;
    if (!isCustomerLoggedIn()) return;
    persistVehicle();
  }, [autoSaveOnMount, persistVehicle]);

  const loginHref = buildLoginRedirectUrl(slug);
  const signupHref = buildSignupRedirectUrl(slug);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className={className ?? `${bm.btnSecondary} text-sm font-black`}
        data-action="save-vehicle"
      >
        {saving ? "저장 중…" : label}
      </button>

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

      <CustomerActionModal
        open={modal === "success"}
        onClose={() => setModal(null)}
        title="차량정보 등록 완료"
        footer={
          <>
            <Link href={HUB_MYPAGE} className={`${bm.btnPrimary} w-full justify-center text-sm font-black sm:flex-1`}>
              마이페이지로 이동
            </Link>
            <button
              type="button"
              className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`}
              onClick={() => setModal(null)}
            >
              계속 둘러보기
            </button>
          </>
        }
      >
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          차량정보 등록이 완료되었습니다. 마이페이지에서 내 차량 정보를 확인할 수 있습니다.
        </p>
        <p className="mt-2 text-sm font-bold text-slate-800">
          {displayName}
          {recommendedBattery ? ` · ${recommendedBattery}` : ""}
        </p>
      </CustomerActionModal>

      <CustomerActionModal
        open={modal === "error"}
        onClose={() => setModal(null)}
        title="저장에 실패했습니다"
        footer={
          <>
            <button
              type="button"
              className={`${bm.btnPrimary} w-full justify-center text-sm font-black sm:flex-1`}
              onClick={() => {
                setModal(null);
                handleClick();
              }}
            >
              다시 시도
            </button>
            <button
              type="button"
              className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`}
              onClick={() => setModal(null)}
            >
              닫기
            </button>
          </>
        }
      >
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          {errorMessage || "차량정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."}
        </p>
      </CustomerActionModal>
    </>
  );
}
