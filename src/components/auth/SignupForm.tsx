"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OAuthHandoffHandler } from "@/components/auth/OAuthHandoffHandler";
import { SignupAddressFields } from "@/components/auth/SignupAddressFields";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  isValidEmail,
  isValidLoginId,
  isValidPassword,
  isValidPhoneDigits,
} from "@/lib/auth/signup-validation";
import {
  CUSTOMER_LOGIN_PAGE,
  CUSTOMER_MYPAGE,
} from "@/lib/customer-auth-routes";
import {
  buildSignupVehicleBrowseUrl,
  clearSignupFormDraft,
  clearSignupVehicleSelectActive,
  clearSignupVehicleSelection,
  loadSignupFormDraft,
  loadSignupVehicleSelection,
  markSignupVehicleSelectActive,
  saveSignupFormDraft,
} from "@/lib/signup-vehicle-draft";

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;
const MANUFACTURER_OPTIONS = [
  "현대",
  "기아",
  "제네시스",
  "쉐보레",
  "KG모빌리티",
  "르노코리아",
  "기타",
] as const;
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => String(new Date().getFullYear() - i));

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function SignupFormInner({ redirect }: { redirect?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useCustomerAuth();
  const [loginId, setLoginId] = useState("");
  const [idChecked, setIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [vehicleManufacturer, setVehicleManufacturer] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleFuel, setVehicleFuel] = useState("");
  const [batterySpec, setBatterySpec] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleSelectedNotice, setVehicleSelectedNotice] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadSignupFormDraft();
    if (draft) {
      if (draft.loginId != null) setLoginId(draft.loginId);
      if (draft.name != null) setName(draft.name);
      if (draft.phone != null) setPhone(draft.phone);
      if (draft.email != null) setEmail(draft.email);
      if (draft.postalCode != null) setPostalCode(draft.postalCode);
      if (draft.address1 != null) setAddress1(draft.address1);
      if (draft.address2 != null) setAddress2(draft.address2);
      if (draft.vehicleManufacturer != null) setVehicleManufacturer(draft.vehicleManufacturer);
      if (draft.vehicleName != null) setVehicleName(draft.vehicleName);
      if (draft.vehicleYear != null) setVehicleYear(draft.vehicleYear);
      if (draft.vehicleFuel != null) setVehicleFuel(draft.vehicleFuel);
      if (draft.batterySpec != null) setBatterySpec(draft.batterySpec);
      if (draft.agreeTerms != null) setAgreeTerms(draft.agreeTerms);
      if (draft.agreePrivacy != null) setAgreePrivacy(draft.agreePrivacy);
    }

    if (searchParams.get("vehicle_selected") === "1") {
      const selection = loadSignupVehicleSelection();
      if (selection) {
        if (selection.manufacturer) setVehicleManufacturer(selection.manufacturer);
        if (selection.vehicleName) setVehicleName(selection.vehicleName);
        if (selection.vehicleYear) setVehicleYear(selection.vehicleYear);
        if (selection.vehicleFuel) setVehicleFuel(selection.vehicleFuel);
        if (selection.batterySpec) setBatterySpec(selection.batterySpec);
        setVehicleSelectedNotice(
          `${selection.vehicleName || selection.displayName} 차량이 선택되었습니다. 가입 시 함께 저장됩니다.`,
        );
        clearSignupVehicleSelectActive();
        clearSignupVehicleSelection();
        router.replace(redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup");
      }
    }
  }, [searchParams, redirect, router]);

  const persistDraft = () => {
    saveSignupFormDraft({
      loginId,
      name,
      phone,
      email,
      postalCode,
      address1,
      address2,
      vehicleManufacturer,
      vehicleName,
      vehicleYear,
      vehicleFuel,
      batterySpec,
      agreeTerms,
      agreePrivacy,
    });
    markSignupVehicleSelectActive();
  };

  const loginHref = redirect
    ? `${CUSTOMER_LOGIN_PAGE}?redirect=${encodeURIComponent(redirect)}`
    : CUSTOMER_LOGIN_PAGE;

  const handleLoginIdChange = (value: string) => {
    setLoginId(value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20));
    setIdChecked(false);
    setIdCheckMessage(null);
  };

  const handleIdDuplicateCheck = async () => {
    const trimmed = loginId.trim();
    if (!isValidLoginId(trimmed)) {
      setIdCheckMessage("아이디는 영문·숫자 4~20자로 입력해 주세요.");
      setIdChecked(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/auth/check-login-id?loginId=${encodeURIComponent(trimmed)}`,
        { credentials: "include" },
      );
      const data = (await res.json()) as { available?: boolean; message?: string };
      if (data.available) {
        setIdCheckMessage("사용 가능한 아이디입니다.");
        setIdChecked(true);
      } else {
        setIdCheckMessage(data.message ?? "이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      }
    } catch {
      setIdCheckMessage("아이디 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setIdChecked(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = loginId.trim();
    if (!isValidLoginId(trimmedId)) {
      setError("아이디는 영문·숫자 4~20자로 입력해 주세요.");
      return;
    }
    if (!idChecked) {
      setError("아이디 확인을 해주세요.");
      return;
    }
    if (!isValidPassword(password)) {
      setError("비밀번호는 8자 이상으로 설정해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (!isValidPhoneDigits(phoneDigits)) {
      setError("휴대폰 번호를 확인해 주세요.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("이메일 주소를 확인해 주세요.");
      return;
    }
    if (!postalCode.trim() || !address1.trim() || !address2.trim()) {
      setError("주소 찾기 후 상세주소까지 입력해 주세요.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const vehicleInfo =
        vehicleManufacturer || vehicleName.trim() || vehicleYear || vehicleFuel || batterySpec.trim()
          ? {
              manufacturer: vehicleManufacturer || undefined,
              name: vehicleName.trim() || undefined,
              year: vehicleYear || undefined,
              fuel: vehicleFuel || undefined,
              batterySpec: batterySpec.trim() || undefined,
            }
          : null;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          loginId: trimmedId,
          password,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          zonecode: postalCode.trim(),
          address: address1.trim(),
          detailAddress: address2.trim(),
          vehicleInfo,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setError(data.message ?? "회원가입에 실패했습니다. 입력값을 다시 확인해 주세요.");
        return;
      }

      clearSignupFormDraft();
      clearSignupVehicleSelectActive();
      await refresh();
      router.push(redirect?.trim() || CUSTOMER_MYPAGE);
    } catch {
      setError("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bm-auth-form bm-auth-form--signup" data-page="customer-signup">
      <OAuthHandoffHandler redirect={redirect} onError={setError} />

      <h1 className="bm-auth-form__title">회원가입</h1>
      <p className="bm-auth-form__lead">배송지와 차량정보를 저장하면 다음 주문이 더 빠릅니다.</p>

      <div className="bm-auth-social-block">
        <SocialLoginButtons redirect={redirect} variant="signup" />
      </div>

      <div className="bm-auth-divider bm-auth-divider--signup">
        <span>아이디 회원가입</span>
      </div>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields" onSubmit={handleSubmit} noValidate>
        <fieldset className="bm-auth-fieldset">
          <legend className="bm-auth-section__title">계정 정보</legend>

          <div className="bm-auth-field">
            <span className="bm-auth-field__label">
              아이디 <span className="text-red-600">*</span>
            </span>
            <p className="bm-auth-field__hint">영문·숫자 조합 4~20자</p>
            <div className="bm-auth-field-row">
              <input
                type="text"
                autoComplete="username"
                className="bm-auth-field__input"
                placeholder="아이디"
                value={loginId}
                onChange={(e) => handleLoginIdChange(e.target.value)}
              />
              <button
                type="button"
                className="bm-auth-inline-btn"
                onClick={handleIdDuplicateCheck}
              >
                아이디 확인
              </button>
            </div>
            {idCheckMessage ? (
              <p
                className={
                  idChecked
                    ? "bm-auth-field__ok"
                    : "bm-auth-field__warn"
                }
                role="status"
              >
                {idCheckMessage}
              </p>
            ) : null}
          </div>

          <label className="bm-auth-field">
            <span className="bm-auth-field__label">
              비밀번호 <span className="text-red-600">*</span>
            </span>
            <input
              type="password"
              autoComplete="new-password"
              className="bm-auth-field__input"
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="bm-auth-field">
            <span className="bm-auth-field__label">
              비밀번호 확인 <span className="text-red-600">*</span>
            </span>
            <input
              type="password"
              autoComplete="new-password"
              className="bm-auth-field__input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="bm-auth-fieldset">
          <legend className="bm-auth-section__title">회원 정보</legend>

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
              휴대폰번호 <span className="text-red-600">*</span>
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
              이메일 <span className="text-red-600">*</span>
            </span>
            <input
              required
              type="email"
              autoComplete="email"
              className="bm-auth-field__input"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        <fieldset className="bm-auth-fieldset bm-auth-fieldset--vehicle">
          <legend className="bm-auth-section__title">차량 정보 (선택)</legend>
          <p className="bm-auth-field__hint">
            입력하시면 주문서에 자동으로 불러올 수 있습니다. 선택하지 않아도 가입할 수 있습니다.
          </p>
          <Link
            href={buildSignupVehicleBrowseUrl()}
            onClick={persistDraft}
            className="bm-auth-vehicle-select-btn"
          >
            내 차량 선택하기
          </Link>
          {vehicleSelectedNotice ? (
            <p className="bm-auth-field__ok" role="status">
              {vehicleSelectedNotice}
            </p>
          ) : null}
          <div className="bm-auth-vehicle-fields">
            <label className="bm-auth-field">
              <span className="bm-auth-field__label">제조사</span>
              <select
                className="bm-auth-field__input"
                value={vehicleManufacturer}
                onChange={(e) => setVehicleManufacturer(e.target.value)}
              >
                <option value="">선택</option>
                {MANUFACTURER_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
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
              <span className="bm-auth-field__label">배터리 규격 (알고 계신 경우)</span>
              <input
                type="text"
                className="bm-auth-field__input"
                placeholder="예: DIN74L, AGM70L"
                value={batterySpec}
                onChange={(e) => setBatterySpec(e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <div className="bm-auth-agreements">
          <label className="bm-auth-check">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              <Link href="/terms" className="bm-auth-text-link" target="_blank">
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
              <Link href="/privacy" className="bm-auth-text-link" target="_blank">
                개인정보처리방침
              </Link>
              에 동의합니다 <span className="text-red-600">*</span>
            </span>
          </label>
        </div>

        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "가입 중…" : "가입하기"}
        </button>
      </form>

      <p className="bm-auth-form__links text-center">
        이미 계정이 있으신가요?{" "}
        <Link href={loginHref} className="bm-auth-text-link font-bold">
          로그인
        </Link>
      </p>
    </div>
  );
}

export function SignupForm({ redirect }: { redirect?: string | null }) {
  return (
    <Suspense fallback={null}>
      <SignupFormInner redirect={redirect} />
    </Suspense>
  );
}
