import { getBaseBatterySpec } from "@/data/battery/baseSpecs";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { bm } from "@/lib/design-tokens";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";

type Props = {
  code: string;
  showBrandNote?: boolean;
};

export function BatterySpecSummary({ code, showBrandNote = true }: Props) {
  const display = canonicalBatteryCode(code) || code;
  const spec = getBaseBatterySpec(display);
  if (!spec) return null;

  const terminal =
    spec.terminalLayout === "L" ? "L타입" : spec.terminalLayout === "R" ? "R타입" : "확인 필요";

  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <p className={bm.label}>제원 요약</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <BatterySpecBadge tone="blue">{spec.family}</BatterySpecBadge>
        {spec.capacityAh20Hr ? <BatterySpecBadge tone="green">{spec.capacityAh20Hr}Ah</BatterySpecBadge> : null}
        {spec.cca ? <BatterySpecBadge tone="green">CCA {spec.cca}</BatterySpecBadge> : null}
        <BatterySpecBadge tone="gray">{terminal}</BatterySpecBadge>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {spec.dimensionsMm.length ? (
          <div className={bm.surfaceMuted + " px-3 py-2"}>
            <dt className="font-black text-slate-400">치수(mm)</dt>
            <dd className="mt-0.5 font-bold text-slate-800">
              {spec.dimensionsMm.length}×{spec.dimensionsMm.width}×{spec.dimensionsMm.height}
            </dd>
          </div>
        ) : null}
        {spec.terminalType ? (
          <div className={bm.surfaceMuted + " px-3 py-2"}>
            <dt className="font-black text-slate-400">단자</dt>
            <dd className="mt-0.5 font-bold text-slate-800">{spec.terminalType}</dd>
          </div>
        ) : null}
      </dl>
      {spec.notes.length ? (
        <ul className="mt-2 space-y-1">
          {spec.notes.slice(0, 2).map((n) => (
            <li key={n} className="text-xs font-medium text-slate-600">
              · {n}
            </li>
          ))}
        </ul>
      ) : null}
      {showBrandNote && spec.brandVariancePossible ? (
        <p className="mt-2 text-[10px] font-medium text-slate-400">브랜드별 제원 차이가 있을 수 있습니다.</p>
      ) : null}
    </section>
  );
}
