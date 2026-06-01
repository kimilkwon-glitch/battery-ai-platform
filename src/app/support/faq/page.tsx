import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { CustomerFaqAccordion } from "@/components/support/CustomerFaqAccordion";
import { CustomerConsultCta } from "@/components/support/CustomerConsultCta";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export default function SupportFaqPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="FAQ"
      title="자주 묻는 질문"
      description="주문·배송·교환/반품·폐전지·결제·규격 관련 질문을 모았습니다."
      searchPlaceholder="차량·규격 검색"
    >
      <div className="space-y-6">
        <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnTertiary} text-xs`}>
          ← 고객센터
        </Link>
        <CustomerFaqAccordion />
        <CustomerConsultCta />
      </div>
    </PageShell>
  );
}
