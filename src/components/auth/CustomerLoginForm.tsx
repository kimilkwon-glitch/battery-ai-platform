"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthBenefitsBox } from "@/components/auth/AuthBenefitsBox";
import { OAuthHandoffHandler } from "@/components/auth/OAuthHandoffHandler";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { hasAnySocialLoginEnabled } from "@/lib/auth/social-login-config";
import { setCustomerSession } from "@/lib/customer-auth-session";
import { buildCompleteProfileRedirectUrl } from "@/lib/customer-auth-redirect";
import { isProfileCompleteForCheckout } from "@/lib/customer-profile-complete";
import {
  CUSTOMER_SIGNUP_PAGE,
  CUSTOMER_MYPAGE,
} from "@/lib/customer-auth-routes";
import { getCustomerProfile } from "@/lib/customer-profile-storage";
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

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  kakao_login_cancelled: "카카오 로그인이 취소되었습니다.",
  kakao_login_invalid_state: "카카오 로그인 요청이 만료되었습니다. 다시 시도해 주세요.",
  kakao_login_failed: "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

function CustomerLoginFormInner({ redirect }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError && OAUTH_ERROR_MESSAGES[oauthError]) {
      setError(OAUTH_ERROR_MESSAGES[oauthError]);
    }
  }, [searchParams]);

  const signupHref = redirect
    ? `${CUSTOMER_SIGNUP_PAGE}?redirect=${encodeURIComponent(redirect)}`
    : CUSTOMER_SIGNUP_PAGE;

  const finishLogin = (returnPath: string) => {
    const profile = getCustomerProfile();
    if (profile && !isProfileCompleteForCheckout(profile)) {
      router.push(buildCompleteProfileRedirectUrl(returnPath));
      return;
    }
    router.push(returnPath);
  };

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
      const profile = getCustomerProfile();
      const userId = profile?.id ?? `bm-user-${Date.now()}`;
      setCustomerSession({
        userId,
        displayName: profile?.name ?? phone.trim(),
        phone: phone.trim(),
        email: profile?.email,
        provider: profile?.provider ?? "credentials",
      });
      finishLogin(redirect?.trim() || CUSTOMER_MYPAGE);
    } catch {
      setError("로그인에 실패했습니다. 입력 정보를 확인해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="bm-auth-form" data-page="customer-login">
      <OAuthHandoffHandler redirect={redirect} onError={setError} />
      <h1 className="text-lg font-black text-[#0F172A]">로그인 후 주문을 계속해 주세요</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">
        회원정보를 이용해 배송지와 차량정보를 빠르게 불러올 수 있습니다.
      </p>

      <div className="mt-4">
        <AuthBenefitsBox variant="login" />
      </div>

      {hasAnySocialLoginEnabled() ? (
        <>
          <div className="bm-auth-divider mt-5">
            <span>간편 로그인</span>
          </div>
          <SocialLoginButtons redirect={redirect} />
        </>
      ) : null}

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
          {submitting ? "로그인 중…" : "로그인하고 주문 계속하기"}
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
      </div>
    </div>
  );
}

export function CustomerLoginForm(props: Props) {
  return (
    <Suspense fallback={null}>
      <CustomerLoginFormInner {...props} />
    </Suspense>
  );
}
