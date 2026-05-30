import Link from "next/link";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { getVehicleImageUrlBySlug } from "@/lib/media/resolve-asset-image";
import { getVehicleAsset } from "@/lib/car-assets";
import { RecommendedBatteryCard } from "@/components/platform/RecommendedBatteryCard";
import {
  SearchResultCoreSummary,
  type CoreSummaryRow,
} from "@/components/platform/SearchResultCoreSummary";
import { SearchConditionChips } from "@/components/platform/search-ux/SearchConditionChips";
import { SearchPhotoVerifyBar } from "@/components/platform/search-ux/SearchPhotoVerifyBar";
import { SearchRecommendationNotes } from "@/components/platform/search-ux/SearchRecommendationNotes";
import { SearchUxHeroCtas } from "@/components/platform/search-ux/SearchUxHeroCtas";
import { SearchUxIntentBadge } from "@/components/platform/search-ux/SearchUxIntentBadge";
import { bm } from "@/lib/design-tokens";
import { compareHref } from "@/lib/platform-data";
import { resolveBatteryTerminalLabel } from "@/lib/battery-spec-display";
import { BatteryKnowledgeCard } from "@/components/battery/BatteryKnowledgeCard";
import { BatterySpecMiniCard } from "@/components/battery/BatterySpecMiniCard";
import { hasBrandSpecData } from "@/lib/battery-knowledge";
import { NO_REGISTERED_SPEC_MESSAGE } from "@/lib/search/battery-recommendation-copy";
import { isPorter2VehicleContext } from "@/lib/search/fitment-overrides";
import { SearchFuelVariantCards } from "@/components/platform/search-ux/SearchFuelVariantCards";
import type { SearchUxPresentation } from "@/lib/search/search-ux-presentation";
import type { RecognizedSpecResult } from "@/lib/search/search-summary";
import { SEARCH_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import type { RecognizedVehicleResult } from "@/lib/search-page-results";
import {
  isSorentoMq4AmbiguousQuery,
  SORENTO_MQ4_FUEL_VARIANTS,
} from "@/lib/search/sorento-mq4-fuel-split";

type Props = {
  displayQuery: string;
  intentLabel: string;
  vehicle: RecognizedVehicleResult | null;
  specOnly: RecognizedSpecResult | null;
  terminalTypeLabel?: string | null;
  compareBatteryCodes?: string[] | null;
  ux: SearchUxPresentation;
};

export function SearchBatteryFocusBlock({
  displayQuery,
  intentLabel,
  vehicle,
  specOnly,
  terminalTypeLabel,
  compareBatteryCodes,
  ux,
}: Props) {
  const multiCodes =
    vehicle?.candidateBatteryCodes?.length
      ? vehicle.candidateBatteryCodes
      : compareBatteryCodes && compareBatteryCodes.length >= 2
        ? compareBatteryCodes
        : null;
  const code = vehicle?.primaryBatteryCode ?? specOnly?.primaryBatteryCode;
  const hasBattery = Boolean(code) || Boolean(multiCodes?.length);
  const isCompare = ux.mode === "compare" && Boolean(multiCodes?.length);

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
    const terminal =
      resolveBatteryTerminalLabel(specOnly.spec) ??
      specOnly.terminalDirection ??
      terminalTypeLabel;
    if (terminal) {
      summaryRows.push({ key: "terminal", label: "단자", value: terminal });
    }
  } else if (multiCodes) {
    summaryRows.push({
      key: "spec",
      label: "비교 규격",
      value: multiCodes.join(" · "),
      highlight: true,
    });
    for (const specCode of multiCodes) {
      const terminal = resolveBatteryTerminalLabel(specCode);
      if (terminal) {
        summaryRows.push({
          key: `terminal-${specCode}`,
          label: `${specCode} 단자`,
          value: terminal,
        });
      }
    }
  }

  const header = (
    <header>
      <SearchUxIntentBadge label={intentLabel} />
      <h1 className={`${bm.titleLg} mt-1`} id="search-focus">
        &ldquo;{displayQuery}&rdquo;
      </h1>
      {ux.heroLines.length > 0 ? (
        <div className="mt-2 space-y-1">
          {ux.heroLines.map((line) => (
            <p key={line} className="text-sm font-medium leading-relaxed text-slate-600">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </header>
  );

  if (!hasBattery && vehicle?.specTier === "none") {
    return (
      <div className="space-y-3">
        {header}
        {summaryRows.length > 0 ? <SearchResultCoreSummary rows={summaryRows} /> : null}
        <SearchRecommendationNotes reasons={ux.recommendationReasons} />
        <div className={`${bm.card} border-amber-100 bg-amber-50/40 p-4`}>
          <p className="text-sm font-black text-slate-900">
            {vehicle.fallbackMessage ?? NO_REGISTERED_SPEC_MESSAGE}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {vehicle.ctas.map((cta) => (
              <Link
                key={`${cta.label}-${cta.href}`}
                className={`${bm.btnNavy} inline-flex text-xs`}
                href={cta.href}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
        <SearchPhotoVerifyBar cta={ux.photoCta} />
      </div>
    );
  }

  if (!hasBattery || (!code && !multiCodes?.length)) return null;

  const fieldLabel = vehicle?.specFieldLabel ?? (multiCodes ? "비교 규격" : "검색한 규격");
  const exceptionNote = vehicle?.secondaryNote ?? specOnly?.secondaryNote ?? null;
  const ctas = vehicle?.ctas ?? specOnly?.ctas ?? [];
  const secondaryLinks = vehicle?.secondaryLinks ?? specOnly?.secondaryLinks ?? [];
  const compareLink =
    multiCodes && multiCodes.length >= 2 ? compareHref(multiCodes[0]!, multiCodes[1]!) : null;
  const isPorter2 = isPorter2VehicleContext({
    query: displayQuery,
    vehicleLabel: vehicle?.vehicleLabel,
    href: vehicle?.href,
  });
  const reasonForCard =
    ux.recommendationReasons[0] ??
    (isPorter2 && vehicle?.candidateBatteryCodes?.length
      ? "연식 분기 후보를 같은 우선순위로 표시합니다."
      : null);
  const showSorentoFuelSplit = isSorentoMq4AmbiguousQuery(displayQuery);

  return (
    <div className="space-y-3">
      {header}
      {showSorentoFuelSplit ? <SearchFuelVariantCards variants={SORENTO_MQ4_FUEL_VARIANTS} /> : null}
      <SearchRecommendationNotes reasons={ux.recommendationReasons} />
      {ux.vehicleFuelBlurb ? (
        <p className="text-xs font-medium leading-relaxed text-slate-600">{ux.vehicleFuelBlurb}</p>
      ) : null}
      {ux.knowledgeCard ? (
        <BatteryKnowledgeCard
          title={ux.knowledgeCard.title}
          summary={ux.knowledgeCard.summary}
          href={ux.knowledgeCard.href}
          compact
        />
      ) : null}
      {ux.yearBranchHint ? (
        <p className="text-xs font-semibold text-amber-900">{ux.yearBranchHint}</p>
      ) : null}
      <SearchConditionChips chips={ux.conditionChips} />
      {vehicle?.vehicleLabel ? (
        <MediaImageSlot
          slot={SEARCH_IMAGE_SLOTS.vehicleCard(vehicle.vehicleLabel)}
          src={
            (vehicle.dbMatchKey && getVehicleAsset(vehicle.dbMatchKey)?.image) ||
            getVehicleImageUrlBySlug(vehicle.dbMatchKey ?? "") ||
            null
          }
          className="max-h-[140px]"
        />
      ) : null}
      {summaryRows.length > 0 ? <SearchResultCoreSummary rows={summaryRows} /> : null}

      {ux.mode === "spec" && ux.specMeta ? (
        <div className={`${bm.card} overflow-hidden p-0`}>
          <div className="flex flex-col md:grid md:grid-cols-[44%_56%]">
            <div className={bm.cardHorizontalMedia}>
              <BatteryCardImage code={ux.specMeta.code} variant="search" layout="row" flushTop />
            </div>
            <div className={bm.cardHorizontalBody}>
            <p className="spec-code text-2xl font-bold tracking-normal text-slate-950" data-spec-code>
              {ux.specMeta.code}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div>
                <dt className="font-bold text-slate-500">타입</dt>
                <dd className="font-bold text-slate-900">{ux.specMeta.type}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">용량</dt>
                <dd className="font-bold text-slate-900">{ux.specMeta.capacity}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">CCA</dt>
                <dd className="font-bold text-slate-900">{ux.specMeta.cca}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">단자</dt>
                <dd className="font-bold text-slate-900">{ux.specMeta.terminal}</dd>
              </div>
            </dl>
            {ux.sampleVehicles.length > 0 ? (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-slate-500">대표 적용 차량</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ux.sampleVehicles.map((v) => (
                    <Link
                      key={v.href}
                      className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-100 hover:bg-white"
                      href={v.href}
                    >
                      {v.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4">
              <SearchUxHeroCtas ctas={ux.heroCtas} />
            </div>
            </div>
          </div>
        </div>
      ) : null}

      {multiCodes && multiCodes.length >= 2 ? (
        <>
          {ux.compareNote || exceptionNote ? (
            <p className="rounded-xl bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-950 ring-1 ring-amber-100">
              {ux.compareNote ?? exceptionNote}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {multiCodes.map((specCode, idx) => (
              <div
                key={specCode}
                className={
                  idx === 0
                    ? "motion-safe:animate-[page-enter_0.35s_ease-out_forwards]"
                    : "motion-safe:animate-[page-enter_0.4s_ease-out_forwards]"
                }
              >
                <RecommendedBatteryCard
                  code={specCode}
                  fieldLabel={isCompare ? (idx === 0 ? "좌측 규격" : "우측 규격") : idx === 0 ? "첫 후보" : "비교 규격"}
                  vehicleLabel={vehicle?.vehicleLabel}
                  exceptionNote={idx === 0 ? reasonForCard : null}
                  ctas={[
                    { label: `${specCode} 상세`, href: `/batteries/${encodeURIComponent(specCode)}` },
                  ]}
                  secondaryLinks={[]}
                  primary={idx === 0}
                />
              </div>
            ))}
          </div>
          {compareLink ? (
            <SearchUxHeroCtas
              ctas={[
                { label: "규격 비교 보기", href: compareLink, tier: "primary" },
                ...ctas
                  .filter((c) => !/상세/.test(c.label))
                  .slice(0, 2)
                  .map((c) => ({ label: c.label, href: c.href, tier: "secondary" as const })),
              ]}
            />
          ) : null}
        </>
      ) : (
        <>
          <RecommendedBatteryCard
            code={code!}
            fieldLabel={fieldLabel}
            vehicleLabel={vehicle?.vehicleLabel}
            exceptionNote={reasonForCard ?? exceptionNote}
            ctas={ctas}
            secondaryLinks={secondaryLinks}
            primary
          />
          {hasBrandSpecData(code!) ? <BatterySpecMiniCard code={code!} compact /> : null}
        </>
      )}

      {ux.heroCtas.length > 0 && ux.mode !== "spec" ? (
        <SearchUxHeroCtas ctas={ux.heroCtas.filter((c) => c.tier !== "ghost")} />
      ) : null}

      {(code ?? multiCodes?.[0]) ? (
        <MediaImageSlot
          slot={SEARCH_IMAGE_SLOTS.batteryInstallExample(code ?? multiCodes![0]!)}
        />
      ) : null}

      <SearchPhotoVerifyBar cta={ux.photoCta} />
    </div>
  );
}
