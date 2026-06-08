import { PageShell } from "@/components/common/PageShell";
import { CustomerGuideLayout } from "@/components/support/CustomerGuideLayout";
import { DELIVERY_GUIDE_PAGE } from "@/data/customer-guide";

export default function SupportDeliveryPage() {
  return (
    <PageShell
      zone="legal"
      pageLabel="배송 안내"
      title={DELIVERY_GUIDE_PAGE.title}
      description={DELIVERY_GUIDE_PAGE.description}
      searchPlaceholder="차량·규격 검색"
    >
      <CustomerGuideLayout guide={DELIVERY_GUIDE_PAGE} />
    </PageShell>
  );
}
