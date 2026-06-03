"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryImageCard, batteryImageFit } from "@/components/BatteryThumbnail";
import { SearchResultHero } from "@/components/platform/search-ux/SearchResultHero";
import { SearchMobileStickyCta } from "@/components/platform/search-ux/SearchMobileStickyCta";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { NO_REGISTERED_SPEC_MESSAGE, NO_VEHICLE_MATCH_MESSAGE } from "@/lib/search/battery-recommendation-copy";
import { SearchVehicleResults } from "@/components/platform/SearchVehicleResults";
import { SearchRelatedQna } from "@/components/platform/SearchRelatedQna";
import { bm } from "@/lib/design-tokens";
import { getBattery } from "@/lib/platform-data";
import type { SearchPageResults } from "@/lib/search-page-results";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";

type Props = {
  data: SearchPageResults;
};

const FALLBACK_CTAS = [
  { label: "사진으로 확인", href: HUB_PHOTO },
  { label: "문의하기", href: HUB_STORE },
  { label: "규격 가이드 보기", href: "/guides" },
  { label: "차량 정보 더 입력", href: "/vehicles" },
] as const;

function ExpandToggle({
  expanded,
  hiddenCount,
  label,
  onToggle,
}: {
  expanded: boolean;
  hiddenCount: number;
  label: string;
  onToggle: () => void;
}) {
  if (hiddenCount <= 0) return null;
  return (
    <button
      className="mt-2 w-full rounded-lg py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
      onClick={onToggle}
      type="button"
    >
      {expanded ? "접기" : `${label} 더보기 (+${hiddenCount})`}
    </button>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${bm.card} ${bm.cardPad} motion-safe:transition motion-safe:duration-200 motion-safe:hover:shadow-[var(--bm-shadow-md)]`}>
      <h2 className={bm.cardTitle}>{title}</h2>
      {desc ? <p className={`mt-0.5 ${bm.muted} text-xs`}>{desc}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function formatList(values: string[], emptyLabel: string): string {
  return values.length > 0 ? values.join(", ") : emptyLabel;
}

export function SearchResultsView({ data }: Props) {
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [batteriesOpen, setBatteriesOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  const limit = data.defaultVisible;
  const batteryFocus =
    !data.symptomDiagnosisFirst &&
    (Boolean(data.recognizedVehicle?.primaryBatteryCode) ||
      Boolean(data.recognizedVehicle?.candidateBatteryCodes?.length) ||
      Boolean(data.recognizedSpec?.primaryBatteryCode) ||
      Boolean(data.compareBatteryCodes?.length));
  const focusCode =
    data.recognizedVehicle?.primaryBatteryCode ??
    data.recognizedVehicle?.candidateBatteryCodes?.[0] ??
    data.compareBatteryCodes?.[0] ??
    data.recognizedSpec?.primaryBatteryCode ??
    null;
  const hasHero =
    data.symptomDiagnosisFirst || batteryFocus || data.ux.mode === "purpose";

  const visibleVehicles = vehiclesOpen ? data.vehicles : data.vehicles.slice(0, limit);
  const showSecondary = batteryFocus ? secondaryOpen : !data.deferSecondary || secondaryOpen;
  const visibleQuestions = showSecondary
    ? questionsOpen
      ? data.questions
      : data.questions.slice(0, limit)
    : [];
  const visibleGuides = showSecondary
    ? guidesOpen
      ? data.guides
      : data.guides.slice(0, limit)
    : [];

  const ctas = data.ctas.length > 0 ? data.ctas : [...FALLBACK_CTAS];

  const batteriesFiltered =
    focusCode && data.batteries.length > 0
      ? data.batteries.filter((b) => b.code.toUpperCase() !== focusCode.toUpperCase())
      : data.batteries;
  const visibleBatteriesFiltered = batteriesOpen
    ? batteriesFiltered
    : batteriesFiltered.slice(0, limit);

  if (!data.query) {
    return (
      <div className={`${bm.card} p-5`}>
        <p className="text-sm font-bold text-slate-700">차종·규격·증상을 입력하면 맞는 후보를 보여드립니다.</p>
        <p className="mt-2 text-xs font-medium text-slate-500">예시 검색어</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.emptySuggestions.map((s) => (
            <Link
              className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              href={getSearchHref(s)}
              key={s}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${hasHero ? "pb-24 md:pb-0" : ""}`} data-search-results-root>
      {hasHero ? (
        <SearchResultHero data={data} fallbackCtas={[...ctas]} />
      ) : null}

      {(data.symptomDiagnosisFirst || data.query) && (data.displayQuery || data.query) ? (
        <SearchRelatedQna query={data.displayQuery || data.query} rawQuery={data.query} />
      ) : null}

      {!hasHero ? (
        <div className={`${bm.intentSummary} motion-safe:animate-[page-enter_0.35s_ease-out_forwards]`} id="search-summary">
          <p className={bm.intentBadge}>{data.ux.intentBadge}</p>
          <h1 className={`${bm.titleLg} mt-2`}>&ldquo;{data.displayQuery || data.query}&rdquo; 검색 결과</h1>
          {data.searchRecognitionNote ? (
            <p className="mt-2 text-sm font-medium text-slate-600">{data.searchRecognitionNote}</p>
          ) : null}
          <div className={`${bm.surfaceMuted} mt-3 space-y-2 p-3`}>
            <p className="text-xs font-medium text-slate-600">
              인식된 차량: {formatList(data.summary.vehicleKeywords, "차량명 추가 입력 권장")}
            </p>
            {data.queryHasBatterySpec ? (
              <p className="text-xs font-medium text-slate-600">
                검색한 규격:{" "}
                <span className="font-semibold text-slate-900">{data.summary.batterySpecs.join(" · ")}</span>
              </p>
            ) : data.summary.vehicleKeywords.length > 0 &&
              data.vehicles.length === 0 &&
              !data.recognizedVehicle ? (
              <p className="text-xs font-semibold text-amber-900">{NO_REGISTERED_SPEC_MESSAGE}</p>
            ) : data.vehicles.length > 0 && !data.recognizedVehicle ? (
              <p className="text-xs font-medium text-slate-600">
                아래에서 차량·세대를 선택하면 규격을 확인할 수 있습니다.
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-600">{NO_VEHICLE_MATCH_MESSAGE}</p>
            )}
          </div>
          {ctas.length > 0 ? (
            <>
              <p className="mt-3 text-[11px] font-black text-slate-500">다음 행동</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ctas.slice(0, 3).map((cta) => (
                  <Link
                    className={`${bm.btnNavy} inline-flex text-xs`}
                    href={cta.href}
                    key={`${cta.label}-${cta.href}`}
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {data.hadError ? (
        <div className={`${bm.card} border-amber-100 bg-amber-50/50 p-4`}>
          <p className="text-sm font-bold text-slate-800">검색 결과를 불러오는 중 문제가 있었습니다.</p>
          <p className="mt-1 text-xs font-medium text-slate-600">{data.insufficientMessage}</p>
        </div>
      ) : null}

      {data.missingVehicleMessage ? (
        <div className={`${bm.card} border-amber-100 bg-amber-50/40 p-4`}>
          <p className="text-sm font-bold text-slate-800">{data.missingVehicleMessage}</p>
        </div>
      ) : null}

      {data.missingSpecMessage ? (
        <div className={`${bm.card} border-amber-100 bg-amber-50/40 p-4`}>
          <p className="text-sm font-bold text-slate-800">{data.missingSpecMessage}</p>
        </div>
      ) : null}

      {!batteryFocus && data.hero ? (
        <section className={`${bm.heroPanel} p-4`}>
          <p className="text-[10px] font-bold text-slate-500">{data.hero.statusLabel}</p>
          <h2 className="mt-2 text-lg font-black leading-snug text-slate-950 sm:text-xl">{data.hero.title}</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{data.hero.message}</p>
          <Link className={`${bm.btnNavy} mt-4 inline-flex`} href={data.hero.href}>
            {data.hero.detailLabel}
          </Link>
        </section>
      ) : null}

      {data.isSparse && !data.hero ? (
        <div className={`${bm.card} border-amber-100 bg-amber-50/40 p-4`}>
          <p className="text-sm font-bold text-slate-800">
            {data.insufficientMessage ?? "정확한 차량 정보가 부족합니다."}
          </p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
            차량명 + 연식 + 연료를 함께 입력하면 더 정확하게 확인할 수 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.emptySuggestions.map((s) => (
              <Link
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:text-slate-800"
                href={getSearchHref(s)}
                key={s}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/^k3$/i.test((data.query || "").trim()) && visibleVehicles.length > 1 ? (
        <div className={`${bm.alertInfo} ${bm.cardPad}`}>
          <p className="text-sm font-bold text-slate-900">K3는 세대·연료별로 규격이 다릅니다. 아래에서 선택하세요.</p>
        </div>
      ) : null}

      {visibleVehicles.length > 0 ? (
        <section
          className={`${bm.sectionBlock} ${bm.sectionBlockPad} motion-safe:transition motion-safe:duration-200 motion-safe:hover:shadow-[var(--bm-shadow-md)]`}
          data-search-section="vehicles"
        >
          <SearchVehicleResults
            query={data.displayQuery || data.query}
            rows={visibleVehicles}
            totalCount={data.vehiclesTotal}
          />
          <ExpandToggle
            expanded={vehiclesOpen}
            hiddenCount={data.vehiclesTotal - limit}
            label="차량 결과"
            onToggle={() => setVehiclesOpen((v) => !v)}
          />
        </section>
      ) : null}

      {visibleBatteriesFiltered.length > 0 ? (
        <Section desc="검색어에 포함된 배터리 규격" title="관련 배터리 규격">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleBatteriesFiltered.map((item) => {
              const b = getBattery(item.code);
              return (
                <div key={item.code} className="transition duration-200 hover:-translate-y-0.5">
                  <BatteryImageCard
                    brandBadgeMax={2}
                    capacity={b.capacity}
                    cca={b.cca}
                    code={item.code}
                    fit={batteryImageFit(item.code)}
                    href={item.href}
                    ratio="16/9"
                    role="main"
                    searchLayout
                    showBrandBadges
                    terminal={b.terminal}
                    type={b.type}
                    imageSet={b.images}
                  />
                  {item.variantNote ? (
                    <p className="mt-1 text-[10px] font-medium text-slate-500">{item.variantNote}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <ExpandToggle
            expanded={batteriesOpen}
            hiddenCount={Math.max(0, batteriesFiltered.length - limit)}
            label="배터리 결과"
            onToggle={() => setBatteriesOpen((v) => !v)}
          />
        </Section>
      ) : null}

      {data.popularBatteries.length > 0 ? (
        <Section desc="검색어와 직접 연결되지 않은 참고 규격" title="인기 배터리 규격 (참고)">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.popularBatteries.map((item) => {
              const b = getBattery(item.code);
              return (
                <BatteryImageCard
                  key={item.code}
                  brandBadgeMax={1}
                  capacity={b.capacity}
                  cca={b.cca}
                  code={item.code}
                  fit={batteryImageFit(item.code)}
                  href={item.href}
                  ratio="16/9"
                  role="main"
                  searchLayout
                  showBrandBadges
                  terminal={b.terminal}
                  type={b.type}
                  imageSet={b.images}
                />
              );
            })}
          </div>
        </Section>
      ) : null}

      {visibleQuestions.length > 0 ? (
        <Section desc="검색어와 직접 관련된 질문" title="관련 질문">
          <ul className="space-y-1.5">
            {visibleQuestions.map((q) => (
              <li key={q.id}>
                <Link
                  className="block rounded-lg px-3 py-2.5 transition hover:bg-slate-50 ring-1 ring-slate-100"
                  href={q.href}
                >
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{q.title}</p>
                  {q.subtitle ? (
                    <p className="mt-0.5 line-clamp-1 text-xs font-normal text-slate-400">{q.subtitle}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <ExpandToggle
            expanded={questionsOpen}
            hiddenCount={data.questionsTotal - limit}
            label="질문"
            onToggle={() => setQuestionsOpen((v) => !v)}
          />
        </Section>
      ) : null}

      {visibleGuides.length > 0 ? (
        <Section desc="검색 키워드와 연결된 가이드" title="관련 가이드">
          <ul className="space-y-1.5">
            {visibleGuides.map((g) => (
              <li key={g.id}>
                <Link
                  className="block rounded-lg px-3 py-2.5 transition hover:bg-slate-50 ring-1 ring-slate-100"
                  href={g.href}
                >
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{g.title}</p>
                  {g.subtitle ? (
                    <p className="mt-0.5 line-clamp-1 text-xs font-normal text-slate-400">{g.subtitle}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <ExpandToggle
            expanded={guidesOpen}
            hiddenCount={data.guidesTotal - limit}
            label="가이드"
            onToggle={() => setGuidesOpen((v) => !v)}
          />
        </Section>
      ) : null}

      {(batteryFocus || data.deferSecondary) &&
      !secondaryOpen &&
      (data.questionsTotal > 0 || data.guidesTotal > 0) ? (
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          onClick={() => setSecondaryOpen(true)}
        >
          관련 결과 더보기
          {data.questionsTotal + data.guidesTotal > 0
            ? ` (질문 ${data.questionsTotal} · 가이드 ${data.guidesTotal})`
            : ""}
        </button>
      ) : null}

      <PlatformHubLinks title="검색 후 확인하기" limit={6} />

      {hasHero ? <SearchMobileStickyCta actions={data.ux.mobileSticky} /> : null}
    </div>
  );
}
