"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { bm } from "@/lib/design-tokens";

const LOGIN_ERROR = "아이디 또는 비밀번호를 확인해 주세요.";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      if (!res.ok) {
        setError(true);
        setSubmitting(false);
        return;
      }
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-slate-50 p-4 sm:p-8"
      data-admin-console
      data-page="admin-login"
    >
      <div className="mx-auto max-w-md">
        <div className={`${bm.card} ${bm.cardPad} space-y-4`}>
          <p className={bm.label}>Battery Manager</p>
          <h1 className="text-lg font-black text-slate-950">관리자 로그인</h1>
          <p className="text-sm font-medium text-slate-600">
            운영 콘솔은 인증된 관리자만 접근할 수 있습니다.
          </p>
          <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block text-xs font-black text-slate-800">
              관리자 아이디
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="block text-xs font-black text-slate-800">
              비밀번호
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error ? (
              <p className="text-xs font-bold text-red-700" role="alert">
                {LOGIN_ERROR}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className={`${bm.btnNavy} w-full justify-center py-3 text-sm disabled:opacity-50`}
            >
              {submitting ? "확인 중…" : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
