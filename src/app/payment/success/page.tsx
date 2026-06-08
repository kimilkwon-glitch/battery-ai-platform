import { PageShell } from "@/components/common/PageShell";
import { PaymentSuccessPage } from "@/components/payment/PaymentSuccessPage";

export default function PaymentSuccessRoutePage() {
  return (
    <PageShell
      zone="checkout"
      pageLabel="결제 완료"
      title="결제 결과"
      description="결제 완료 여부를 확인합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <PaymentSuccessPage />
      </div>
    </PageShell>
  );
}
