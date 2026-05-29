import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { bm } from "@/lib/design-tokens";

/** 실제 인증 백엔드 없음 — UI·안내만 제공 */
export default function LoginPage() {
  return (
    <PageShell zone="auth" pageLabel="로그인" title="로그인" showSearch={false}>
      <div className={`${bm.card} ${bm.cardPad} bm-auth-card`}>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 ring-1 ring-amber-100">
          회원 로그인·주문 내역 기능은 준비 중입니다. 상담·주문은 배터리 상세페이지 또는 채팅상담을
          이용해 주세요.
        </p>
        <form className="mt-6 space-y-4 opacity-60" aria-disabled>
          <label className="block text-sm font-bold text-slate-700">
            휴대폰번호 또는 이메일
            <input
              disabled
              className={`${bm.input} bm-input-field mt-1`}
              placeholder="준비중"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            비밀번호
            <input
              disabled
              type="password"
              className={`${bm.input} bm-input-field mt-1`}
            />
          </label>
          <button type="button" disabled className={`${bm.btnPrimary} w-full opacity-50`}>
            로그인 (준비중)
          </button>
        </form>
        <p className="mt-4 text-center text-xs font-semibold text-slate-500">
          <Link href="/signup" className="font-black text-blue-700 hover:underline">
            회원가입
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          <span>비밀번호 찾기 (준비중)</span>
        </p>
      </div>
    </PageShell>
  );
}
