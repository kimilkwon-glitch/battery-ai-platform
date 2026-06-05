"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBenefitsBox } from "@/components/auth/AuthBenefitsBox";
import { AuthGuestLinks } from "@/components/auth/AuthGuestLinks";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { setCustomerSession } from "@/lib/customer-auth-session";
import {
  CUSTOMER_SIGNUP_PAGE,
  CUSTOMER_MYPAGE,
  GUEST_ORDER_CHECK_PAGE,
} from "@/lib/customer-auth-routes";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

type Props = {
  redirect?: string | null;
};

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function CustomerLoginForm({ redirect }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signupHref = redirect
    ? `${CUSTOMER_SIGNUP_PAGE}?redirect=${encodeURIComponent(redirect)}`
    : CUSTOMER_SIGNUP_PAGE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("휴대폰 번호를 확인해 주세요.");
      return;
    }
    if (password.length < 4) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      setCustomerSession({
        displayName: phone.trim(),
        phone: phone.trim(),
      });
      router.push(redirect?.trim() || CUSTOMER_MYPAGE);
    } catch {
      setError("로그인에 실패했습니다. 입력 정보를 확인해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="bm-auth-form" data-page="customer-login">
      <AuthBenefitsBox variant="login" />

      <div className="bm-auth-divider">
        <span>간편 로그인</span>
      </div>
      <SocialLoginButtons />

      <div className="bm-auth-divider">
        <span>배터리매니저 계정</span>
      </div>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields" onSubmit={handleSubmit}>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">휴대폰 번호</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className="bm-auth-field__input"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          />
        </label>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">비밀번호</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="bm-auth-field__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="bm-auth-check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>로그인 상태 유지</span>
        </label>
        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "로그인 중…" : "배터리매니저 계정으로 로그인"}
        </button>
      </form>

      <div className="bm-auth-form__links">
        <Link href={`${HUB_STORE_DETAIL}#contact`} className="bm-auth-text-link">
          비밀번호 찾기
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href={signupHref} className="bm-auth-text-link">
          아직 계정이 없으신가요? 회원가입
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href={GUEST_ORDER_CHECK_PAGE} className="bm-auth-text-link">
          비회원 주문조회
        </Link>
      </div>

      <AuthGuestLinks showSignup={false} />
    </div>
  );
}
