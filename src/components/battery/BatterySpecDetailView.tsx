import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { VehicleCardImage } from "@/components/media/VehicleCardImage";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import { getBattery, getBrand } from "@/lib/platform-data";
import { bm } from "@/lib/design-tokens";

type VehicleChip = { slug: string; title: string };

type Props = {
  code: string;
  vehicles: VehicleChip[];
};

export function BatterySpecDetailView({ code, vehicles }: Props) {
  const spec = parseBatterySpecDisplay(code);
  const summary = getNormalizedBatterySummary(code);
  const bat = getBattery(code);
  const brand = getBrand(bat.brandId);
  const sizeMm = formatDimensions(summary?.dimensionsMm ?? null) ?? "—";
  const terminal = spec.terminalLabel ?? "—";
  const headlineMeta = [
    brand.displayName,
    spec.typeLabel,
    spec.capacity,
    spec.cca,
    spec.terminalLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="battery-spec-detail mx-auto max-w-3xl space-y-8 pb-10" data-battery-spec-page={code}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-blue-700"
      >
        <ArrowLeft className="size-4" aria-hidden />
        이전으로
      </Link>

      <header className="space-y-3">
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">배터리 규격 안내</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{code}</h1>
        {headlineMeta ? (
          <p className="text-base font-semibold text-slate-600 sm:text-lg">{headlineMeta}</p>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6">
        <BatteryCardImage
          code={code}
          displayLabel={code}
          variant="card"
          layout="stack"
          className="mx-auto w-full max-w-lg"
        />
      </div>

      <section className={`${bm.card} ${bm.cardPad}`} aria-labelledby="battery-spec-core">
        <h2 id="battery-spec-core" className="text-lg font-black text-slate-900">
          핵심 스펙
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <SpecItem
            label="용량"
            value={
              spec.capacity ??
              (summary?.capacityAh5Hr != null ? String(summary.capacityAh5Hr) : "—")
            }
          />
          <SpecItem label="CCA" value={spec.cca ?? (summary?.cca != null ? String(summary.cca) : "—")} />
          <SpecItem label="RC" value={summary?.rc != null ? String(summary.rc) : "—"} />
          <SpecItem label="사이즈 (mm)" value={sizeMm} />
          <SpecItem label="단자 방향" value={terminal || "—"} />
          <SpecItem label="타입" value={spec.typeLabel} />
        </dl>
      </section>

      {vehicles.length > 0 ? (
        <section aria-labelledby="battery-spec-vehicles">
          <h2 id="battery-spec-vehicles" className="text-lg font-black text-slate-900">
            대표 적용 차량
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            연식·트림에 따라 다를 수 있습니다.
          </p>
          <ul className="mt-4 grid list-none gap-3 sm:grid-cols-2">
            {vehicles.slice(0, 8).map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/vehicle/${v.slug}`}
                  className="group bm-card-vehicle-match flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md md:grid md:grid-cols-[minmax(0,44%)_56%]"
                >
                  <div className="bm-card-horizontal__media !border-0 !p-0">
                    <VehicleCardImage slug={v.slug} title={v.title} />
                  </div>
                  <div className="flex flex-col justify-center border-t border-slate-100 px-3 py-2.5 md:border-l md:border-t-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{v.title}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">{code}</p>
                    <span className="mt-1 inline-block text-xs font-black text-blue-600">차량 상세 보기 →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {vehicles.length > 8 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {vehicles.slice(8, 14).map((v) => (
                <Link
                  key={v.slug}
                  href={`/vehicle/${v.slug}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  {v.title}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <h2 className="text-base font-black text-slate-900">규격 확인 포인트</h2>
        <ul className="mt-3 space-y-2 text-sm font-medium leading-relaxed text-slate-700">
          <li>· 배터리 라벨의 규격 코드({code})</li>
          <li>· 단자 방향 L/R</li>
          <li>· 트레이·고정 방식과 외형 치수</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={batteryDetailHref(code)} className={`${bm.btnPrimary} justify-center px-8 py-3.5 text-base`}>
          주문하기
        </Link>
        <Link href={HUB_PHOTO} className={`${bm.btnSecondary} justify-center px-6 py-3.5 text-base`}>
          사진으로 규격 확인
        </Link>
      </section>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
      <dt className="text-xs font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 text-base font-black text-slate-900">{value}</dd>
    </div>
  );
}
