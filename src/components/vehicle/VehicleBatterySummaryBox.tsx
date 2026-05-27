import type { VehicleBatterySummary } from "@/lib/vehicleBattery";
import { bm } from "@/lib/design-tokens";

export function VehicleBatterySummaryBox({
  title,
  summary,
}: {
  title: string;
  summary: VehicleBatterySummary | null;
}) {
  if (!summary) {
    return (
      <div className={`${bm.warningPanel}`}>
        <p className="text-sm font-black text-slate-800">{title} 배터리 요약</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          연료·연식별 배터리 정보를 정리 중입니다. 아래 연료별 추천 카드를 확인해 주세요.
        </p>
      </div>
    );
  }

  if (summary.lines.length > 1) {
    return null;
  }

  const rep = summary.lines[0]?.battery ?? summary.representativeBattery;

  return (
    <div className={`${bm.card} ${bm.cardPad}`}>
      <p className={bm.label}>대표 규격</p>
      {rep ? <p className="mt-1 text-2xl font-black text-[var(--bm-primary)]">{rep}</p> : null}
      <p className="mt-2 text-[11px] font-medium text-slate-500">
        아래 연료별 카드에서 규격·이미지를 확인하세요.
      </p>
    </div>
  );
}
