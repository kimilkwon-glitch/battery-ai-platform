import { PageShell } from "@/components/common/PageShell";
import { OrderRequestForm } from "@/components/order-request/OrderRequestForm";

/** 회수·상담 주문 요청 — 비회원 접근 가능 */
export default function OrderRequestPage() {
  return (
    <PageShell
      pageLabel="주문·상담 요청"
      title="주문·상담 요청"
      description="이름·연락처·차량 정보를 입력해 주시면 상담 후 안내드립니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl">
        <OrderRequestForm />
      </div>
    </PageShell>
  );
}
