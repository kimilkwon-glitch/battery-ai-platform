import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { BatterySpecDetailView } from "@/components/battery/BatterySpecDetailView";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isRetiredBatterySpec } from "@/lib/batteryNormalize";
import { getBatteryDetailData } from "@/lib/vehicleBattery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BatterySpecDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  noStore();
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  if (isRetiredBatterySpec(decoded)) {
    redirect(`/battery-specs/${encodeURIComponent("DIN74R")}`);
  }
  const displayCode = canonicalBatteryCode(decoded) || decoded.trim().toUpperCase();
  const data = getBatteryDetailData(displayCode);

  return (
    <PageShell
      pageLabel={displayCode}
      title={`${displayCode} 규격 안내`}
      description="용량·CCA·사이즈·단자 방향과 대표 적용 차량을 확인하세요."
      searchPlaceholder={`${displayCode} 호환 차종 검색`}
    >
      <BatterySpecDetailView
        code={displayCode}
        vehicles={data.vehicles.map((v) => ({ slug: v.slug, title: v.title }))}
      />
    </PageShell>
  );
}
