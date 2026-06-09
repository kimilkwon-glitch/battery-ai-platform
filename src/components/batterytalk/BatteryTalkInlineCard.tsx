"use client";

import { BatteryTalkCarIcon } from "@/components/batterytalk/BatteryTalkCarIcon";
import { openBatteryTalk, type BatteryTalkOpenDetail } from "@/lib/batterytalk/batterytalk-events";

type Props = {
  preset?: BatteryTalkOpenDetail;
  className?: string;
};

export function BatteryTalkInlineCard({ preset, className = "" }: Props) {
  return (
    <div
      className={`batterytalk-inline-card flex items-center gap-2.5 rounded-xl border border-blue-100/70 bg-gradient-to-r from-slate-50/90 via-white to-blue-50/50 px-3 py-2.5 shadow-sm ${className}`}
      data-component="batterytalk-inline-card"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F172A] to-[#2563EB] text-white shadow-sm">
        <BatteryTalkCarIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-slate-900">궁금하면 배터리톡</p>
        <p className="text-[10px] font-semibold text-slate-500">실시간 규격·장착 상담</p>
      </div>
      <button
        type="button"
        onClick={() => openBatteryTalk(preset)}
        className="batterytalk-inline-card__cta shrink-0 rounded-lg bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#06B6D4] px-3 py-2 text-xs font-black text-white shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
      >
        채팅 열기
      </button>
    </div>
  );
}
