"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { BatteryTalkCarIcon } from "@/components/batterytalk/BatteryTalkCarIcon";
import { BatteryTalkPanel } from "@/components/batterytalk/BatteryTalkPanel";
import {
  BATTERYTALK_OPEN_EVENT,
  type BatteryTalkOpenDetail,
} from "@/lib/batterytalk/batterytalk-events";
import { CONTACT } from "@/lib/contact-info";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";

function isProductDetailPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/batteries/") ||
    pathname.startsWith("/battery-specs/") ||
    pathname.startsWith("/products/")
  );
}

export function BatteryTalkFloating() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<BatteryTalkOpenDetail | undefined>();
  const [settings, setSettings] = useState<ConsultationChannelSettings | null>(null);

  const hiddenRoutes =
    pathname?.startsWith("/__ai-audit") ||
    pathname === "/ai-audit" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    isProductDetailPage(pathname);

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
        className="batterytalk-floating fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6"
        data-component="batterytalk-floating"
      >
        <a
          href={CONTACT.customerCenter.tel}
          className="batterytalk-floating__phone flex size-[52px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:scale-[1.04] sm:size-14"
          aria-label="전화 문의"
        >
          <Phone className="size-5" aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => openTalk()}
          className="batterytalk-floating__btn relative flex size-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#0F172A] via-[#2563EB] to-[#06B6D4] text-white shadow-[0_6px_22px_rgba(37,99,235,0.4)] transition hover:scale-[1.05] active:scale-[0.97] sm:size-[56px]"
          aria-label="배터리톡 열기"
        >
          <BatteryTalkCarIcon className="size-6 sm:size-7" />
          <span
            className="batterytalk-floating__dot absolute right-0.5 top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white"
            aria-hidden
          />
        </button>
      </div>

      <BatteryTalkPanel open={open} onClose={() => setOpen(false)} preset={preset} settings={settings} />
    </>
  );
}
