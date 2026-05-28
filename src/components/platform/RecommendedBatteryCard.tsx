import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { SearchResultSpecChips } from "@/components/platform/SearchResultCoreSummary";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { SHORT_EXCEPTION_NOTE, vehicleContextLine } from "@/lib/search/battery-recommendation-copy";

export type RecommendedBatteryCardProps = {
  code: string;
  fieldLabel: string;
  vehicleLabel?: string | null;
  exceptionNote?: string | null;
  ctas: { label: string; href: string }[];
  secondaryLinks?: { label: string; href: string }[];
  /** 1순위 정답 카드 — 시각적 계층 강조 */
  primary?: boolean;
};

export function RecommendedBatteryCard({
  code,
  fieldLabel,
  vehicleLabel,
  exceptionNote = SHORT_EXCEPTION_NOTE,
  ctas,
  secondaryLinks = [],
  primary = false,
}: RecommendedBatteryCardProps) {
  const display = parseBatterySpecDisplay(code);
  const context =
    vehicleLabel && fieldLabel ? vehicleContextLine(vehicleLabel, fieldLabel) : null;

  return (
    <article
      className={
        primary
          ? "overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md ring-2 ring-slate-900/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 transition duration-200 hover:border-slate-300 hover:shadow-md"
      }
      data-search-battery-card={primary ? "primary" : "secondary"}
    >
      <div className="grid gap-0 sm:grid-cols-[minmax(148px,220px)_1fr]">
        <div className="bg-slate-50 p-3 sm:border-r sm:border-slate-100">
          <BatteryThumbnail
            code={display.code}
            imageSet={display.imageSet ?? undefined}
            role="main"
            fit={batteryImageFit(display.code)}
            ratio="4/3"
            tall
            overlayLabel={false}
            surface="transparent"
          />
        </div>
        <div className="p-4">
          <h3 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {display.code}
            <span className="ml-1.5 text-base font-bold text-slate-500">배터리</span>
          </h3>
          {context ? <p className="mt-1 text-xs font-semibold text-slate-600">{context}</p> : null}
          <SearchResultSpecChips
            typeLabel={display.typeLabel}
            seriesLabel={display.seriesLabel}
            terminalLabel={display.terminalLabel}
          />
          {exceptionNote ? (
            <p className="mt-3 text-[11px] font-medium leading-relaxed text-slate-500">{exceptionNote}</p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
        <CtaHierarchy ctas={ctas} links={secondaryLinks} />
      </div>
    </article>
  );
}
