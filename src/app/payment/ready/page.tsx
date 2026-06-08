import { PageShell } from "@/components/common/PageShell";
import { PaymentReadyPage } from "@/components/payment/PaymentReadyPage";

export default function PaymentReadyRoutePage() {
  return (
    <PageShell
      zone="checkout"
      pageLabel="주문 및 결제"
      title="주문 및 결제"
      description="결제를 이어서 진행합니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto w-full max-w-6xl space-y-4 px-0 sm:px-1">
        <PaymentReadyPage />
      </div>
    </PageShell>
  );
}
