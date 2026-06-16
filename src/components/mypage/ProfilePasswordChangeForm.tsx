"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACCOUNT_RECOVERY_MESSAGES } from "@/lib/auth/account-recovery-messages";
import { CUSTOMER_LOGIN_PAGE } from "@/lib/customer-auth-routes";

type Props = {
  isCredentialsMember: boolean;
  providerLabel?: string;
};

export function ProfilePasswordChangeForm({ isCredentialsMember, providerLabel }: Props) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isCredentialsMember) {
    return (
      <section className="bm-auth-password-section" aria-labelledby="password-change-title">
        <h2 id="password-change-title" className="bm-auth-password-section__title">
          비밀번호 변경
        </h2>
        <p className="bm-auth-password-section__desc">
          {providerLabel ? `${providerLabel} ` : ""}간편 로그인 계정입니다. 비밀번호는 소셜 로그인으로
          관리됩니다.
        </p>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "비밀번호 변경에 실패했습니다.");
        return;
      }
      setSuccess(data.message ?? ACCOUNT_RECOVERY_MESSAGES.passwordChanged);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.push(CUSTOMER_LOGIN_PAGE);
      }, 1200);
    } catch {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bm-auth-password-section" aria-labelledby="password-change-title">
      <h2 id="password-change-title" className="bm-auth-password-section__title">
        비밀번호 변경
      </h2>
      <p className="bm-auth-password-section__desc">현재 비밀번호 확인 후 새 비밀번호를 설정합니다.</p>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm font-bold text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <form className="bm-auth-form__fields mt-3" onSubmit={handleSubmit}>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">현재 비밀번호</span>
          <input
            type="password"
            autoComplete="current-password"
            className="bm-auth-field__input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
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
        <button type="submit" disabled={submitting} className="bm-auth-submit sm:max-w-[12rem]">
          {submitting ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>
    </section>
  );
}
