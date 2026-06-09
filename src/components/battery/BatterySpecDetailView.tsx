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
        <ApplicableVehiclesStrip vehicles={vehicles} specCode={code} />
      ) : null}

      <section className="mt-2 pt-4 sm:pt-6">
        <Link
          href={batteryDetailHref(code)}
          className={`${bm.btnPrimary} flex min-h-[3.5rem] w-full items-center justify-center rounded-2xl px-8 py-4 text-lg font-black sm:min-h-[3.75rem] sm:text-xl`}
        >
          주문하기
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
