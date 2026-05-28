import Link from "next/link";
import {
  formatDimensions,
  getBrandSpecsForNormalizedCode,
  getNormalizedBatterySummary,
  terminalLayoutLabel,
} from "@/data/battery/batterySpecIndex";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { bm } from "@/lib/design-tokens";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SpecComparisonTable } from "@/components/battery/SpecComparisonTable";

type Props = {
  code: string;
  showBrandTable?: boolean;
};

export function BatterySpecSummary({ code, showBrandTable = true }: Props) {
  const display = canonicalBatteryCode(code) || code;
  const summary = getNormalizedBatterySummary(display);
  if (!summary) return null;

  const brandSpecs = getBrandSpecsForNormalizedCode(display);
  const uniqueBrands = [...new Set(brandSpecs.map((s) => s.brand))];
  const dims = formatDimensions(summary.dimensionsMm);

  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <SectionHeader label="제원 데이터" title="대표 규격 요약" />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {summary.seriesLabel ? <BatterySpecBadge tone="blue">{summary.seriesLabel} 계열</BatterySpecBadge> : null}
        <BatterySpecBadge tone="blue">{summary.family}</BatterySpecBadge>
        {summary.capacityAh20Hr ? (
          <BatterySpecBadge tone="green">{summary.capacityAh20Hr}Ah (20HR)</BatterySpecBadge>
        ) : null}
        {summary.capacityAh5Hr ? (
          <BatterySpecBadge tone="green">{summary.capacityAh5Hr}Ah (5HR)</BatterySpecBadge>
        ) : null}
        {summary.cca ? <BatterySpecBadge tone="green">CCA {summary.cca}A</BatterySpecBadge> : null}
        {summary.rc ? <BatterySpecBadge tone="green">RC {summary.rc}</BatterySpecBadge> : null}
        <BatterySpecBadge tone="gray">{terminalLayoutLabel(summary.terminalLayout)}</BatterySpecBadge>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {dims ? (
          <div className={bm.surfaceMuted + " px-3 py-2"}>
            <dt className="font-black text-slate-400">크기</dt>
            <dd className="mt-0.5 font-bold text-slate-800">{dims}</dd>
          </div>
        ) : null}
        {summary.weightKg ? (
          <div className={bm.surfaceMuted + " px-3 py-2"}>
            <dt className="font-black text-slate-400">중량</dt>
            <dd className="mt-0.5 font-bold text-slate-800">{summary.weightKg}kg</dd>
          </div>
        ) : null}
        <div className={bm.surfaceMuted + " px-3 py-2 sm:col-span-2"}>
          <dt className="font-black text-slate-400">단자</dt>
          <dd className="mt-0.5 font-bold text-slate-800">
            {summary.terminalPolarity !== "UNKNOWN" ? `${summary.terminalPolarity} · ` : ""}
            {summary.terminalType !== "UNKNOWN" ? summary.terminalType : "타입 확인"}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">{summary.expertMemo}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-500">{summary.brandVarianceNote}</p>

      {summary.confusionSpecs.length > 0 ? (
        <p className="mt-2 text-xs font-medium text-amber-900">
          혼동 주의: {summary.confusionSpecs.join(" · ")}
        </p>
      ) : null}

      {showBrandTable && uniqueBrands.length > 0 ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className={bm.cardTitle}>브랜드별 제원 비교</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            로케트·쏠라이트 등 표기와 CCA·중량이 조금씩 다를 수 있습니다.
          </p>
          <div className="mt-3">
            <SpecComparisonTable specs={brandSpecs} />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link className={bm.btnTertiary + " text-xs"} href="/compare">
          비교해보기
        </Link>
        <Link className={bm.btnTertiary + " text-xs"} href="/photo-check">
          사진으로 확인
        </Link>
      </div>
    </section>
  );
}
