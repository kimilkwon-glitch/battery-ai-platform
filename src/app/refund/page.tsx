import { PageShell } from "@/components/common/PageShell";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { REFUND_PAGE } from "@/data/legal-pages";

export default function RefundPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="교환/환불"
      title={REFUND_PAGE.title}
      description={REFUND_PAGE.description}
      showFooter
    >
      <div className="mx-auto max-w-3xl">
        <LegalPageLayout page={REFUND_PAGE} />
      </div>
    </PageShell>
  );
}
