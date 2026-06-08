import { PageShell } from "@/components/common/PageShell";
import { UsedBatteryReturnGuide } from "@/components/customer/UsedBatteryReturnGuide";
import { USED_BATTERY_GUIDE_COPY } from "@/data/used-battery-return-guide";

export default function SupportUsedBatteryReturnPage() {
  return (
    <PageShell
      zone="legal"
      pageLabel="폐전지 반납"
      title={USED_BATTERY_GUIDE_COPY.title}
      description={USED_BATTERY_GUIDE_COPY.description}
      searchPlaceholder="차량·규격 검색"
    >
      <UsedBatteryReturnGuide />
    </PageShell>
  );
}
