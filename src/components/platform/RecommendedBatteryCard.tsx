import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import {
  CardInfoMeta,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
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
          <span className="text-[11px] font-semibold text-[var(--bm-muted)]">추천 · 1순위 후보</span>
        </div>
      ) : null}
      <div className="flex flex-col md:grid md:grid-cols-[44%_56%]">
        <div className={`${bm.cardHorizontalMedia} !min-h-[132px] md:!min-h-[156px]`}>
          <BatteryImageStage
            code={display.code}
            variant="search"
            imageSet={display.imageSet ?? undefined}
            className="h-full w-full"
            layout="row"
            flushTop
          />
        </div>
        <div className={bm.cardHorizontalBody}>
          <CardInfoStack>
            <CardInfoTitleRow
              iconKey="batterySpec"
              title={
                <>
                  <span className="spec-code text-base sm:text-lg">{display.code}</span>
                  <span className="ml-1 text-xs font-bold text-[var(--bm-muted)] sm:text-sm">배터리</span>
                </>
              }
            />
            {context ? (
              <p className="text-[11px] font-semibold text-slate-600">{context}</p>
            ) : null}
            <SearchResultSpecChips
              typeLabel={display.typeLabel}
              seriesLabel={display.seriesLabel}
              terminalLabel={display.terminalLabel}
            />
            {exceptionNote ? <CardInfoMeta className="sm:text-[11px]">{exceptionNote}</CardInfoMeta> : null}
          </CardInfoStack>
        </div>
      </div>
      <div className="border-t border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-2.5 py-2">
        <CtaHierarchy compact ctas={ctas} links={secondaryLinks} />
      </div>
    </article>
  );
}
