import Link from "next/link";
import { RecommendedBatteryCard } from "@/components/platform/RecommendedBatteryCard";
import {
  SearchResultCoreSummary,
  type CoreSummaryRow,
} from "@/components/platform/SearchResultCoreSummary";
import { bm } from "@/lib/design-tokens";
import type { RecognizedSpecResult } from "@/lib/search/search-summary";
import type { RecognizedVehicleResult } from "@/lib/search-page-results";
import { NO_REGISTERED_SPEC_MESSAGE } from "@/lib/search/battery-recommendation-copy";

type Props = {
  displayQuery: string;
  intentLabel: string;
  vehicle: RecognizedVehicleResult | null;
  specOnly: RecognizedSpecResult | null;
  terminalTypeLabel?: string | null;
};

export function SearchBatteryFocusBlock({
  displayQuery,
  intentLabel,
  vehicle,
  specOnly,
  terminalTypeLabel,
}: Props) {
  const code = vehicle?.primaryBatteryCode ?? specOnly?.primaryBatteryCode;
  const hasBattery = Boolean(code);

  const summaryRows: CoreSummaryRow[] = [];
  if (vehicle) {
    summaryRows.push({ key: "vehicle", label: "차량", value: vehicle.vehicleLabel });
    if (vehicle.specDisplay && vehicle.specTier !== "none") {
      summaryRows.push({
        key: "spec",
        label: vehicle.specFieldLabel ?? "추천 규격",
        value: vehicle.specDisplay,
        highlight: true,
      });
    }
    if (vehicle.fuelLabel && vehicle.fuelLabel !== "확인 필요") {
      summaryRows.push({ key: "fuel", label: "연료", value: vehicle.fuelLabel });
    }
    if (vehicle.basisLabel) {
      summaryRows.push({ key: "basis", label: "기준", value: vehicle.basisLabel });
    }
  } else if (specOnly) {
    summaryRows.push({
      key: "spec",
      label: "검색한 규격",
      value: specOnly.spec,
      highlight: true,
    });
    const terminal = specOnly.terminalDirection ?? terminalTypeLabel;
    if (terminal) {
      summaryRows.push({ key: "terminal", label: "단자", value: terminal });
    }
  }

  if (!hasBattery && vehicle?.specTier === "none") {
    return (
      <div className="space-y-3">
        <header>
          <p className="text-xs font-bold text-blue-600">{intentLabel}</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            &ldquo;{displayQuery}&rdquo; 검색 결과
          </h1>
        </header>
        {summaryRows.length > 0 ? <SearchResultCoreSummary rows={summaryRows} /> : null}
        <div className={`${bm.card} border-amber-100 bg-amber-50/40 p-4`}>
          <p className="text-sm font-black text-slate-900">
            {vehicle.fallbackMessage ?? NO_REGISTERED_SPEC_MESSAGE}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {vehicle.ctas.map((cta) => (
              <Link
                key={`${cta.label}-${cta.href}`}
                className={`${bm.btnPrimary} inline-flex text-xs`}
                href={cta.href}
              >
                {cta.label}
              </Link>
            ))}
          </div>
          {vehicle.secondaryLinks.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-x-3">
              {vehicle.secondaryLinks.map((link) => (
                <Link
                  key={`${link.label}-${link.href}`}
                  className="text-[11px] font-bold text-slate-500 hover:text-blue-700 hover:underline"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!hasBattery || !code) return null;

  const fieldLabel = vehicle?.specFieldLabel ?? "검색한 규격";
  const exceptionNote = vehicle?.secondaryNote ?? specOnly?.secondaryNote ?? null;
  const ctas = vehicle?.ctas ?? specOnly?.ctas ?? [];
  const secondaryLinks = vehicle?.secondaryLinks ?? specOnly?.secondaryLinks ?? [];

  return (
    <div className="space-y-3" id="search-focus">
      <header>
        <p className="text-xs font-bold text-blue-600">{intentLabel}</p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          &ldquo;{displayQuery}&rdquo; 검색 결과
        </h1>
      </header>

      {summaryRows.length > 0 ? <SearchResultCoreSummary rows={summaryRows} /> : null}

      <RecommendedBatteryCard
        code={code}
        fieldLabel={fieldLabel}
        vehicleLabel={vehicle?.vehicleLabel}
        exceptionNote={exceptionNote}
        ctas={ctas}
        secondaryLinks={secondaryLinks}
      />
    </div>
  );
}
