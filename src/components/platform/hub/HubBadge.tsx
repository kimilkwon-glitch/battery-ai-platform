import type { HubBadgeTone } from "@/lib/platform-hub-content";

const TONE_CLASS: Record<HubBadgeTone, string> = {
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-100/80",
  warn: "bg-orange-50 text-orange-800 ring-orange-100/80",
  check: "bg-blue-50 text-blue-800 ring-blue-100/80",
  neutral: "bg-slate-50 text-slate-600 ring-slate-200/80",
};

export function HubBadge({ label, tone = "neutral" }: { label: string; tone?: HubBadgeTone }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${TONE_CLASS[tone]}`}>
      {label}
    </span>
  );
}
