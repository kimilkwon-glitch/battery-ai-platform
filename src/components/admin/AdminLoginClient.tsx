"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { bm } from "@/lib/design-tokens";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [accessKey, setAccessKey] = useState("");
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
        body: JSON.stringify({ accessKey: accessKey.trim() }),
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
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-md">
        <div className={`${bm.card} ${bm.cardPad} space-y-4`}>
          <p className={bm.label}>Battery Manager</p>
          <h1 className="text-lg font-black text-slate-950">관리자 접근이 필요합니다</h1>
          <p className="text-sm font-medium text-slate-600">
            이 페이지는 내부 운영 확인용입니다. 발급받은 접근 키를 입력해 주세요.
          </p>
          <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block text-xs font-black text-slate-800">
              접근 키
              <input
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
              />
            </label>
            {error ? (
              <p className="text-xs font-bold text-red-700" role="alert">
                접근 정보를 확인할 수 없습니다.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className={`${bm.btnNavy} w-full justify-center py-3 text-sm disabled:opacity-50`}
            >
              {submitting ? "확인 중…" : "접근하기"}
            </button>
          </form>
          <p className="text-[10px] font-medium text-slate-500">
            운영 환경에서는 ADMIN_ACCESS_KEY 환경변수로 키를 설정합니다. 키는 브라우저에
            저장되지 않으며 httpOnly 세션 쿠키만 사용합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
