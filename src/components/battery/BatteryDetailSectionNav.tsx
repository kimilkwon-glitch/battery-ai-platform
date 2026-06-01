"use client";

const SECTIONS = [
  { id: "battery-detail-info", label: "상세 정보" },
  { id: "battery-reviews", label: "리뷰" },
  { id: "battery-vehicles", label: "호환 차량" },
  { id: "battery-spec-check", label: "규격 확인" },
] as const;

export function BatteryDetailSectionNav() {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm scrollbar-none"
      aria-label="상세 섹션"
      data-battery-section-nav
    >
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="shrink-0 rounded-lg px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 hover:text-blue-700 aria-[current]:bg-blue-50 aria-[current]:text-blue-800"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
