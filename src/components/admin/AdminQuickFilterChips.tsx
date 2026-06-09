"use client";

import { cn } from "@/lib/utils";

export type AdminQuickChip = {
  id: string;
  label: string;
};

type Props = {
  chips: AdminQuickChip[];
  activeId: string | null;
  onChange: (id: string | null) => void;
  className?: string;
};

/** 빠른 차종·유형 필터 — 가로 스크롤 칩 */
export function AdminQuickFilterChips({ chips, activeId, onChange, className }: Props) {
  return (
    <div className={cn("admin-quick-chips", className)}>
      <button
        type="button"
        className={cn("admin-quick-chips__chip", !activeId && "admin-quick-chips__chip--active")}
        onClick={() => onChange(null)}
      >
        전체
      </button>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className={cn(
            "admin-quick-chips__chip",
            activeId === chip.id && "admin-quick-chips__chip--active",
          )}
          onClick={() => onChange(activeId === chip.id ? null : chip.id)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
