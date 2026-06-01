import { PageShell } from "@/components/common/PageShell";
import { FirstOrder3BenefitClient } from "@/components/benefits/FirstOrder3BenefitClient";

export default function FirstOrder3BenefitPage() {
  return (
    <PageShell
      zone="benefit"
      pageLabel="회원 가입"
      title="첫 주문 3% 혜택"
      description="조건 확인 후 적용 가능한 혜택입니다."
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <FirstOrder3BenefitClient />
    </PageShell>
  );
}
