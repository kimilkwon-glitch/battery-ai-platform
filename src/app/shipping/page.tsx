import { PageShell } from "@/components/common/PageShell";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SHIPPING_PAGE } from "@/data/legal-pages";

export default function ShippingPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="배송 안내"
      title={SHIPPING_PAGE.title}
      description={SHIPPING_PAGE.description}
      showFooter
    >
      <div className="mx-auto max-w-3xl">
        <LegalPageLayout page={SHIPPING_PAGE} />
      </div>
    </PageShell>
  );
}
