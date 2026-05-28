import { PageShell } from "@/components/common/PageShell";
import { SymptomsHubClient } from "@/components/platform/hub/SymptomsHubClient";

export const dynamic = "force-dynamic";

export default function SymptomsHubPage() {
  return (
    <PageShell
      pageLabel="증상 진단"
      title="증상 진단 허브"
      description="시동지연·방전·보조배터리 증상부터 배터리 점검·검색·문의로 이어집니다."
      searchPlaceholder="증상·차종 검색"
    >
      <SymptomsHubClient />
    </PageShell>
  );
}
