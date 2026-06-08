import { PageShell } from "@/components/common/PageShell";
import { PaymentFailPage } from "@/components/payment/PaymentFailPage";

export default function PaymentFailRoutePage() {
  return (
    <PageShell
      zone="checkout"
      pageLabel="결제 실패"
      title="결제 안내"
      description="결제 진행 중 문제가 발생한 경우 안내합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <PaymentFailPage />
      </div>
    </PageShell>
  );
}
