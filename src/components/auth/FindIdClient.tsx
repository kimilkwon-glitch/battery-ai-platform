"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CUSTOMER_FORGOT_PASSWORD_PAGE,
  CUSTOMER_LOGIN_PAGE,
} from "@/lib/customer-auth-routes";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type VerifyResult =
  | {
      resultType: "credentials";
      loginId: string;
      joinedAt?: string;
    }
  | {
      resultType: "oauth";
      providerLabel: string;
      message: string;
    };

export function FindIdClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "result">("form");
  const [expiresInSec, setExpiresInSec] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    if (expiresInSec <= 0) return;
    const t = window.setInterval(() => setExpiresInSec((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [expiresInSec]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);

  const sendOtp = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/find-id/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        expiresInSec?: number;
        resendCooldownSec?: number;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "인증번호 발송에 실패했습니다.");
        return;
      }
      setInfo(data.message ?? "인증번호를 발송했습니다.");
      setStep("otp");
      setExpiresInSec(data.expiresInSec ?? 300);
      setResendCooldown(data.resendCooldownSec ?? 60);
    } catch {
      setError("인증번호 발송에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/find-id/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, otpCode }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        resultType?: "credentials" | "oauth";
        loginId?: string;
        joinedAt?: string;
        providerLabel?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "인증에 실패했습니다.");
        return;
      }
      if (data.resultType === "oauth") {
        setResult({
          resultType: "oauth",
          providerLabel: data.providerLabel ?? "간편",
          message: data.message ?? "간편 로그인 계정입니다.",
        });
      } else {
        setResult({
          resultType: "credentials",
          loginId: data.loginId ?? "",
          joinedAt: data.joinedAt,
        });
      }
      setStep("result");
    } catch {
      setError("인증에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "result" && result) {
    return (
      <div className="bm-auth-form" data-page="find-id-result">
        <h1 className="bm-auth-form__title">아이디 확인</h1>
        {result.resultType === "credentials" ? (
          <>
            <p className="bm-auth-form__lead">인증이 완료되었습니다. 아래 아이디로 로그인해 주세요.</p>
            <div className="bm-auth-result-box">
              <p className="bm-auth-result-box__label">아이디</p>
              <p className="bm-auth-result-box__value">{result.loginId}</p>
              {result.joinedAt ? (
                <p className="bm-auth-result-box__meta">가입일: {result.joinedAt}</p>
              ) : null}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-submit text-center no-underline">
                로그인하러 가기
              </Link>
              <Link href={CUSTOMER_FORGOT_PASSWORD_PAGE} className="bm-auth-inline-btn text-center no-underline">
                비밀번호 재설정
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="bm-auth-form__lead">{result.message}</p>
            <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-submit mt-4 text-center no-underline">
              로그인하러 가기
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bm-auth-form" data-page="find-id">
      <button type="button" className="bm-auth-back-link" onClick={() => router.back()}>
        ← 뒤로
      </button>
      <h1 className="bm-auth-form__title">아이디 찾기</h1>
      <p className="bm-auth-form__lead">가입 시 입력한 이름과 휴대폰 번호로 본인 확인 후 아이디를 안내합니다.</p>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="bm-auth-info" role="status">
          {info}
        </p>
      ) : null}

      <div className="bm-auth-form__fields mt-4">
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">이름</span>
          <input
            type="text"
            autoComplete="name"
            className="bm-auth-field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={step === "otp"}
          />
        </label>

        <label className="bm-auth-field">
          <span className="bm-auth-field__label">휴대폰 번호</span>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            className="bm-auth-field__input"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            disabled={step === "otp"}
          />
        </label>

        {step === "otp" ? (
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">인증번호 (6자리)</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="bm-auth-field__input"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {expiresInSec > 0 ? (
              <span className="bm-auth-field__hint">남은 시간 {Math.floor(expiresInSec / 60)}:{String(expiresInSec % 60).padStart(2, "0")}</span>
            ) : (
              <span className="bm-auth-field__hint bm-auth-field__hint--warn">인증번호가 만료되었습니다.</span>
            )}
          </label>
        ) : null}

        {step === "form" ? (
          <button type="button" className="bm-auth-submit" disabled={submitting} onClick={() => void sendOtp()}>
            {submitting ? "발송 중…" : "인증번호 발송"}
          </button>
        ) : (
          <>
            <button type="button" className="bm-auth-submit" disabled={submitting || otpCode.length !== 6} onClick={() => void verifyOtp()}>
              {submitting ? "확인 중…" : "인증 완료"}
            </button>
            <button
              type="button"
              className="bm-auth-inline-btn"
              disabled={submitting || resendCooldown > 0}
              onClick={() => void sendOtp()}
            >
              {resendCooldown > 0 ? `재발송 (${resendCooldown}초)` : "인증번호 재발송"}
            </button>
          </>
        )}
      </div>

      <div className="bm-auth-form__links mt-6">
        <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-text-link">
          로그인
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href={`${HUB_SUPPORT}?tab=inquiry`} className="bm-auth-text-link">
          로그인 문의
        </Link>
      </div>
    </div>
  );
}
