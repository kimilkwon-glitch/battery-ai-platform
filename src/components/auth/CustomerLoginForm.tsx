"use client";



import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { Suspense, useEffect, useState } from "react";

import { OAuthHandoffHandler } from "@/components/auth/OAuthHandoffHandler";

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

import { useCustomerAuth } from "@/hooks/useCustomerAuth";

import {

  CUSTOMER_MYPAGE,

  CUSTOMER_SIGNUP_PAGE,

} from "@/lib/customer-auth-routes";

import { HUB_SUPPORT } from "@/lib/customer-hub-routes";

import { CREDENTIALS_LOGIN_UNAVAILABLE_MESSAGE } from "@/lib/auth/client-credentials-login-stub";



type Props = {

  redirect?: string | null;

};



const OAUTH_ERROR_MESSAGES: Record<string, string> = {

  naver_login_cancelled: "네이버 로그인이 취소되었습니다.",

  naver_login_invalid_state: "네이버 로그인 요청이 만료되었습니다. 다시 시도해 주세요.",

  naver_login_failed: "네이버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",

  kakao_login_cancelled: "카카오 로그인이 취소되었습니다.",

  kakao_login_invalid_state: "카카오 로그인 요청이 만료되었습니다. 다시 시도해 주세요.",

  kakao_login_failed: "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",

  google_login_cancelled: "구글 로그인이 취소되었습니다.",

  google_login_invalid_state: "구글 로그인 요청이 만료되었습니다. 다시 시도해 주세요.",

  google_login_failed: "구글 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",

};



function CustomerLoginFormInner({ redirect }: Props) {

  const router = useRouter();

  const searchParams = useSearchParams();

  const { refresh } = useCustomerAuth();

  const [idOrEmail, setIdOrEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [socialCount, setSocialCount] = useState<number | null>(null);



  useEffect(() => {

    const oauthError = searchParams.get("error");

    if (oauthError && OAUTH_ERROR_MESSAGES[oauthError]) {

      setError(OAUTH_ERROR_MESSAGES[oauthError]);

    }

  }, [searchParams]);



  const signupHref = redirect

    ? `${CUSTOMER_SIGNUP_PAGE}?redirect=${encodeURIComponent(redirect)}`

    : CUSTOMER_SIGNUP_PAGE;



  const handleCredentialsLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    setError(null);



    const trimmedId = idOrEmail.trim();

    if (!trimmedId || !password) {

      setError(CREDENTIALS_LOGIN_UNAVAILABLE_MESSAGE);

      return;

    }



    setSubmitting(true);

    try {

      const res = await fetch("/api/auth/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ idOrEmail: trimmedId, password }),

      });

      const data = (await res.json()) as { ok?: boolean; message?: string };



      if (!res.ok || !data.ok) {

        setError(data.message ?? CREDENTIALS_LOGIN_UNAVAILABLE_MESSAGE);

        return;

      }



      await refresh();

      router.push(redirect?.trim() || CUSTOMER_MYPAGE);

    } catch {

      setError(CREDENTIALS_LOGIN_UNAVAILABLE_MESSAGE);

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <div className="bm-auth-form" data-page="customer-login">

      <OAuthHandoffHandler redirect={redirect} onError={setError} />

      <h1 className="bm-auth-form__title">로그인</h1>

      <p className="bm-auth-form__lead">

        네이버·카카오·Google 간편 로그인 또는 아이디로 이용하세요.

      </p>



      {error ? (

        <p className="bm-auth-error" role="alert">

          {error}

        </p>

      ) : null}



      <div className="mt-5">

        <SocialLoginButtons

          redirect={redirect}

          variant="login"

          onAvailability={setSocialCount}

        />

      </div>



      <div className="bm-auth-divider mt-6">

        <span>또는 일반 로그인</span>

      </div>



      <form className="bm-auth-form__fields mt-4" onSubmit={handleCredentialsLogin} noValidate>

        <label className="bm-auth-field">

          <span className="bm-auth-field__label">아이디 또는 이메일</span>

          <input

            type="text"

            autoComplete="username"

            className="bm-auth-field__input"

            placeholder="아이디 또는 이메일"

            value={idOrEmail}

            onChange={(e) => setIdOrEmail(e.target.value)}

          />

        </label>



        <label className="bm-auth-field">

          <span className="bm-auth-field__label">비밀번호</span>

          <input

            type="password"

            autoComplete="current-password"

            className="bm-auth-field__input"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

          />

        </label>



        <button type="submit" disabled={submitting} className="bm-auth-submit">

          {submitting ? "로그인 중…" : "로그인"}

        </button>

      </form>



      <div className="bm-auth-form__links mt-6">

        <Link href={`${HUB_SUPPORT}?tab=inquiry`} className="bm-auth-text-link">

          로그인 문의

        </Link>

        <span className="text-slate-300" aria-hidden>

          ·

        </span>

        <Link href={signupHref} className="bm-auth-text-link">

          회원가입

        </Link>

        <span className="text-slate-300" aria-hidden>

          ·

        </span>

        <Link href={`${HUB_SUPPORT}?tab=inquiry`} className="bm-auth-text-link">

          비밀번호 찾기

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

