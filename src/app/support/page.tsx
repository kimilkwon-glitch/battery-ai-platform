import { PageShell } from "@/components/common/PageShell";
import { SupportCenterClient } from "@/components/support/SupportCenterClient";

export default function SupportPage() {
  return (
    <PageShell
      zone="support"
      pageLabel="고객센터"
      title="고객센터"
      description="공지사항, 자주 묻는 질문, 문의 접수를 한곳에서 확인하세요."
      searchPlaceholder="차량·규격 검색"
    >
      <SupportCenterClient />
    </PageShell>
  );
}
