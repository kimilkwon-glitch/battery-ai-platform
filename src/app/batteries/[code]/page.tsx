import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { BatteryDetailHub } from "@/components/battery/BatteryDetailHub";
import { BatteryActivityTracker } from "@/components/battery/BatteryActivityTracker";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isRetiredBatterySpec } from "@/lib/batteryNormalize";
import { getBatteryDetailData } from "@/lib/vehicleBattery";
import { BUILD_STAMP } from "@/lib/build-stamp";

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
  const data = getBatteryDetailData(displayCode);

  return (
    <PageShell
      pageLabel={displayCode}
      title={displayCode}
      description="배터리 규격 안내 · 호환 차량 · 오주문 방지 · 택배·사진 확인"
      searchPlaceholder={`${displayCode} 호환 차종 검색`}
    >
      <div data-battery-route-build-stamp={BUILD_STAMP} className="contents">
      <BatteryActivityTracker code={displayCode} />
      <Suspense fallback={null}>
        <BatteryDetailHub
          code={decoded.trim() || displayCode}
          vehicles={data.vehicles}
          relatedCodes={data.relatedCodes}
        />
      </Suspense>
      </div>
    </PageShell>
  );
}
