import { PageShell } from "@/components/common/PageShell";
import { PaymentReadyPage } from "@/components/payment/PaymentReadyPage";

export default function PaymentReadyRoutePage() {
  return (
    <PageShell
      zone="support"
      pageLabel="결제 준비"
      title="결제 준비"
      description="결제 예정금액을 확인합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <PaymentReadyPage />
      </div>
    </PageShell>
  );
}
