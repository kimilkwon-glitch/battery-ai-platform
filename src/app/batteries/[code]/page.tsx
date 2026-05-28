import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { BatteryDetailClient } from "@/components/battery/BatteryDetailClient";
import { BatteryNavFooter } from "@/components/battery/BatteryNavFooter";
import { BatteryActivityTracker } from "@/components/battery/BatteryActivityTracker";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isRetiredBatterySpec } from "@/lib/batteryNormalize";
import { getBatteryDetailData } from "@/lib/vehicleBattery";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function BatteryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  if (isRetiredBatterySpec(decoded)) {
    redirect(`/batteries/${encodeURIComponent("DIN74R")}`);
  }
  const displayCode = canonicalBatteryCode(decoded) || decoded.trim().toUpperCase();
  const data = getBatteryDetailData(displayCode);

  return (
    <PageShell
      pageLabel={displayCode}
      title={displayCode}
      description="배터리 규격 · 호환 차량 · 단자 방향 · 비교·가이드"
      searchPlaceholder={`${displayCode} 호환 차종 검색`}
    >
      <BatteryActivityTracker code={displayCode} />
      <Suspense fallback={null}>
        <BatteryDetailClient code={displayCode} relatedCodes={data.relatedCodes} vehicles={data.vehicles} />
      </Suspense>
      <div className="mt-4">
        <BatteryNavFooter code={displayCode} />
      </div>
    </PageShell>
  );
}
