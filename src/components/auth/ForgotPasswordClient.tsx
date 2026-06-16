"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CUSTOMER_FIND_ID_PAGE, CUSTOMER_LOGIN_PAGE } from "@/lib/customer-auth-routes";

export function ForgotPasswordClient() {
  const router = useRouter();
  const [idOrEmail, setIdOrEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idOrEmail: idOrEmail.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "요청 처리에 실패했습니다.");
        return;
      }
      setSent(true);
      setMessage(
        data.message ??
          "입력하신 정보와 일치하는 계정이 있다면 가입 이메일로 비밀번호 재설정 안내를 발송했습니다.",
      );
    } catch {
      setError("요청 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bm-auth-form" data-page="forgot-password">
      <button type="button" className="bm-auth-back-link" onClick={() => router.back()}>
        ← 뒤로
      </button>
      <h1 className="bm-auth-form__title">비밀번호 찾기</h1>
      <p className="bm-auth-form__lead">
        아이디 또는 가입 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
      </p>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="bm-auth-info" role="status">
          {message}
        </p>
      ) : null}

      {!sent ? (
        <form className="bm-auth-form__fields mt-4" onSubmit={handleSubmit}>
          <label className="bm-auth-field">
            <span className="bm-auth-field__label">아이디 또는 이메일</span>
            <input
              type="text"
              autoComplete="username"
              className="bm-auth-field__input"
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={submitting} className="bm-auth-submit">
            {submitting ? "발송 중…" : "재설정 메일 보내기"}
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="bm-auth-inline-btn"
            disabled={submitting}
            onClick={() => {
              setSent(false);
              void handleSubmit({ preventDefault: () => undefined } as React.FormEvent);
            }}
          >
            메일 다시 보내기
          </button>
        </div>
      )}

      <div className="bm-auth-form__links mt-6">
        <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-text-link">
          로그인
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href={CUSTOMER_FIND_ID_PAGE} className="bm-auth-text-link">
          아이디 찾기
        </Link>
      </div>
    </div>
  );
}
