import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { ApplicableVehiclesStrip } from "@/components/battery/ApplicableVehiclesStrip";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
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
  const headlineMeta = [brand.displayName, spec.typeLabel, spec.capacity, spec.cca]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="battery-spec-detail mx-auto max-w-3xl space-y-5 pb-10" data-battery-spec-page={code}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-blue-700"
      >
        <ArrowLeft className="size-4" aria-hidden />
        이전으로
      </Link>

      <header className="battery-spec-detail__hero space-y-2">
        <h1 className="battery-spec-detail__title font-black tracking-tight text-slate-950">{code}</h1>
        {headlineMeta ? (
          <p className="battery-spec-detail__meta font-semibold text-slate-600">{headlineMeta}</p>
        ) : null}
        {terminal && terminal !== "—" ? (
          <p className="text-xs font-bold text-slate-500">단자 {terminal}</p>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 sm:rounded-2xl sm:p-5">
        <BatteryCardImage
          code={code}
          displayLabel={code}
          variant="card"
          layout="stack"
          className="mx-auto w-full max-w-md"
        />
      </div>

      <section className={`${bm.card} ${bm.cardPad}`} aria-labelledby="battery-spec-core">
        <h2 id="battery-spec-core" className="text-base font-black text-slate-900 sm:text-lg">
          핵심 스펙
        </h2>
        <dl className="mt-3 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
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
        <section className={`${bm.card} ${bm.cardPad}`}>
          <h2 className="text-base font-black text-slate-900">대표 적용 차종</h2>
          <ApplicableVehiclesStrip vehicles={vehicles} specCode={code} className="mt-3" />
        </section>
      ) : null}

      {batteryDetailHref(code) ? (
        <div className="flex flex-wrap gap-2">
          <Link href={batteryDetailHref(code)!} className={`${bm.btnPrimary} text-sm font-black`}>
            상품 상세·주문
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <dt className="text-[11px] font-bold text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-black text-slate-900">{value}</dd>
    </div>
  );
}
