import { PageShell } from "@/components/common/PageShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { bm } from "@/lib/design-tokens";

export default function SignupPage() {
  return (
    <PageShell zone="auth" pageLabel="회원가입" title="회원가입" showSearch={false}>
      <div className={`${bm.card} ${bm.cardPad} bm-auth-card`}>
        <p className="text-sm font-medium leading-relaxed text-slate-700">
          회원가입 후 주문 내역과 자주 찾는 차량 정보를 편하게 관리할 수 있습니다. 첫 주문 혜택과
          매장 상담 내역을 더 쉽게 확인할 수 있습니다.
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          상담·택배 주문은 회원가입 없이도 배터리 상세·장바구니에서 이용하실 수 있습니다.
        </p>
        <SignupForm />
      </div>
    </PageShell>
  );
}
