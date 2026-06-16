"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CUSTOMER_FORGOT_PASSWORD_PAGE, CUSTOMER_LOGIN_PAGE } from "@/lib/customer-auth-routes";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const userId = searchParams.get("uid")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token || !userId) {
    return (
      <div className="bm-auth-form" data-page="reset-password-invalid">
        <h1 className="bm-auth-form__title">비밀번호 재설정</h1>
        <p className="bm-auth-error" role="alert">
          유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 진행해 주세요.
        </p>
        <Link href={CUSTOMER_FORGOT_PASSWORD_PAGE} className="bm-auth-submit mt-4 text-center no-underline">
          비밀번호 찾기
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, userId, newPassword, confirmPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "비밀번호 변경에 실패했습니다.");
        return;
      }
      setDone(true);
    } catch {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bm-auth-form" data-page="reset-password-done">
        <h1 className="bm-auth-form__title">비밀번호 변경 완료</h1>
        <p className="bm-auth-form__lead">비밀번호가 변경되었습니다. 다시 로그인해 주세요.</p>
        <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-submit mt-4 text-center no-underline">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="bm-auth-form" data-page="reset-password">
      <button type="button" className="bm-auth-back-link" onClick={() => router.back()}>
        ← 뒤로
      </button>
      <h1 className="bm-auth-form__title">새 비밀번호 설정</h1>
      <p className="bm-auth-form__lead">8자 이상의 새 비밀번호를 입력해 주세요.</p>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields mt-4" onSubmit={handleSubmit}>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">새 비밀번호</span>
          <input
            type="password"
            autoComplete="new-password"
            className="bm-auth-field__input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">새 비밀번호 확인</span>
          <input
            type="password"
            autoComplete="new-password"
            className="bm-auth-field__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}

export function ResetPasswordClient() {
  return (
    <Suspense fallback={<div className="bm-auth-form">불러오는 중…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
