"use client";

import { useState } from "react";
import type { BatteryBrandBadge } from "@/lib/battery-alias-map";
import { getBatteryBrandBadges } from "@/lib/battery-alias-map";

const toneClass: Record<BatteryBrandBadge["tone"], { default: string; onDark: string }> = {
  rocket: {
    default: "bg-red-50 text-red-700 ring-red-100",
    onDark: "bg-white/15 text-white ring-white/25",
  },
  solite: {
    default: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    onDark: "bg-white/15 text-emerald-100 ring-white/25",
  },
  delkor: {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    onDark: "bg-white/15 text-white ring-white/25",
  },
  neutral: {
    default: "bg-slate-100 text-slate-600 ring-slate-200",
    onDark: "bg-white/10 text-slate-100 ring-white/20",
  },
  meta: {
    default: "bg-blue-50 text-blue-700 ring-blue-100",
    onDark: "bg-white/15 text-blue-100 ring-white/25",
  },
};

export function BatteryBrandBadges({
  code,
  badges,
  maxVisible = 3,
  variant = "default",
  className = "",
}: {
  code: string;
  badges?: BatteryBrandBadge[];
  maxVisible?: number;
  variant?: "default" | "onDark";
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const list = badges ?? getBatteryBrandBadges(code);
  if (list.length === 0) return null;

  const visible = expanded ? list : list.slice(0, maxVisible);
  const hidden = list.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visible.map((b) => (
        <span
          key={b.key}
          className={`inline-flex max-w-full items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-tight ring-1 ${toneClass[b.tone][variant]}`}
        >
          <span className="truncate">{b.text}</span>
        </span>
      ))}
      {!expanded && hidden > 0 ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(true);
          }}
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black ring-1 ${
            variant === "onDark" ? "bg-white/10 text-white ring-white/20" : "bg-slate-50 text-slate-500 ring-slate-200"
          }`}
        >
          +{hidden}
        </button>
      ) : null}
    </div>
  );
}

export { getBatteryBrandBadges };
