import { PageShell } from "@/components/common/PageShell";
import { BenefitDetailClient } from "@/components/benefits/BenefitDetailClient";
import { STORE_VISIT_DISCOUNT_BENEFIT } from "@/lib/benefits-data";

export default function StoreVisitDiscountBenefitPage() {
  return (
    <PageShell
      zone="benefit"
      pageLabel={STORE_VISIT_DISCOUNT_BENEFIT.label}
      title={STORE_VISIT_DISCOUNT_BENEFIT.title}
      description={STORE_VISIT_DISCOUNT_BENEFIT.description}
      showSearch
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <BenefitDetailClient benefit={STORE_VISIT_DISCOUNT_BENEFIT} />
    </PageShell>
  );
}
