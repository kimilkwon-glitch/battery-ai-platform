import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { UpgradeBatteryLookup } from "@/components/platform/UpgradeBatteryLookup";
import { getBatteryUpgradeBySlug } from "@/data/battery/battery-upgrade-lookup";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import { BUILD_STAMP } from "@/lib/build-stamp";

export default async function BatteryUpgradeVehiclePage({
  params,
}: {
  params: Promise<{ vehicleSlug: string }>;
}) {
  const { vehicleSlug } = await params;
  const record = getBatteryUpgradeBySlug(vehicleSlug);
  if (!record) notFound();

  const collecting = record.status === "collecting";

  return (
    <PageShell
      pageLabel="용량 업그레이드"
      title={`${record.displayName} 용량 업그레이드`}
      description="기본 장착 규격과 업그레이드 가능 규격을 비교합니다."
    >
      <div data-build-stamp={BUILD_STAMP} className="space-y-6 pb-10">
        {collecting ? (
          <div className={`${bm.card} ${bm.cardPad} border-amber-100 bg-amber-50/30`}>
            <p className="text-sm font-black text-amber-950">데이터 수집 중</p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-amber-950/90">
              <li>해당 차량의 용량 업그레이드 데이터는 현재 추가 수집 중입니다.</li>
              <li>기본 규격은 확인 가능하지만, 업그레이드 가능 여부는 검토 중입니다.</li>
              <li>
                무리한 업그레이드는 장착 불량이나 단자 간섭이 생길 수 있어 확인 후 안내드립니다.
              </li>
            </ul>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <article className={`${bm.card} ${bm.cardPad} min-w-0`}>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">기본 장착</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{record.stockBattery}</p>
            <p className="mt-2 text-sm font-medium text-slate-600">현재 차량에 맞는 기준 규격</p>
          </article>
          <article className={`${bm.card} ${bm.cardPad} min-w-0 border-blue-100 bg-blue-50/30`}>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">업그레이드 가능</p>
            <p className="mt-3 text-2xl font-black text-blue-950">
              {record.upgradeBatteries.join(" · ")}
            </p>
            <p className="mt-2 text-sm font-medium text-blue-900/80">트레이·단자 확인 후 장착</p>
          </article>
        </div>

        {record.guidanceNote ? (
          <section className={`${bm.card} ${bm.cardPad} border-slate-200 bg-slate-50/60`}>
            <h2 className="text-base font-black text-slate-900">안내 기준</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">
              {record.guidanceNote}
            </p>
          </section>
        ) : null}

        {!record.guidanceNote && record.checkPoints.length > 0 ? (
          <section className={`${bm.card} ${bm.cardPad}`}>
            <h2 className="text-base font-black text-slate-900">확인 포인트</h2>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              {record.checkPoints.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-blue-600" aria-hidden>
                    ·
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {!record.guidanceNote && record.cautions.length > 0 ? (
          <section className={`${bm.card} ${bm.cardPad}`}>
            <h2 className="text-base font-black text-slate-900">안내</h2>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              {record.cautions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link href="/compare" className={`${bm.btnSecondary} min-h-[3rem] text-sm font-black`}>
            업그레이드 가이드
          </Link>
          <Link href={HUB_STORE_DETAIL} className={`${bm.btnPrimary} min-h-[3rem] text-sm font-black`}>
            상담하기
          </Link>
        </div>

        <UpgradeBatteryLookup compact initialQuery={record.displayName} />
      </div>
    </PageShell>
  );
}
