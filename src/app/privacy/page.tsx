import { PageShell } from "@/components/common/PageShell";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { PRIVACY_PAGE } from "@/data/legal-pages";

export default function PrivacyPage() {
  return (
    <PageShell
      zone="legal"
      pageLabel="개인정보"
      title={PRIVACY_PAGE.title}
      description={PRIVACY_PAGE.description}
      showFooter
    >
      <div className="mx-auto max-w-3xl">
        <LegalPageLayout page={PRIVACY_PAGE} />
      </div>
    </PageShell>
  );
}
