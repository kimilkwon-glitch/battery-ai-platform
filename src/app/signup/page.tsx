import { PageShell } from "@/components/common/PageShell";
import { SignupStubForm } from "@/components/auth/AuthStubForms";
import { bm } from "@/lib/design-tokens";

export default function SignupPage() {
  return (
    <PageShell zone="auth" pageLabel="회원가입" title="회원가입" showSearch={false}>
      <div className={`${bm.card} ${bm.cardPad} bm-auth-card`}>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          상담·택배 주문은 배터리 상세 페이지에서 계속 이용하실 수 있습니다. 회원가입·주문 내역 저장은
          인증 연동 후 제공됩니다.
        </p>
        <SignupStubForm />
      </div>
    </PageShell>
  );
}
