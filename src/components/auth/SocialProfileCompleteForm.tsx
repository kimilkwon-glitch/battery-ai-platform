"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignupAddressFields } from "@/components/auth/SignupAddressFields";
import { setCustomerSession } from "@/lib/customer-auth-session";
import { isProfileCompleteForCheckout } from "@/lib/customer-profile-complete";
import {
  getCustomerProfile,
  saveCustomerProfile,
  type CustomerProfile,
} from "@/lib/customer-profile-storage";
import { syncSignupVehicleToProfile } from "@/lib/customer-signup-sync";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type Props = {
  redirect?: string | null;
};

export function SocialProfileCompleteForm({ redirect }: Props) {
  const router = useRouter();
  const existing = getCustomerProfile();
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [postalCode, setPostalCode] = useState(existing?.postalCode ?? "");
  const [address1, setAddress1] = useState(existing?.address1 ?? "");
  const [address2, setAddress2] = useState(existing?.address2 ?? "");
  const [vehicleName, setVehicleName] = useState(existing?.vehicleName ?? "");
  const [vehicleYear, setVehicleYear] = useState(existing?.vehicleYear ?? "");
  const [vehicleFuel, setVehicleFuel] = useState(existing?.vehicleFuel ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!existing) {
    return (
      <div className="bm-auth-complete">
        <p className="bm-auth-complete__title">로그인 정보가 없습니다</p>
        <Link href="/login" className="bm-auth-submit mt-4 inline-flex justify-center">
          로그인하기
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("휴대폰 번호를 확인해 주세요.");
      return;
    }
    if (!postalCode.trim() || !address1.trim() || !address2.trim()) {
      setError("주소 검색 후 상세주소까지 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    let profile: CustomerProfile = saveCustomerProfile({
      ...existing,
      phone: phone.trim(),
      postalCode: postalCode.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      vehicleName: vehicleName.trim() || undefined,
      vehicleYear: vehicleYear || undefined,
      vehicleFuel: vehicleFuel || undefined,
    });
    profile = syncSignupVehicleToProfile(profile);

    setCustomerSession({
      userId: profile.id,
      displayName: profile.name,
      phone: profile.phone,
      email: profile.email,
      provider: profile.provider,
    });

    const target = redirect?.trim() || CUSTOMER_MYPAGE;
    if (isProfileCompleteForCheckout(profile)) {
      router.push(target);
      return;
    }
    router.push(target);
  };

  return (
    <div className="bm-auth-form" data-page="complete-profile">
      <h1 className="text-lg font-black text-[#0F172A]">추가 정보 입력</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">
        주문을 계속하려면 연락처와 기본 배송지를 입력해 주세요.
      </p>

      {error ? (
        <p className="bm-auth-error mt-3" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields mt-4" onSubmit={handleSubmit}>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">
            이름
          </span>
          <input
            type="text"
            readOnly
            className="bm-auth-field__input bg-slate-50"
            value={existing.name}
          />
        </label>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">
            휴대폰 번호 <span className="text-red-600">*</span>
          </span>
          <input
            required
            type="tel"
            className="bm-auth-field__input"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="010-0000-0000"
          />
        </label>

        <SignupAddressFields
          postalCode={postalCode}
          address1={address1}
          address2={address2}
          onChange={(patch) => {
            if (patch.postalCode != null) setPostalCode(patch.postalCode);
            if (patch.address1 != null) setAddress1(patch.address1);
            if (patch.address2 != null) setAddress2(patch.address2);
          }}
        />

        <fieldset className="bm-auth-optional">
          <legend className="bm-auth-optional__title">선택 차량정보</legend>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">차량명</span>
            <input
              type="text"
              className="bm-auth-field__input"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="예: 싼타페, 그랜저"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="bm-auth-field">
              <span className="bm-auth-field__label">연식</span>
              <input
                type="text"
                className="bm-auth-field__input"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                placeholder="2021"
              />
            </label>
            <label className="bm-auth-field">
              <span className="bm-auth-field__label">연료</span>
              <select
                className="bm-auth-field__input"
                value={vehicleFuel}
                onChange={(e) => setVehicleFuel(e.target.value)}
              >
                <option value="">선택</option>
                {FUEL_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "저장 중…" : "저장하고 주문 계속하기"}
        </button>
      </form>
    </div>
  );
}
