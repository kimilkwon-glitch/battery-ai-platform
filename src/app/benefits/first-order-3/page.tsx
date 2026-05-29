import { PageShell } from "@/components/common/PageShell";
import { FirstOrder3BenefitClient } from "@/components/benefits/FirstOrder3BenefitClient";

export default function FirstOrder3BenefitPage() {
  return (
    <PageShell
      zone="benefit"
      pageLabel="첫 주문 3% 혜택"
      title="첫 주문 3% 혜택"
      description="조건 확인 후 적용 가능한 혜택입니다. 쿠폰은 상담 시 제시해 주세요."
      showSearch
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <FirstOrder3BenefitClient />
    </PageShell>
  );
}
