import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { bm } from "@/lib/design-tokens";

/** 실제 회원 DB·개인정보 저장 없음 — UI·안내만 */
export default function SignupPage() {
  return (
    <PageShell zone="auth" pageLabel="회원가입" title="회원가입" showSearch={false}>
      <div className={`${bm.card} ${bm.cardPad} bm-auth-card`}>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          회원가입·주문 내역 저장은 인증·DB 연동 후 제공 예정입니다. (Supabase/Firebase 등 별도
          연동 필요)
        </p>
        <form className="mt-6 space-y-3 opacity-60" aria-disabled>
          {["이름", "휴대폰번호", "이메일 (선택)", "비밀번호", "차량명/차량번호 (선택)"].map(
            (label) => (
              <label key={label} className="block text-sm font-bold text-slate-700">
                {label}
                <input disabled className={`${bm.input} bm-input-field mt-1`} />
              </label>
            ),
          )}
          <button type="button" disabled className={`${bm.btnPrimary} w-full opacity-50`}>
            가입하기 (준비중)
          </button>
        </form>
        <p className="mt-4 text-center text-xs font-semibold text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-black text-blue-700 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
