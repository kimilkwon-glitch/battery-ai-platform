import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { BatteryDetailClient } from "@/components/battery/BatteryDetailClient";
import { BatteryNavFooter } from "@/components/battery/BatteryNavFooter";
import { BatteryActivityTracker } from "@/components/battery/BatteryActivityTracker";
import { isRetiredBatterySpec } from "@/lib/batteryNormalize";
import { getBatteryDetailData } from "@/lib/vehicleBattery";

export default async function BatteryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  if (isRetiredBatterySpec(decoded)) {
    redirect(`/batteries/${encodeURIComponent("DIN74R")}`);
  }
  const data = getBatteryDetailData(decoded);

  return (
    <PageShell
      pageLabel={data.code}
      title={data.code}
      description="배터리 규격 · 호환 차량 · 단자 방향 · 비교·가이드"
      searchPlaceholder={`${data.code} 호환 차종 검색`}
    >
      <BatteryActivityTracker code={data.code} />
      <Suspense fallback={null}>
        <BatteryDetailClient code={data.code} relatedCodes={data.relatedCodes} vehicles={data.vehicles} />
      </Suspense>
      <div className="mt-4">
        <BatteryNavFooter code={data.code} />
      </div>
    </PageShell>
  );
}
