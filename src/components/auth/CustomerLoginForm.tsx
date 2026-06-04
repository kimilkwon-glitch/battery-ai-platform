"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setCustomerSession } from "@/lib/customer-auth-session";
import { HUB_MYPAGE, HUB_SIGNUP } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

type Props = {
  redirect?: string | null;
};

export function CustomerLoginForm({ redirect }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signupHref = redirect
    ? `${HUB_SIGNUP}?redirect=${encodeURIComponent(redirect)}&action=saveVehicle`
    : HUB_SIGNUP;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError("휴대폰번호 또는 이메일을 입력해 주세요.");
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
      router.push(redirect?.trim() || HUB_MYPAGE);
    } catch {
      setError("로그인 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800 ring-1 ring-red-100">
          {error}
        </p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-bold text-slate-700">
          휴대폰번호 또는 이메일
          <input
            type="text"
            autoComplete="username"
            required
            className={`${bm.input} bm-input-field mt-1`}
            placeholder="010-0000-0000 또는 email@example.com"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          비밀번호
          <input
            type="password"
            autoComplete="current-password"
            required
            className={`${bm.input} bm-input-field mt-1`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className={`${bm.btnPrimary} w-full min-h-[3rem] text-base font-black`}
        >
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm font-semibold text-slate-500">
        계정이 없으신가요?{" "}
        <Link href={signupHref} className="font-black text-blue-700 hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}
