import { PageShell } from "@/components/common/PageShell";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { BusinessInfoPanel } from "@/components/legal/BusinessInfoPanel";
import { COMPANY_PAGE } from "@/data/legal-pages";

export default function CompanyPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="회사 정보"
      title={COMPANY_PAGE.title}
      description={COMPANY_PAGE.description}
      showFooter
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <BusinessInfoPanel />
        <LegalPageLayout page={COMPANY_PAGE} />
      </div>
    </PageShell>
  );
}
