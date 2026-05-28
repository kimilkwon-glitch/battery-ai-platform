import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
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
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--bm-border)] bg-[var(--bm-hero-from)] px-4 py-2">
          <span className={`${bm.badge} ${bm.statusRecommended}`}>추천 규격</span>
          <span className="text-[11px] font-semibold text-[var(--bm-muted)]">DB·차량 매칭 기준 1순위</span>
        </div>
      ) : null}
      <div className="grid gap-0 sm:grid-cols-[minmax(148px,220px)_1fr]">
        <div className="bg-[var(--bm-image-bg)] p-3 sm:border-r sm:border-[var(--bm-border)]">
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
          <h3 className={bm.specTitle}>
            {display.code}
            <span className="ml-1.5 text-base font-bold text-[var(--bm-muted)]">배터리</span>
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
      <div className="border-t border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-4 py-3">
        <CtaHierarchy ctas={ctas} links={secondaryLinks} />
      </div>
    </article>
  );
}
