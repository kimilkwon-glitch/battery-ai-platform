import type { BatteryBrandSpec } from "@/data/battery/types";
import {
  BRAND_LABEL,
  confidenceNote,
  formatDimensionsDisplay,
  formatSpecValue,
  formatTerminalDisplay,
  hasSpecValue,
  isFieldListedMissing,
  specsShowRcColumn,
  specsShowWeightColumn,
} from "@/data/battery/spec-helpers";

type Props = {
  specs: BatteryBrandSpec[];
  compact?: boolean;
  showTerminal?: boolean;
};

export function SpecComparisonTable({ specs, compact = false, showTerminal = true }: Props) {
  if (specs.length === 0) return null;

  const rows = specs.slice(0, compact ? 4 : 8);
  const showRc = specsShowRcColumn(rows);
  const showWeight = specsShowWeightColumn(rows);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-3">브랜드</th>
            <th className="py-2 pr-3">표기</th>
            <th className="py-2 pr-3">20HR</th>
            <th className="py-2 pr-3">CCA</th>
            {showRc ? <th className="py-2 pr-3">RC</th> : null}
            <th className="py-2 pr-3">크기(mm)</th>
            {showTerminal ? <th className="py-2 pr-3">단자</th> : null}
            {showWeight ? <th className="py-2">중량</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const size = formatDimensionsDisplay(s.dimensionsMm);
            const weightMissing =
              isFieldListedMissing(s, "weightKg") || s.weightKg === undefined;
            const rcVal = s.rc != null ? formatSpecValue(s.rc) : formatSpecValue(undefined);

            return (
              <tr className="border-b border-slate-100" key={`${s.brand}-${s.code}`}>
                <td className="py-2.5 pr-3 font-black text-slate-900">{BRAND_LABEL[s.brand]}</td>
                <td className="py-2.5 pr-3">
                  <span className="font-semibold text-slate-800">{s.productName || s.code}</span>
                </td>
                <td className="py-2.5 pr-3">
                  {hasSpecValue(s.capacityAh20Hr)
                    ? formatSpecValue(s.capacityAh20Hr, "Ah")
                    : formatSpecValue(undefined)}
                </td>
                <td className="py-2.5 pr-3">
                  {hasSpecValue(s.cca) ? formatSpecValue(s.cca, "A") : formatSpecValue(undefined)}
                </td>
                {showRc ? (
                  <td className="py-2.5 pr-3">
                    <span
                      className={
                        s.rc != null ? "font-semibold text-slate-800" : "text-slate-400"
                      }
                    >
                      {rcVal}
                      {confidenceNote(s.fieldConfidence?.rc) ? (
                        <span className="ml-1 text-[9px] font-medium text-slate-400">
                          ({confidenceNote(s.fieldConfidence?.rc)})
                        </span>
                      ) : null}
                    </span>
                  </td>
                ) : null}
                <td className="py-2.5 pr-3">
                  <span className={size ? "font-semibold text-slate-800" : "text-slate-400"}>
                    {size ?? formatSpecValue(undefined)}
                  </span>
                </td>
                {showTerminal ? (
                  <td className="py-2.5 pr-3 text-[10px] font-medium text-slate-600">
                    {formatTerminalDisplay(s)}
                  </td>
                ) : null}
                {showWeight ? (
                  <td className="py-2.5">
                    <span
                      className={
                        !weightMissing && s.weightKg != null
                          ? "font-semibold text-slate-800"
                          : "text-slate-400"
                      }
                    >
                      {weightMissing ? formatSpecValue(undefined) : formatSpecValue(s.weightKg, "kg")}
                    </span>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
      {specs.length > rows.length ? (
        <p className="mt-2 text-[10px] font-medium text-slate-400">
          외 {specs.length - rows.length}개 표기 — 라벨·사진 확인
        </p>
      ) : null}
    </div>
  );
}
