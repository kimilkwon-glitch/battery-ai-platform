import Link from "next/link";
import { SearchBatteryFocusBlock } from "@/components/platform/SearchBatteryFocusBlock";
import { SearchConditionChips } from "@/components/platform/search-ux/SearchConditionChips";
import { SearchPhotoVerifyBar } from "@/components/platform/search-ux/SearchPhotoVerifyBar";
import { SearchRecommendationNotes } from "@/components/platform/search-ux/SearchRecommendationNotes";
import { SearchUxHeroCtas } from "@/components/platform/search-ux/SearchUxHeroCtas";
import { SearchUxIntentBadge } from "@/components/platform/search-ux/SearchUxIntentBadge";
import { bm } from "@/lib/design-tokens";
import type { SearchPageResults } from "@/lib/search-page-results";

type Props = {
  data: SearchPageResults;
  fallbackCtas: { label: string; href: string }[];
};

export function SearchResultHero({ data, fallbackCtas }: Props) {
  const ux = data.ux;
  const displayQuery = data.displayQuery || data.query;
  const batteryFocus =
    !data.symptomDiagnosisFirst &&
    (Boolean(data.recognizedVehicle?.primaryBatteryCode) ||
      Boolean(data.recognizedVehicle?.candidateBatteryCodes?.length) ||
      Boolean(data.recognizedSpec?.primaryBatteryCode) ||
      Boolean(data.compareBatteryCodes?.length));

  if (data.symptomDiagnosisFirst) {
    const ctas =
      data.recognizedVehicle?.ctas?.length
        ? data.recognizedVehicle.ctas
        : ux.heroCtas.length
          ? ux.heroCtas.map((c) => ({ label: c.label, href: c.href }))
          : fallbackCtas;
    return (
      <div
        className="space-y-3 motion-safe:animate-[page-enter_0.35s_ease-out_forwards]"
        data-search-ux-mode="symptom"
        id="search-focus"
      >
        <header>
          <SearchUxIntentBadge label={ux.intentBadge} />
          <h1 className={`${bm.titleLg} mt-1`}>&ldquo;{displayQuery}&rdquo;</h1>
        </header>
        <SearchRecommendationNotes reasons={ux.recommendationReasons} />
        <div className={`${bm.card} ${bm.cardPad}`}>
          <p className={bm.cardTitle}>방전 원인 점검 우선</p>
          {ux.heroLines.map((line) => (
            <p key={line} className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
              {line}
            </p>
          ))}
          {data.recognizedVehicle?.vehicleLabel ? (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {data.recognizedVehicle.vehicleLabel} — 차종·연식 확인 후 규격은 보조로 안내합니다.
            </p>
          ) : null}
          <SearchUxHeroCtas
            ctas={ctas.slice(0, 3).map((c, i) => ({
              label: c.label,
              href: c.href,
              tier: i === 0 ? "primary" : "secondary",
            }))}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {ux.symptomCauses.map((cause) => (
            <div
              key={cause.title}
              className={`${bm.surfaceMuted} px-3 py-3 transition motion-safe:duration-200 motion-safe:hover:border-[var(--bm-primary)]/15 motion-safe:hover:shadow-[var(--bm-shadow-sm)]`}
            >
              <p className="text-sm font-black text-slate-900">{cause.title}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{cause.hint}</p>
            </div>
          ))}
        </div>
        <SearchPhotoVerifyBar cta={ux.photoCta} hintIndex={1} />
      </div>
    );
  }

  if (ux.mode === "purpose") {
    return (
      <div
        className="space-y-3 motion-safe:animate-[page-enter_0.35s_ease-out_forwards]"
        data-search-ux-mode="purpose"
        id="search-focus"
      >
        <header>
          <SearchUxIntentBadge label={ux.intentBadge} />
          <h1 className={`${bm.titleLg} mt-1`}>&ldquo;{displayQuery}&rdquo;</h1>
        </header>
        <SearchRecommendationNotes reasons={ux.recommendationReasons} />
        <div className={`${bm.card} p-4`}>
          {ux.purposeBlurb ? (
            <p className="text-sm font-medium leading-relaxed text-slate-700">{ux.purposeBlurb}</p>
          ) : null}
          {data.intentMessage ? (
            <p className="mt-2 text-sm font-medium text-slate-600">{data.intentMessage}</p>
          ) : null}
          <div className="mt-4">
            <SearchUxHeroCtas ctas={ux.heroCtas} />
          </div>
        </div>
        <SearchPhotoVerifyBar cta={ux.photoCta} />
      </div>
    );
  }

  if (batteryFocus) {
    return (
      <div
        className="motion-safe:animate-[page-enter_0.35s_ease-out_forwards]"
        data-search-ux-mode={ux.mode}
      >
        <SearchBatteryFocusBlock
          compareBatteryCodes={data.compareBatteryCodes}
          displayQuery={displayQuery}
          intentLabel={ux.intentBadge}
          specOnly={data.recognizedSpec}
          terminalTypeLabel={data.terminalTypeLabel}
          ux={ux}
          vehicle={data.recognizedVehicle}
        />
      </div>
    );
  }

  return null;
}
