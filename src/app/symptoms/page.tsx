import { PageShell } from "@/components/common/PageShell";
import { SymptomsHubClient } from "@/components/platform/hub/SymptomsHubClient";

export const dynamic = "force-dynamic";

export default function SymptomsHubPage() {
  return (
    <PageShell
      pageLabel="증상 안내"
      title="시동·방전 증상별 안내"
      description="시동 지연·방전·보조 12V 문제부터 배터리 점검·검색·문의로 이어집니다."
      searchPlaceholder="증상·차종 검색"
    >
      <SymptomsHubClient />
    </PageShell>
  );
}
