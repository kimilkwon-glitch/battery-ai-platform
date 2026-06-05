import { PageShell } from "@/components/common/PageShell";
import { GuestOrderForm } from "@/components/guest-order/GuestOrderForm";

export default function GuestOrderPage() {
  return (
    <PageShell
      zone="default"
      pageLabel="비회원 주문"
      title="비회원 주문 요청"
      description="회원가입 없이 주문 요청을 접수합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <GuestOrderForm />
      </div>
    </PageShell>
  );
}
