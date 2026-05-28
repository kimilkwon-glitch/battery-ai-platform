import Link from "next/link";
import type { SearchUxChip } from "@/lib/search/search-ux-presentation";

export function SearchConditionChips({ chips }: { chips: SearchUxChip[] }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2" data-search-condition-chips>
      {chips.map((chip) => (
        <Link
          key={`${chip.label}-${chip.href}`}
          href={chip.href}
          className={
            chip.active
              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
              : chip.variant === "hint"
                ? "rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:border-amber-300"
                : "rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300"
          }
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
