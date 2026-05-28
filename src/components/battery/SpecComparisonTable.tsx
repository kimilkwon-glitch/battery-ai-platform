import type { BatteryBrandSpec } from "@/data/battery/types";
import { bm } from "@/lib/design-tokens";

function cell(value: string | number | null | undefined, missing = "—") {
  const v = value == null || value === "" ? missing : String(value);
  return <span className={v === missing ? "text-slate-400" : "font-semibold text-slate-800"}>{v}</span>;
}

type Props = {
  specs: BatteryBrandSpec[];
  compact?: boolean;
};

export function SpecComparisonTable({ specs, compact = false }: Props) {
  if (specs.length === 0) return null;

  const rows = specs.slice(0, compact ? 4 : 6);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-3">브랜드</th>
            <th className="py-2 pr-3">표기</th>
            <th className="py-2 pr-3">20HR</th>
            <th className="py-2 pr-3">5HR</th>
            <th className="py-2 pr-3">CCA</th>
            <th className="py-2 pr-3">RC</th>
            <th className="py-2 pr-3">크기(mm)</th>
            <th className="py-2">중량</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const brandLabel =
              s.brand === "ROCKET"
                ? "로케트"
                : s.brand === "SOLITE"
                  ? "쏠라이트"
                  : s.brand === "DELKOR"
                    ? "델코"
                    : s.brand === "ATLASBX"
                      ? "아트라스BX"
                      : s.brand;
            const size = s.dimensionsMm
              ? `${s.dimensionsMm.length}×${s.dimensionsMm.width}×${s.dimensionsMm.height}`
              : null;
            return (
              <tr className="border-b border-slate-100" key={`${s.brand}-${s.code}`}>
                <td className="py-2.5 pr-3 font-black text-slate-900">{brandLabel}</td>
                <td className="py-2.5 pr-3">{cell(s.code)}</td>
                <td className="py-2.5 pr-3">{cell(s.capacityAh20Hr != null ? `${s.capacityAh20Hr}Ah` : null)}</td>
                <td className="py-2.5 pr-3">{cell(s.capacityAh5Hr != null ? `${s.capacityAh5Hr}Ah` : null)}</td>
                <td className="py-2.5 pr-3">{cell(s.cca != null ? `${s.cca}A` : null)}</td>
                <td className="py-2.5 pr-3">{cell(s.rc)}</td>
                <td className="py-2.5 pr-3">{cell(size)}</td>
                <td className="py-2.5">{cell(s.weightKg != null ? `${s.weightKg}kg` : null)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {specs.length > rows.length ? (
        <p className="mt-2 text-[10px] font-medium text-slate-400">외 {specs.length - rows.length}개 브랜드 표기 — 상세는 라벨 확인</p>
      ) : null}
    </div>
  );
}
