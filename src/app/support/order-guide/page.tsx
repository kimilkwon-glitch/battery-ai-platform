import { PageShell } from "@/components/common/PageShell";
import { CustomerGuideLayout } from "@/components/support/CustomerGuideLayout";
import { ORDER_GUIDE_PAGE } from "@/data/customer-guide";

export default function SupportOrderGuidePage() {
  return (
    <PageShell
      zone="support"
      pageLabel="주문 안내"
      title={ORDER_GUIDE_PAGE.title}
      description={ORDER_GUIDE_PAGE.description}
      searchPlaceholder="차량·규격 검색"
    >
      <CustomerGuideLayout guide={ORDER_GUIDE_PAGE} />
    </PageShell>
  );
}
