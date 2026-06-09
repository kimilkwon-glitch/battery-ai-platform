"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Battery, MessageCircle } from "lucide-react";
import { BatteryTalkPanel } from "@/components/batterytalk/BatteryTalkPanel";
import {
  BATTERYTALK_OPEN_EVENT,
  type BatteryTalkOpenDetail,
} from "@/lib/batterytalk/batterytalk-events";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";

export function BatteryTalkFloating() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<BatteryTalkOpenDetail | undefined>();
  const [settings, setSettings] = useState<ConsultationChannelSettings | null>(null);

  const hiddenRoutes =
    pathname?.startsWith("/__ai-audit") ||
    pathname === "/ai-audit" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout");

  const openTalk = useCallback((detail?: BatteryTalkOpenDetail) => {
    setPreset(detail);
    setOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<BatteryTalkOpenDetail>;
      openTalk(ce.detail);
    };
    window.addEventListener(BATTERYTALK_OPEN_EVENT, handler);
    return () => window.removeEventListener(BATTERYTALK_OPEN_EVENT, handler);
  }, [openTalk]);

  useEffect(() => {
    void fetch("/api/consultation/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; settings?: ConsultationChannelSettings }) => {
        if (d.ok && d.settings) setSettings(d.settings);
      })
      .catch(() => undefined);
  }, []);

  if (hiddenRoutes || settings?.batteryTalkEnabled === false) return null;

  return (
    <>
      <div
        className="batterytalk-floating fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6"
        data-component="batterytalk-floating"
      >
        <button
          type="button"
          onClick={() => openTalk()}
          className="batterytalk-floating__btn group flex items-center gap-2 rounded-full bg-gradient-to-br from-[#0F172A] via-[#2563EB] to-[#06B6D4] px-4 py-3 text-white shadow-[0_8px_28px_rgba(37,99,235,0.45)] transition hover:scale-[1.03] active:scale-[0.98]"
          aria-label="배터리톡 상담"
        >
          <span className="relative flex size-8 items-center justify-center rounded-full bg-white/15">
            <Battery className="size-4" aria-hidden />
            <MessageCircle className="absolute -bottom-0.5 -right-0.5 size-3.5 fill-white text-[#2563EB]" aria-hidden />
          </span>
          <span className="text-sm font-black tracking-tight">배터리톡</span>
          <span className="batterytalk-floating__dot absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white" aria-hidden />
        </button>
      </div>

      <BatteryTalkPanel open={open} onClose={() => setOpen(false)} preset={preset} settings={settings} />
    </>
  );
}
