import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import type { RecognizedVehicleResult } from "@/lib/search-page-results";
import { RecommendedBatteryCard } from "@/components/platform/RecommendedBatteryCard";
import { NO_REGISTERED_SPEC_MESSAGE } from "@/lib/search/battery-recommendation-copy";

export function RecognizedVehicleCard({ card }: { card: RecognizedVehicleResult }) {
  const showSpecLine =
    card.specTier === "exact" ||
    card.specTier === "db" ||
    card.specTier === "map";
  const hasBatteryCard = Boolean(showSpecLine && card.primaryBatteryCode);

  return (
    <section className={`${bm.intentSummary} space-y-3`} id="recognized-vehicle">
      <h2 className="text-lg font-black leading-snug text-slate-950 sm:text-xl">{card.title}</h2>

      <div className={`${bm.surfaceMuted} mt-1 space-y-1.5 p-3`}>
        <p className="text-xs font-medium text-slate-600">
          인식된 차량: <span className="text-sm font-black text-slate-900">{card.vehicleLabel}</span>
        </p>
        {card.fuelLabel && card.fuelLabel !== "확인 필요" ? (
          <p className="text-xs font-medium text-slate-600">
            연료: <span className="font-semibold text-slate-900">{card.fuelLabel}</span>
          </p>
        ) : null}
        {showSpecLine && card.specFieldLabel && card.specDisplay ? (
          <p className="text-sm font-medium text-slate-600">
            {card.specFieldLabel}:{" "}
            <span className="text-lg font-black text-[var(--bm-primary)]">{card.specDisplay}</span>
            {card.confidenceLabel && card.specTier === "map" ? (
              <span className="ml-1 text-xs font-semibold text-amber-700">({card.confidenceLabel})</span>
            ) : null}
          </p>
        ) : null}
      </div>

      {hasBatteryCard && card.primaryBatteryCode ? (
        <RecommendedBatteryCard
          code={card.primaryBatteryCode}
          fieldLabel={card.specFieldLabel ?? "추천 규격"}
          vehicleLabel={card.vehicleLabel}
          exceptionNote={card.secondaryNote}
          ctas={card.ctas}
          secondaryLinks={card.secondaryLinks}
        />
      ) : (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <p className="text-sm font-black text-slate-900">
            {card.fallbackMessage ?? NO_REGISTERED_SPEC_MESSAGE}
          </p>
          <p className="mt-3 text-[11px] font-black text-slate-500">다음 행동</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {card.ctas.map((cta) => (
              <Link
                key={`${cta.label}-${cta.href}`}
                className={`${bm.btnPrimary} inline-flex text-xs`}
                href={cta.href}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!hasBatteryCard && card.bodyMessage ? (
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">{card.bodyMessage}</p>
      ) : null}
    </section>
  );
}
