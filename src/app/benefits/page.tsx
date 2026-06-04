import { PageShell } from "@/components/common/PageShell";
import { BenefitsHubClient } from "@/components/benefits/BenefitsHubClient";
import { BENEFITS_HUB_TITLE } from "@/lib/benefits-data";

export default function BenefitsPage() {
  return (
    <PageShell
      zone="benefit"
      pageLabel="혜택"
      title={BENEFITS_HUB_TITLE}
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <BenefitsHubClient />
    </PageShell>
  );
}
