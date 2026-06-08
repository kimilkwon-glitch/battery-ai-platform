"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBenefitsBox } from "@/components/auth/AuthBenefitsBox";
import { SignupAddressFields } from "@/components/auth/SignupAddressFields";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { hasAnySocialLoginEnabled } from "@/lib/auth/social-login-config";
import { setCustomerSession } from "@/lib/customer-auth-session";
import {
  createEmptyProfile,
  saveCustomerProfile,
} from "@/lib/customer-profile-storage";
import { syncSignupVehicleToProfile } from "@/lib/customer-signup-sync";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_MYPAGE,
} from "@/lib/customer-auth-routes";

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => String(new Date().getFullYear() - i));

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function SignupForm({ redirect }: { redirect?: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleFuel, setVehicleFuel] = useState("");
  const [preferredStore, setPreferredStore] = useState<"deokcheon" | "hakjang" | "undecided">(
    "undecided",
  );
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loginHref = redirect
    ? `${CUSTOMER_LOGIN_PAGE}?redirect=${encodeURIComponent(redirect)}`
    : CUSTOMER_LOGIN_PAGE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("휴대폰 번호를 확인해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상으로 설정해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (!postalCode.trim() || !address1.trim() || !address2.trim()) {
      setError("주소 검색 후 상세주소까지 입력해 주세요.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }

    setSubmitting(true);
    let profile = saveCustomerProfile({
      ...createEmptyProfile({
        name: name.trim(),
        phone: phone.trim(),
        provider: "credentials",
      }),
      postalCode: postalCode.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      vehicleName: vehicleName.trim() || undefined,
      vehicleYear: vehicleYear || undefined,
      vehicleFuel: vehicleFuel || undefined,
      preferredStore,
    });
    profile = syncSignupVehicleToProfile(profile);

    setCustomerSession({
      userId: profile.id,
      displayName: profile.name,
      phone: profile.phone,
      provider: "credentials",
    });

    router.push(redirect?.trim() || CUSTOMER_MYPAGE);
  };

  return (
    <div className="bm-auth-form" data-page="customer-signup">
      <h1 className="text-lg font-black text-[#0F172A]">회원가입하고 주문하기</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">
        기본 배송지와 차량정보를 저장하면 다음 주문이 더 빨라집니다.
      </p>

      <div className="mt-4">
        <AuthBenefitsBox variant="signup" />
      </div>

      {hasAnySocialLoginEnabled() ? (
        <>
          <div className="bm-auth-divider mt-5">
            <span>간편 회원가입</span>
          </div>
          <SocialLoginButtons redirect={redirect} />
        </>
      ) : null}

      <div className="bm-auth-divider">
        <span>휴대폰 번호로 가입</span>
      </div>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields" onSubmit={handleSubmit}>
        <fieldset className="space-y-3">
          <legend className="bm-auth-section__title">기본 정보</legend>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">
              이름 <span className="text-red-600">*</span>
            </span>
            <input
              required
              type="text"
              autoComplete="name"
              className="bm-auth-field__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">
              휴대폰 번호 <span className="text-red-600">*</span>
            </span>
            <input
              required
              type="tel"
              autoComplete="tel"
              className="bm-auth-field__input"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            />
          </label>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">
              비밀번호 <span className="text-red-600">*</span>
            </span>
            <input
              required
              type="password"
              autoComplete="new-password"
              className="bm-auth-field__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">
              비밀번호 확인 <span className="text-red-600">*</span>
            </span>
            <input
              required
              type="password"
              autoComplete="new-password"
              className="bm-auth-field__input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </label>
        </fieldset>

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
          <p className="text-[11px] font-medium text-slate-500">
            입력하시면 주문서에 자동으로 불러올 수 있습니다.
          </p>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">차량명</span>
            <input
              type="text"
              className="bm-auth-field__input"
              placeholder="예: 싼타페, 그랜저"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="bm-auth-field">
              <span className="bm-auth-field__label">연식</span>
              <select
                className="bm-auth-field__input"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
              >
                <option value="">선택</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
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
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">자주 이용하는 지점</span>
            <select
              className="bm-auth-field__input"
              value={preferredStore}
              onChange={(e) =>
                setPreferredStore(e.target.value as "deokcheon" | "hakjang" | "undecided")
              }
            >
              <option value="undecided">아직 모름</option>
              <option value="deokcheon">덕천점</option>
              <option value="hakjang">학장점</option>
            </select>
          </label>
        </fieldset>

        <div className="bm-auth-agreements space-y-2">
          <label className="bm-auth-check">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              <Link href="/terms" className="bm-auth-text-link">
                이용약관
              </Link>
              에 동의합니다 <span className="text-red-600">*</span>
            </span>
          </label>
          <label className="bm-auth-check">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
            />
            <span>
              <Link href="/privacy" className="bm-auth-text-link">
                개인정보처리방침
              </Link>
              에 동의합니다 <span className="text-red-600">*</span>
            </span>
          </label>
        </div>

        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "가입 중…" : "회원가입 완료"}
        </button>
      </form>

      <p className="bm-auth-form__links text-center">
        이미 계정이 있으신가요?{" "}
        <Link href={loginHref} className="bm-auth-text-link font-bold">
          로그인하고 주문 계속하기
        </Link>
      </p>
    </div>
  );
}
