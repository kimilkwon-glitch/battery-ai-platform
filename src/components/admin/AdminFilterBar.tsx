"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type FilterDef = {
  key: string;
  label: string;
  type: "search" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type Props = {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
  resultCount?: { filtered: number; total: number };
};

export function AdminFilterBar({ filters, values, onChange, onReset, resultCount }: Props) {
  const hasActive = filters.some((f) => (values[f.key] ?? "").trim() !== "");

  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-bar__fields">
        {filters.map((f) => (
          <div key={f.key} className="admin-filter-bar__field">
            <label className="admin-filter-bar__label">{f.label}</label>
            {f.type === "search" ? (
              <Input
                className="admin-filter-bar__input"
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder ?? "검색"}
              />
            ) : (
              <Select
                className="admin-filter-bar__input"
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
              >
                <option value="">전체</option>
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            )}
          </div>
        ))}
      </div>
      <div className="admin-filter-bar__actions">
        {resultCount ? (
          <p className="admin-filter-bar__count">
            {resultCount.filtered} / {resultCount.total}건
          </p>
        ) : null}
        {onReset && hasActive ? (
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--md" onClick={onReset}>
            초기화
          </button>
        ) : null}
      </div>
    </div>
  );
}
