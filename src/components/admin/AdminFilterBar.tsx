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
};

export function AdminFilterBar({ filters, values, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3">
      {filters.map((f) => (
        <div key={f.key} className="min-w-[140px] flex-1">
          <label className="mb-1 block text-[10px] font-bold text-slate-500">{f.label}</label>
          {f.type === "search" ? (
            <Input
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.placeholder ?? "검색"}
            />
          ) : (
            <Select
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
  );
}
