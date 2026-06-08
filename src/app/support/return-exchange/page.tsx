import { PageShell } from "@/components/common/PageShell";
import { CustomerGuideLayout } from "@/components/support/CustomerGuideLayout";
import { RETURN_EXCHANGE_GUIDE_PAGE } from "@/data/customer-guide";

export default function SupportReturnExchangePage() {
  return (
    <PageShell
      zone="legal"
      pageLabel="교환/반품"
      title={RETURN_EXCHANGE_GUIDE_PAGE.title}
      description={RETURN_EXCHANGE_GUIDE_PAGE.description}
      searchPlaceholder="차량·규격 검색"
    >
      <CustomerGuideLayout guide={RETURN_EXCHANGE_GUIDE_PAGE} />
    </PageShell>
  );
}
