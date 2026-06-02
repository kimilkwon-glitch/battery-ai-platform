"use client";

import Link from "next/link";
import { useState } from "react";
import { bm } from "@/lib/design-tokens";
import { HUB_LOGIN, HUB_SIGNUP } from "@/lib/customer-hub-routes";

function AuthToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <p
      role="status"
      className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-100"
    >
      {message}{" "}
      <button type="button" className="ml-1 font-black underline" onClick={onClose}>
        닫기
      </button>
    </p>
  );
}

export function LoginStubForm() {
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast("준비 중입니다. 상담 주문은 계속 이용하실 수 있습니다.");
  };

  return (
    <>
      {toast ? <AuthToast message={toast} onClose={() => setToast(null)} /> : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-bold text-slate-700">
          휴대폰번호 또는 이메일
          <input
            type="text"
            autoComplete="username"
            className={`${bm.input} bm-input-field mt-1`}
            placeholder="010-0000-0000 또는 email@example.com"
          />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          비밀번호
          <input
            type="password"
            autoComplete="current-password"
            className={`${bm.input} bm-input-field mt-1`}
          />
        </label>
        <button type="submit" className={`${bm.btnPrimary} w-full min-h-[3rem] text-base font-black`}>
          로그인
        </button>
      </form>
      <p className="mt-4 text-center text-sm font-semibold text-slate-500">
        계정이 없으신가요?{" "}
        <Link href={HUB_SIGNUP} className="font-black text-blue-700 hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}

export function SignupStubForm() {
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast("준비 중입니다. 상담 주문은 계속 이용하실 수 있습니다.");
  };

  return (
    <>
      {toast ? <AuthToast message={toast} onClose={() => setToast(null)} /> : null}
      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm font-bold text-slate-700">
          이름
          <input type="text" autoComplete="name" className={`${bm.input} bm-input-field mt-1`} />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          휴대폰 번호
          <input
            type="tel"
            autoComplete="tel"
            className={`${bm.input} bm-input-field mt-1`}
            placeholder="010-0000-0000"
          />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          이메일
          <input
            type="email"
            autoComplete="email"
            className={`${bm.input} bm-input-field mt-1`}
            placeholder="선택 입력"
          />
        </label>
        <label className="block text-sm font-bold text-slate-700">
          비밀번호
          <input
            type="password"
            autoComplete="new-password"
            className={`${bm.input} bm-input-field mt-1`}
          />
        </label>
        <button type="submit" className={`${bm.btnPrimary} w-full min-h-[3rem] text-base font-black`}>
          회원가입
        </button>
      </form>
      <p className="mt-4 text-center text-sm font-semibold text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link href={HUB_LOGIN} className="font-black text-blue-700 hover:underline">
          로그인
        </Link>
      </p>
    </>
  );
}
