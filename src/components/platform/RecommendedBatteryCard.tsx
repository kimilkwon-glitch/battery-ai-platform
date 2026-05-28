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
        <div className="overflow-hidden p-1.5 sm:border-r sm:border-[var(--bm-border)] sm:p-2">
          <BatteryImageStage
            code={display.code}
            variant="search"
            imageSet={display.imageSet ?? undefined}
            className="w-full"
          />
        </div>
        <div className="px-2.5 py-2 max-sm:pt-1.5 sm:px-3">
          <h3 className="spec-code text-base font-bold leading-snug text-[var(--bm-text)] sm:text-lg">
            {display.code}
            <span className="ml-1 text-xs font-bold text-[var(--bm-muted)] sm:text-sm">배터리</span>
          </h3>
          {context ? <p className="mt-0.5 text-[11px] font-semibold text-slate-600">{context}</p> : null}
          <SearchResultSpecChips
            typeLabel={display.typeLabel}
            seriesLabel={display.seriesLabel}
            terminalLabel={display.terminalLabel}
          />
          {exceptionNote ? (
            <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-slate-500 sm:text-[11px]">{exceptionNote}</p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-2.5 py-2">
        <CtaHierarchy compact ctas={ctas} links={secondaryLinks} />
      </div>
    </article>
  );
}
