"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBenefitsBox } from "@/components/auth/AuthBenefitsBox";
import { AuthGuestLinks } from "@/components/auth/AuthGuestLinks";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setCustomerSession } from "@/lib/customer-auth-session";
import { saveCustomerProfile } from "@/lib/customer-profile-storage";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_MYPAGE,
  GUEST_ORDER_PAGE,
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
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
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
    if (!agreeTerms || !agreePrivacy) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }

    setSubmitting(true);
    setCustomerSession({
      displayName: name.trim(),
      phone: phone.trim(),
    });
    saveCustomerProfile({
      name: name.trim(),
      phone: phone.trim(),
      vehicleName: vehicleName.trim() || undefined,
      vehicleYear: vehicleYear || undefined,
      vehicleFuel: vehicleFuel || undefined,
      preferredStore,
    });

    if (redirect?.trim()) {
      router.push(redirect.trim());
      return;
    }
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="bm-auth-complete" data-page="signup-complete">
        <p className="bm-auth-complete__title">회원가입이 완료되었습니다</p>
        <p className="bm-auth-complete__body">
          첫 주문 시 3% 혜택이 자동 적용됩니다. 차량 정보를 등록하면 다음 주문이 더 빨라집니다.
        </p>
        <Link href={CUSTOMER_MYPAGE} className="bm-auth-submit mt-4 inline-flex justify-center">
          마이페이지로 이동
        </Link>
        <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-text-link mt-4 block text-center">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bm-auth-form" data-page="customer-signup">
      <AuthBenefitsBox variant="signup" />

      <div className="bm-auth-divider">
        <span>간편 회원가입</span>
      </div>
      <SocialLoginButtons />

      <div className="bm-auth-divider">
        <span>휴대폰 번호로 가입</span>
      </div>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields" onSubmit={handleSubmit}>
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
            inputMode="tel"
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

        <fieldset className="bm-auth-optional">
          <legend className="bm-auth-optional__title">선택 정보</legend>
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
              <Link href="/support" className="bm-auth-text-link">
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
              개인정보 수집 및 이용에 동의합니다 <span className="text-red-600">*</span>
            </span>
          </label>
        </div>

        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "가입 중…" : "회원가입 완료"}
        </button>
      </form>

      <p className="bm-auth-form__links text-center">
        이미 계정이 있으신가요?{" "}
        <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-text-link font-bold">
          로그인
        </Link>
      </p>

      <div className="mt-4 text-center">
        <Link href={GUEST_ORDER_PAGE} className="bm-auth-text-link text-sm">
          비회원으로 계속하기
        </Link>
      </div>

      <AuthGuestLinks showSignup={false} showLogin />
    </div>
  );
}
