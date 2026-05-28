import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { BatteryDetailHub } from "@/components/battery/BatteryDetailHub";
import { BatteryDetailClient } from "@/components/battery/BatteryDetailClient";
import { resolveCoreBatteryHubCode } from "@/lib/battery-detail/core-battery-codes";
import { BatteryNavFooter } from "@/components/battery/BatteryNavFooter";
import { BatteryActivityTracker } from "@/components/battery/BatteryActivityTracker";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isRetiredBatterySpec } from "@/lib/batteryNormalize";
import { getBatteryDetailData } from "@/lib/vehicleBattery";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function BatteryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  noStore();
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  if (isRetiredBatterySpec(decoded)) {
    redirect(`/batteries/${encodeURIComponent("DIN74R")}`);
  }
  const displayCode = canonicalBatteryCode(decoded) || decoded.trim().toUpperCase();
  const hubCode = resolveCoreBatteryHubCode(decoded) ?? resolveCoreBatteryHubCode(displayCode);
  const data = getBatteryDetailData(displayCode);

  return (
    <PageShell
      pageLabel={displayCode}
      title={displayCode}
      description="배터리 규격 허브 · 호환 차량 · 오주문 방지 · 택배·사진확인 CTA"
      searchPlaceholder={`${displayCode} 호환 차종 검색`}
    >
      <BatteryActivityTracker code={displayCode} />
      <Suspense fallback={null}>
        {hubCode ? (
          <BatteryDetailHub code={hubCode} vehicles={data.vehicles} />
        ) : (
          <BatteryDetailClient
            code={displayCode}
            relatedCodes={data.relatedCodes}
            vehicles={data.vehicles}
          />
        )}
      </Suspense>
      <div className="mt-4">
        <BatteryNavFooter code={displayCode} />
      </div>
    </PageShell>
  );
}
