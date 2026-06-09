import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { BankTransferNotice } from "@/components/order/BankTransferNotice";
import { BankTransferStatusCard } from "@/components/order/BankTransferStatusCard";
import {
  BANK_TRANSFER_POLICY_LINKS,
  ORDER_COMPLETE_DEMO_COPY,
  ORDER_COMPLETE_DEMO_ORDER,
} from "@/data/bank-transfer-policy";
import { bm } from "@/lib/design-tokens";

export default function OrderCompleteDemoPage() {
  const order = ORDER_COMPLETE_DEMO_ORDER;

  return (
    <PageShell
      pageLabel="주문 완료"
      title="주문 완료 안내"
      description="무통장 입금 주문 접수 후 입금·배송 준비 안내입니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="mx-auto max-w-2xl space-y-6" data-page="order-complete-demo">
        <p className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm font-medium leading-relaxed text-blue-900">
          {ORDER_COMPLETE_DEMO_COPY.banner}
        </p>

        <BankTransferStatusCard
          orderNumber={order.orderNumber}
          paymentMethod={order.paymentMethod}
          depositDeadline={order.depositDeadline}
          depositAmount={order.depositAmount}
          bankName={order.bankName}
          bankAccount={order.bankAccount}
          status={order.status}
          showDemoNote
        />

        <BankTransferNotice />

        <div className="flex flex-wrap gap-2">
          <Link className={bm.btnSecondary} href={BANK_TRANSFER_POLICY_LINKS.orderGuide}>
            무통장 입금 안내 전체
          </Link>
          <Link className={bm.btnTertiary} href={BANK_TRANSFER_POLICY_LINKS.customerHub}>
            고객센터
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
