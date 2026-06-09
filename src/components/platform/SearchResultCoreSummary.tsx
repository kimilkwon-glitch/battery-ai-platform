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
    <div className="search-core-summary">
      {rows.map((row) => (
        <span
          key={row.key}
          className={`search-core-summary__pill${row.highlight ? " search-core-summary__pill--highlight" : ""}`}
        >
          <span className="search-core-summary__pill-label">{row.label}</span>
          <span className="search-core-summary__pill-value">{row.value}</span>
        </span>
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
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <BatterySpecBadge tone="blue">{typeLabel}</BatterySpecBadge>
      <BatterySpecBadge tone="gray">{seriesLabel}</BatterySpecBadge>
      {terminalLabel ? <BatterySpecBadge tone="gray">{terminalLabel}</BatterySpecBadge> : null}
    </div>
  );
}
