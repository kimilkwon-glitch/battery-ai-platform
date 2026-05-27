import { bm } from "@/lib/design-tokens";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";

type BatterySummary = {
  code: string;
  capacity: string;
  cca: string;
  terminal: string;
  note?: string;
};

export function ComparisonSummary({
  left,
  right,
  headline,
  description,
}: {
  left: BatterySummary;
  right: BatterySummary;
  headline?: string;
  description?: string;
}) {
  return (
    <section className={`${bm.heroPanel} ${bm.cardPad}`}>
      {headline ? <p className={bm.label}>{headline}</p> : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[left, right].map((bat) => (
          <div key={bat.code} className={`${bm.card} ${bm.cardPad}`}>
            <p className="text-lg font-black text-[var(--bm-primary)]">{bat.code}</p>
            <p className="mt-1 text-sm font-bold text-slate-700">
              {bat.capacity} · {bat.cca} · {bat.terminal}타입
            </p>
            {bat.note ? <p className="mt-2 text-xs font-medium text-slate-500">{bat.note}</p> : null}
          </div>
        ))}
      </div>
      {description ? <p className="mt-3 text-sm font-medium text-slate-600">{description}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <BatterySpecBadge tone="blue">용량·CCA 차이</BatterySpecBadge>
        <BatterySpecBadge tone="amber">ISG/BMS 확인</BatterySpecBadge>
        <BatterySpecBadge tone="green">차종 호환</BatterySpecBadge>
      </div>
    </section>
  );
}
