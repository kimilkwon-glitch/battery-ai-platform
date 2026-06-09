"use client";

import { Battery, MessageCircle } from "lucide-react";
import { openBatteryTalk, type BatteryTalkOpenDetail } from "@/lib/batterytalk/batterytalk-events";

type Props = {
  preset?: BatteryTalkOpenDetail;
  className?: string;
};

export function BatteryTalkInlineCard({ preset, className = "" }: Props) {
  return (
    <div
      className={`batterytalk-inline-card rounded-2xl border border-blue-100/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 shadow-sm ${className}`}
      data-component="batterytalk-inline-card"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F172A] to-[#2563EB] text-white shadow-md">
          <Battery className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-slate-900">궁금할 땐 배터리톡</h3>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">규격·장착 문의</p>
          <button
            type="button"
            onClick={() => openBatteryTalk(preset)}
            className="batterytalk-inline-card__cta mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#06B6D4] px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:scale-[1.01]"
          >
            <MessageCircle className="size-4" aria-hidden />
            배터리톡 상담 시작
          </button>
        </div>
      </div>
    </div>
  );
}
