import { PageShell } from "@/components/common/PageShell";
import { SupportCenterClient } from "@/components/support/SupportCenterClient";

export default function SupportPage() {
  return (
    <PageShell pageLabel="고객센터" searchPlaceholder="차량·규격 검색">
      <SupportCenterClient />
    </PageShell>
  );
}
