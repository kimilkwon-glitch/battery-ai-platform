import type { HTMLAttributes } from "react";
import type { ContentUiIconKey } from "@/lib/content-ui-icons";
import type { ContentUiIconSize } from "@/components/content/ContentUiIcon";

const SIZE_CLASS: Record<ContentUiIconSize, string> = {
  32: "h-8 w-8 text-base",
  36: "h-9 w-9 text-base",
  44: "h-11 w-11 text-lg",
  48: "h-12 w-12 text-xl",
  52: "h-[52px] w-[52px] text-xl",
};

const TONE: Record<ContentUiIconKey, string> = {
  "start-delay": "bg-amber-50 text-amber-800 ring-amber-200/80",
  "low-voltage": "bg-cyan-50 text-cyan-900 ring-cyan-200/80",
  "bms-registration": "bg-violet-50 text-violet-900 ring-violet-200/80",
  "dashcam-drain": "bg-orange-50 text-orange-900 ring-orange-200/80",
  "photo-analysis": "bg-blue-50 text-blue-800 ring-blue-200/80",
  "battery-compare": "bg-indigo-50 text-indigo-900 ring-indigo-200/80",
  upgrade: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  "spec-guide": "bg-slate-100 text-slate-800 ring-slate-200/80",
  faq: "bg-slate-100 text-slate-700 ring-slate-200/80",
  caution: "bg-red-50 text-red-800 ring-red-200/80",
  "shopping-notice": "bg-slate-50 text-slate-700 ring-slate-200/80",
};

const GLYPH: Record<ContentUiIconKey, string> = {
  "start-delay": "⚡",
  "low-voltage": "12V",
  "bms-registration": "BMS",
  "dashcam-drain": "📹",
  "photo-analysis": "📷",
  "battery-compare": "⇄",
  upgrade: "↑",
  "spec-guide": "AGM",
  faq: "?",
  caution: "!",
  "shopping-notice": "🛒",
};

/** PNG asset 없을 때 Q&A·카드용 — 질문 유형별 구분 표시 */
export function ContentUiIconGlyph({
  iconKey,
  size = 48,
  className = "",
  ...rest
}: {
  iconKey: ContentUiIconKey;
  size?: ContentUiIconSize;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-black leading-none ring-1 ${SIZE_CLASS[size]} ${TONE[iconKey]} ${className}`}
      aria-hidden
      {...rest}
    >
      <span className="select-none">{GLYPH[iconKey]}</span>
    </span>
  );
}
