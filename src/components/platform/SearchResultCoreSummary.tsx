import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";

export type CoreSummaryRow = {
  key: string;
  label: string;
  value: string;
  highlight?: boolean;
};

export function SearchResultCoreSummary({ rows }: { rows: CoreSummaryRow[] }) {
  if (!rows.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className="min-w-[calc(50%-4px)] flex-1 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100 sm:min-w-[140px]"
        >
          <p className="text-[10px] font-bold text-slate-400">{row.label}</p>
          {row.highlight ? (
            <p className="mt-0.5 text-sm font-black text-[var(--bm-primary)]">{row.value}</p>
          ) : (
            <p className="mt-0.5 text-xs font-bold text-slate-900">{row.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function SearchResultSpecChips({
  typeLabel,
  seriesLabel,
  terminalLabel,
}: {
  typeLabel: string;
  seriesLabel: string;
  terminalLabel: string | null;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <BatterySpecBadge tone="blue">{typeLabel}</BatterySpecBadge>
      <BatterySpecBadge tone="gray">{seriesLabel}</BatterySpecBadge>
      {terminalLabel ? <BatterySpecBadge tone="gray">{terminalLabel}</BatterySpecBadge> : null}
    </div>
  );
}
