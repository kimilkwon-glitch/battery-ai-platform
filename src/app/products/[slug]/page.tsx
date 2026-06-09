import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { BatteryActivityTracker } from "@/components/battery/BatteryActivityTracker";
import { BatteryDetailHub } from "@/components/battery/BatteryDetailHub";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { parseBatteryProductSlug } from "@/lib/battery-product-routes";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isRetiredBatterySpec } from "@/lib/batteryNormalize";
import { getBatteryDetailData } from "@/lib/vehicleBattery";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function BatteryProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  noStore();
  const { slug } = await params;
  const parsed = parseBatteryProductSlug(decodeURIComponent(slug));
  if (!parsed) notFound();

  const displayCode = canonicalBatteryCode(parsed.batteryCode) || parsed.batteryCode;
  if (isRetiredBatterySpec(displayCode)) notFound();

  const data = getBatteryDetailData(displayCode);
  const brandLabel =
    parsed.brandId === "rocket"
      ? "로케트"
      : parsed.brandId === "solite"
        ? "쏠라이트"
        : parsed.brandId;

  return (
    <PageShell
      zone="product"
      pageLabel={`${brandLabel} ${displayCode}`}
      searchPlaceholder={`${displayCode} 호환 차종 검색`}
      showPageHeader={false}
    >
      <div data-product-slug={slug} data-build-stamp={BUILD_STAMP} className="contents">
        <BatteryActivityTracker code={displayCode} />
        <Suspense fallback={null}>
          <BatteryDetailHub
            code={displayCode}
            vehicles={data.vehicles}
            relatedCodes={data.relatedCodes}
          />
        </Suspense>
      </div>
    </PageShell>
  );
}
