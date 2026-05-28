"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import { ConversionActions } from "@/components/common/ConversionActions";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { CompareRelatedQna } from "@/components/platform/CompareRelatedQna";
import { AppIcon } from "@/components/common/AppIcon";
import { ComparePresetHub } from "@/components/platform/hub/ComparePresetHub";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";
import {
  CardInfoDesc,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
import { bm } from "@/lib/design-tokens";
import {
  BRAND_COMPARE_LABEL,
  buildCompareTableRows,
  compareCautions,
  compareDefaultVisibleCodes,
  compareRecommendedPairs,
  getComparisonDescription,
  getKeyDiffs,
  getPickGuideItems,
} from "@/lib/compare-utils";
import { batteries, compareHref, getBattery, getVehicleName, type Battery } from "@/lib/platform-data";

function SelectedBatteryCard({
  battery,
  imageBrand,
  side,
}: {
  battery: ReturnType<typeof getBattery>;
  imageBrand: BatteryBrandKey;
  side: "left" | "right";
}) {
  const images = getBatteryImageSet(battery.code, imageBrand);
  return (
    <div
      className={`${bm.compareSpecCol} flex flex-col ${
        side === "left" ? "lg:rounded-r-none lg:border-r-0" : "lg:rounded-l-none"
      }`}
    >
      <div className="flex flex-col md:grid md:grid-cols-[44%_56%]">
        <div className={`${bm.cardHorizontalMedia} !rounded-none !border-r-0 md:!min-h-[152px]`}>
          <BatteryImageStage
            code={battery.code}
            variant="compare"
            imageSet={images?.main ? images : battery.images}
            className="h-full w-full !ring-0"
            flushTop
            layout="row"
          />
        </div>
        <div className={bm.cardHorizontalBody}>
          <CardInfoStack>
            <CardInfoTitleRow
              iconKey="batterySpec"
              title={battery.code}
              titleClassName="spec-code md:text-lg"
            />
            <p className={`${bm.specData} text-[11px]`}>
              {battery.capacity} · CCA {battery.cca} · {battery.terminal}타입
            </p>
            <CardInfoDesc className="line-clamp-3 text-[11px]">{battery.pros}</CardInfoDesc>
          </CardInfoStack>
        </div>
      </div>
    </div>
  );
}

export function CompareClient({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    initial.length >= 2 ? initial.slice(0, 2) : ["AGM70L", "AGM80L"],
  );
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [imageBrand] = useState<BatteryBrandKey>("rocket");

  const codeA = selected[0] ?? "AGM70L";
  const codeB = selected[1] ?? "AGM80L";
  const batA = getBattery(codeA);
  const batB = getBattery(codeB);

  const selectPair = useCallback(
    (a: string, b: string) => {
      setSelected([a, b]);
      router.replace(compareHref(a, b), { scroll: false });
    },
    [router],
  );

  const toggle = useCallback(
    (code: string) => {
      setSelected((prev) => {
        let next: string[];
        if (prev.includes(code)) {
          next = prev.filter((c) => c !== code);
          if (next.length === 0) return prev;
        } else if (prev.length < 2) {
          next = [...prev, code];
        } else {
          next = [prev[1], code];
        }
        if (next.length >= 2) router.replace(compareHref(...next), { scroll: false });
        return next.length >= 2 ? next : prev;
      });
    },
    [router],
  );

  const visibleCodes = useMemo(() => {
    const defaultSet = new Set<string>(compareDefaultVisibleCodes);
    selected.forEach((c) => defaultSet.add(c));
    return batteries.filter((b) => defaultSet.has(b.code));
  }, [selected]);

  const extraBatteries = useMemo(() => {
    const defaultSet = new Set<string>(compareDefaultVisibleCodes);
    return batteries.filter((b) => !defaultSet.has(b.code));
  }, []);

  const filteredExtra = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return extraBatteries;
    return extraBatteries.filter(
      (b) => b.code.toLowerCase().includes(q) || b.type.toLowerCase().includes(q),
    );
  }, [extraBatteries, search]);

  const tableRows = buildCompareTableRows(batA, batB);
  const keyDiffs = getKeyDiffs(batA, batB);
  const description = getComparisonDescription(batA, batB);
  const pairLabel = `${codeA} vs ${codeB}`;

  return (
    <div className={`${bm.hubCatalog} space-y-5`}>
      <ComparePresetHub />

      {/* 선택 중인 비교 */}
      <section className={bm.intentSummary}>
        <p className={`${bm.intentBadge} inline-flex items-center gap-1.5`}>
          <AppIcon iconKey="compare" size="sm" />
          비교 리포트
        </p>
        <p className={`mt-2 ${bm.specTitle} flex items-center gap-2 text-lg`} data-spec-code>
          <AppIcon iconKey="compareVs" size="md" />
          <span>
            {codeA} <span className="text-[var(--bm-muted)]">vs</span> {codeB}
          </span>
        </p>
      </section>

      {/* 추천 조합 */}
      <section>
        <p className={bm.label}>추천 비교 조합</p>
        <div className="mt-2 flex flex-wrap gap-2">
        {compareRecommendedPairs.map((pair) => {
          const active = codeA === pair.a && codeB === pair.b;
          return (
            <button
              type="button"
              key={pair.label}
              onClick={() => selectPair(pair.a, pair.b)}
              className={active ? bm.tabBtnActive : bm.tabBtn}
            >
              {pair.label}
            </button>
          );
        })}
        </div>
      </section>

      {/* 비교 요약 — 주인공 */}
      <section className={bm.reportCard}>
        <div className={bm.reportCardHeader}>
          <p className={bm.label}>{BRAND_COMPARE_LABEL}</p>
          <h2 className={`${bm.specTitle} mt-1`} data-spec-code>
            {pairLabel}
          </h2>
          <p className={`mt-2 max-w-3xl ${bm.textSub}`}>{description}</p>
        </div>

        <div className="relative flex flex-col gap-3 p-3 lg:flex-row lg:gap-0 lg:p-0">
          <SelectedBatteryCard battery={batA} imageBrand={imageBrand} side="left" />
          <div className="flex items-center justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--bm-navy)] text-xs font-black text-white shadow-[var(--bm-shadow-md)] ring-4 ring-white">
              VS
            </span>
          </div>
          <SelectedBatteryCard battery={batB} imageBrand={imageBrand} side="right" />
        </div>

        <div className={`${bm.surfaceMuted} mx-4 mb-4 mt-0 p-4 lg:mx-5`}>
          <p className={bm.cardTitle}>핵심 차이</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {keyDiffs.map((d) => (
              <li key={d} className={`flex gap-2 ${bm.textSub} text-xs`}>
                <span className="font-bold text-slate-400" aria-hidden>
                  •
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 비교 테이블 */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className={bm.cardTitle}>상세 비교 스펙</h2>
        <p className={`mt-0.5 ${bm.muted} text-xs`}>모바일은 카드형 · PC는 표 형식</p>

        <div className="mt-4 space-y-2 md:hidden">
          {tableRows.map((row) => (
            <div
              key={row.label}
              className={`${bm.surfaceMuted} p-3 ${row.caution ? "!border-orange-200 !bg-orange-50/40" : ""}`}
            >
              <p className="text-[10px] font-black uppercase tracking-wide text-[var(--bm-muted)]">{row.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="spec-code text-[10px] font-bold text-[var(--bm-primary)]">{codeA}</p>
                  <CellValue value={row.a} showHigher={row.higherSide === "a"} caution={row.caution} />
                </div>
                <div>
                  <p className="spec-code text-[10px] font-bold text-[var(--bm-accent)]">{codeB}</p>
                  <CellValue value={row.b} showHigher={row.higherSide === "b"} caution={row.caution} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black text-slate-400">
                <th className="pb-3 pr-4">항목</th>
                <th className="pb-3 pr-4 text-blue-700">{codeA}</th>
                <th className="pb-3"> {codeB}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-slate-100 ${row.highlight ? "bg-blue-50/30" : ""} ${row.caution ? "bg-amber-50/40" : ""}`}
                >
                  <td className="py-3 pr-4 font-black text-slate-600">{row.label}</td>
                  <td className="py-3 pr-4">
                    <CellValue
                      value={row.a}
                      showHigher={row.higherSide === "a"}
                      caution={row.caution}
                    />
                  </td>
                  <td className="py-3">
                    <CellValue
                      value={row.b}
                      showHigher={row.higherSide === "b"}
                      caution={row.caution}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
          {batA.vehicleIds.slice(0, 2).map((id) => (
            <Link key={id} href={`/vehicle/${id}`} className="text-blue-600 hover:underline">
              {getVehicleName(id)} ({codeA})
            </Link>
          ))}
          {batB.vehicleIds.slice(0, 2).map((id) => (
            <Link key={id} href={`/vehicle/${id}`} className="text-blue-600 hover:underline">
              {getVehicleName(id)} ({codeB})
            </Link>
          ))}
        </div>
      </section>

      {/* 이럴 때 선택 */}
      <section className="grid gap-3 sm:grid-cols-2">
        {[batA, batB].map((b) => (
          <div key={b.code} className={`${bm.cardPremium} ${bm.cardPad}`}>
            <p className="spec-code text-sm font-black text-[var(--bm-primary)]" data-spec-code>
              {b.code} 선택 가이드
            </p>
            <ul className="mt-2 space-y-1.5">
              {getPickGuideItems(b).map((item) => (
                <li key={item} className={`flex gap-2 ${bm.textSub} text-xs`}>
                  <span className={`${bm.badge} ${bm.badgeGreen}`}>적합</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className={`${bm.warningPanel} sm:col-span-2`}>
          <p className={bm.cardTitle}>주의 · 단순 대체 금지</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {compareCautions.map((c) => (
              <li key={c} className="text-sm font-medium text-amber-800">
                · {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 배터리 선택 — 보조 영역 */}
      <section className={`${bm.card} ${bm.cardPad} bg-[var(--bm-surface-muted)]`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-black text-slate-400">보조 선택</p>
            <h2 className="text-sm font-black text-slate-900">다른 배터리와 비교하기</h2>
          </div>
          <span className="text-xs font-bold text-blue-600">{pairLabel}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleCodes.map((b) => (
            <PickerCard
              key={b.code}
              battery={b}
              selected={selected.includes(b.code)}
              imageBrand={imageBrand}
              onToggle={() => toggle(b.code)}
            />
          ))}
        </div>

        {expanded ? (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <input
              className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="규격 검색 (예: CMF, DIN, EV)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {filteredExtra.map((b) => (
                <PickerCard
                  key={b.code}
                  battery={b}
                  selected={selected.includes(b.code)}
                  imageBrand={imageBrand}
                  onToggle={() => toggle(b.code)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          {expanded ? "접기" : `배터리 더 선택하기 (${extraBatteries.length}개)`}
        </button>
      </section>

      <section className={bm.platformStrip}>
        <p className={bm.label}>다음 단계</p>
        <h2 className={`${bm.titleMd} mt-1`}>비교 후에도 헷갈리면</h2>
        <p className={`mt-2 ${bm.textSub}`}>
          두 규격 중 어떤 배터리가 맞는지는 차량 연식·연료·트레이 공간·단자 방향에 따라 달라질 수
          있습니다. 정확한 확인은 차량 정보 또는 현재 배터리 사진을 기준으로 진행해 주세요.
        </p>
        <ConversionActions
          className="mt-4"
          primary={{ label: "오주문 방지 체크", href: HUB_ORDER_CHECKLIST }}
          secondary={{ label: "사진 확인 안내", href: "/photo-check" }}
          tertiary={{ label: "내 차 기준 검색", href: "/vehicles" }}
        />
        <Link className={`${bm.btnTertiary} mt-2 inline-flex text-xs`} href="/guide/spec?guide=agm-vs-din">
          AGM/DIN 가이드
        </Link>
      </section>

      <CompareRelatedQna codes={selected} />

      <SmartNextActions
        context={{ type: "compare", batteryCode: codeA, vehicleId: batA.vehicleIds[0] }}
        limit={3}
      />
    </div>
  );
}

function CellValue({
  value,
  showHigher,
  caution,
}: {
  value: string;
  showHigher?: boolean;
  caution?: boolean;
}) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 font-semibold ${caution ? "text-amber-800" : "text-slate-800"}`}>
      {value}
      {showHigher ? (
        <span className={`${bm.badge} ${bm.badgeCyan}`}>높음</span>
      ) : null}
    </span>
  );
}

function PickerCard({
  battery,
  selected,
  onToggle,
}: {
  battery: Battery;
  selected: boolean;
  imageBrand: BatteryBrandKey;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex max-w-full flex-col rounded-xl border px-3 py-2.5 text-left transition ${
        selected ? bm.tabBtnActive : bm.tabBtn
      }`}
    >
      <span className={`text-sm font-black ${selected ? "text-white" : "text-slate-900"}`}>{battery.code}</span>
      <span className={`mt-0.5 text-[10px] font-semibold ${selected ? "text-blue-100" : "text-slate-500"}`}>
        {battery.capacity} · {battery.terminal}
      </span>
    </button>
  );
}
