import type { BatteryBrandSpec } from "@/data/battery/types";
import { BRAND_LABEL, terminalTypeLabel } from "@/data/battery/spec-helpers";
import { formatTerminalDisplay } from "@/data/battery/batterySpecIndex";
import { bm } from "@/lib/design-tokens";

function cell(value: string | number | null | undefined, missing = "확인 필요") {
  const v = value == null || value === "" ? missing : String(value);
  return (
    <span className={v === missing ? "text-slate-400" : "font-semibold text-slate-800"}>{v}</span>
  );
}

type Props = {
  specs: BatteryBrandSpec[];
  compact?: boolean;
  showTerminal?: boolean;
};

export function SpecComparisonTable({ specs, compact = false, showTerminal = true }: Props) {
  if (specs.length === 0) return null;

  const rows = specs.slice(0, compact ? 4 : 8);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-3">브랜드</th>
            <th className="py-2 pr-3">표기</th>
            <th className="py-2 pr-3">20HR</th>
            <th className="py-2 pr-3">CCA</th>
            <th className="py-2 pr-3">RC</th>
            <th className="py-2 pr-3">크기(mm)</th>
            {showTerminal ? <th className="py-2 pr-3">단자</th> : null}
            <th className="py-2">중량</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const size = s.dimensionsMm
              ? `${s.dimensionsMm.length}×${s.dimensionsMm.width}×${s.dimensionsMm.height}`
              : null;
            return (
              <tr className="border-b border-slate-100" key={`${s.brand}-${s.code}`}>
                <td className="py-2.5 pr-3 font-black text-slate-900">{BRAND_LABEL[s.brand]}</td>
                <td className="py-2.5 pr-3">{cell(s.productName || s.code)}</td>
                <td className="py-2.5 pr-3">
                  {cell(s.capacityAh20Hr != null ? `${s.capacityAh20Hr}Ah` : null)}
                </td>
                <td className="py-2.5 pr-3">{cell(s.cca != null ? `${s.cca}A` : null)}</td>
                <td className="py-2.5 pr-3">{cell(s.rc)}</td>
                <td className="py-2.5 pr-3">{cell(size)}</td>
                {showTerminal ? (
                  <td className="py-2.5 pr-3 text-[10px] font-medium text-slate-600">
                    {formatTerminalDisplay(s)}
                  </td>
                ) : null}
                <td className="py-2.5">{cell(s.weightKg != null ? `${s.weightKg}kg` : null)}</td>
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
