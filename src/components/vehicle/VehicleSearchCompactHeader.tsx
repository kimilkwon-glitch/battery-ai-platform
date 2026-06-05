import { SearchUxIntentBadge } from "@/components/platform/search-ux/SearchUxIntentBadge";
import { bm } from "@/lib/design-tokens";

type Props = {
  vehicleTitle: string;
  yearRange?: string;
  highlightFuel?: string | null;
  recommendedSpec?: string | null;
  displayQuery?: string | null;
  intentLabel?: string | null;
};

export function VehicleSearchCompactHeader({
  vehicleTitle,
  yearRange,
  highlightFuel,
  recommendedSpec,
  displayQuery,
  intentLabel,
}: Props) {
  const meta = [
    yearRange ? { label: "연식", value: yearRange } : null,
    highlightFuel ? { label: "선택 연료", value: highlightFuel } : null,
    recommendedSpec ? { label: "추천 규격", value: recommendedSpec, highlight: true } : null,
  ].filter(Boolean) as { label: string; value: string; highlight?: boolean }[];

  return (
    <header className="space-y-3">
      {displayQuery ? (
        <div>
          {intentLabel ? <SearchUxIntentBadge label={intentLabel} /> : null}
          <h1 className={`${bm.titleLg} mt-1`} id="search-focus">
            &ldquo;{displayQuery}&rdquo;
          </h1>
        </div>
      ) : null}
      <div className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
          {vehicleTitle} 기본 추천 규격
        </h2>
        {meta.length > 0 ? (
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {meta.map((row) => (
              <div className="flex gap-1.5" key={row.label}>
                <dt className="font-bold text-slate-500">{row.label}</dt>
                <dd
                  className={
                    row.highlight ? "font-black text-blue-800" : "font-bold text-slate-900"
                  }
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  );
}
