import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { SearchResultSpecChips } from "@/components/platform/SearchResultCoreSummary";
import { bm } from "@/lib/design-tokens";
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
      className={primary ? bm.fitmentCardPrimary : bm.fitmentCard}
      data-search-battery-card={primary ? "primary" : "secondary"}
    >
      {primary ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--bm-border)] bg-gradient-to-r from-[var(--bm-hero-from)] to-[var(--bm-accent-soft)]/20 px-4 py-2.5">
          <span className={`${bm.badge} ${bm.statusRecommended}`}>추천</span>
          <span className="text-[11px] font-semibold text-[var(--bm-muted)]">fitment 판정 · DB 1순위</span>
        </div>
      ) : null}
      <div className="grid gap-0 max-sm:grid-rows-[auto_1fr] sm:grid-cols-[minmax(148px,220px)_1fr]">
        <div className="overflow-hidden p-2 sm:border-r sm:border-[var(--bm-border)] sm:p-2.5">
          <BatteryImageStage
            code={display.code}
            variant="search"
            imageSet={display.imageSet ?? undefined}
            className="w-full"
          />
        </div>
        <div className="px-3 py-2.5 max-sm:pt-2 sm:px-3.5">
          <h3 className="spec-code text-lg font-bold leading-snug text-[var(--bm-text)] sm:text-xl">
            {display.code}
            <span className="ml-1.5 text-sm font-bold text-[var(--bm-muted)]">배터리</span>
          </h3>
          {context ? <p className="mt-0.5 text-xs font-semibold text-slate-600">{context}</p> : null}
          <SearchResultSpecChips
            typeLabel={display.typeLabel}
            seriesLabel={display.seriesLabel}
            terminalLabel={display.terminalLabel}
          />
          {exceptionNote ? (
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500">{exceptionNote}</p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-3 py-2.5">
        <CtaHierarchy compact ctas={ctas} links={secondaryLinks} />
      </div>
    </article>
  );
}
