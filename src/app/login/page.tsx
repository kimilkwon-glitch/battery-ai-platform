import { PageShell } from "@/components/common/PageShell";
import { LoginStubForm } from "@/components/auth/AuthStubForms";
import { bm } from "@/lib/design-tokens";

export default function LoginPage() {
  return (
    <PageShell zone="auth" pageLabel="로그인" title="로그인" showSearch={false}>
      <div className={`${bm.card} ${bm.cardPad} bm-auth-card`}>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          로그인하면 주문 내역, 내 차량 정보, 혜택을 확인할 수 있습니다. 상담·택배 주문은 로그인
          없이도 배터리 상세·장바구니에서 이용하실 수 있습니다.
        </p>
        <LoginStubForm />
      </div>
    </PageShell>
  );
}
