import { PageShell } from "@/components/common/PageShell";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { TERMS_PAGE } from "@/data/legal-pages";

export default function TermsPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="이용약관"
      title={TERMS_PAGE.title}
      description={TERMS_PAGE.description}
      showFooter
    >
      <div className="mx-auto max-w-3xl">
        <LegalPageLayout page={TERMS_PAGE} />
      </div>
    </PageShell>
  );
}
