import { PageShell } from "@/components/common/PageShell";
import { BenefitDetailClient } from "@/components/benefits/BenefitDetailClient";
import { BASIC_SERVICE_BENEFIT } from "@/lib/benefits-data";

export default function BasicServiceBenefitPage() {
  return (
    <PageShell
      zone="benefit"
      pageLabel={BASIC_SERVICE_BENEFIT.label}
      title={BASIC_SERVICE_BENEFIT.title}
      description={BASIC_SERVICE_BENEFIT.description}
      showSearch
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <BenefitDetailClient benefit={BASIC_SERVICE_BENEFIT} />
    </PageShell>
  );
}
