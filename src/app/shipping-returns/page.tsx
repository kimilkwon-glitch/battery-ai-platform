import { PageShell } from "@/components/common/PageShell";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SHIPPING_RETURNS_PAGE } from "@/data/legal-pages";

export default function ShippingReturnsPage() {
  return (
    <PageShell
      zone="legal"
      pageLabel="배송·교환·반품·환불"
      title={SHIPPING_RETURNS_PAGE.title}
      description={SHIPPING_RETURNS_PAGE.description}
      showFooter
    >
      <div className="mx-auto max-w-3xl">
        <LegalPageLayout page={SHIPPING_RETURNS_PAGE} />
      </div>
    </PageShell>
  );
}
