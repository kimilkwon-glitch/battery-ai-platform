"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import { BatteryTalkCarIcon } from "@/components/batterytalk/BatteryTalkCarIcon";
import { BatteryTalkPanel } from "@/components/batterytalk/BatteryTalkPanel";
import {
  fetchBatteryTalkThread,
  getStoredBatteryTalkThreadId,
} from "@/lib/battery-talk/battery-talk-client";
import { useBatteryTalkSessionStream } from "@/lib/battery-talk/battery-talk-realtime-client";
import {
  BATTERYTALK_OPEN_EVENT,
  type BatteryTalkOpenDetail,
} from "@/lib/batterytalk/batterytalk-events";
import { CONTACT } from "@/lib/contact-info";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";
import type { BatteryTalkMessage } from "@/types/battery-talk";

const REPLY_TOAST_MS = 2600;

function isProductDetailPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/batteries/") ||
    pathname.startsWith("/battery-specs/") ||
    pathname.startsWith("/products/")
  );
}

function presetSignature(detail?: BatteryTalkOpenDetail): string {
  return [
    detail?.batteryCode ?? "",
    detail?.productCode ?? "",
    detail?.topic ?? "",
    detail?.vehicleSlug ?? "",
  ].join("|");
}

function scrollToOrderPanel() {
  requestAnimationFrame(() => {
    const target =
      document.getElementById("battery-order") ??
      document.querySelector<HTMLElement>("[data-battery-order-panel-cta]");
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function readMarkerKey(threadId: string): string {
  return `bm-bt-last-read:${threadId}`;
}

function markThreadRead(threadId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(readMarkerKey(threadId), String(Date.now()));
}

function isAdminMessageUnread(threadId: string, message: BatteryTalkMessage): boolean {
  if (message.sender !== "admin") return false;
  if (typeof window === "undefined") return true;
  const raw = sessionStorage.getItem(readMarkerKey(threadId));
  if (!raw) return true;
  return new Date(message.createdAt).getTime() > Number(raw);
}

function lastNonSystemMessage(messages: BatteryTalkMessage[]): BatteryTalkMessage | undefined {
  return [...messages].reverse().find((m) => m.sender !== "system");
}

export function BatteryTalkFloating() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<BatteryTalkOpenDetail | undefined>();
  const [settings, setSettings] = useState<ConsultationChannelSettings | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [sessionThreadId, setSessionThreadId] = useState<string | null>(null);
  const [hasUnreadReply, setHasUnreadReply] = useState(false);
  const [showReplyToast, setShowReplyToast] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const lastPresetSigRef = useRef("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disabledRoutes =
    pathname?.startsWith("/__ai-audit") ||
    pathname === "/ai-audit" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/payment") ||
    pathname?.startsWith("/order-complete") ||
    pathname?.startsWith("/order-request");

  const hideBatteryTalkFab = disabledRoutes || isProductDetailPage(pathname);
  const showPhoneFab = !disabledRoutes;

  const openFromEventRef = useRef(false);

  const clearReplyAlert = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setHasUnreadReply(false);
    setShowReplyToast(false);
    setIsShaking(false);
  }, []);

  const triggerReplyAlert = useCallback(() => {
    setHasUnreadReply(true);
    setShowReplyToast(true);
    setIsShaking(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowReplyToast(false);
      toastTimerRef.current = null;
    }, REPLY_TOAST_MS);
  }, []);

  const syncStoredThreadId = useCallback(() => {
    const stored = getStoredBatteryTalkThreadId({ pathname: pathname ?? undefined });
    setSessionThreadId(stored);
    return stored;
  }, [pathname]);

  const openTalk = useCallback((detail?: BatteryTalkOpenDetail) => {
    openFromEventRef.current = true;
    const sig = presetSignature(detail);
    if (sig !== lastPresetSigRef.current) {
      setChatDraft("");
      lastPresetSigRef.current = sig;
    }
    setPreset(detail);
    setOpen(true);
  }, []);

  const handleResumeOrder = useCallback(() => {
    setOpen(false);
    scrollToOrderPanel();
  }, []);

  const handleThreadIdChange = useCallback((threadId: string) => {
    setSessionThreadId(threadId);
  }, []);

  const handleClose = useCallback(() => {
    if (sessionThreadId) markThreadRead(sessionThreadId);
    setOpen(false);
    syncStoredThreadId();
  }, [sessionThreadId, syncStoredThreadId]);

  useEffect(() => {
    if (openFromEventRef.current) {
      openFromEventRef.current = false;
      return;
    }
    setOpen(false);
    setPreset(undefined);
    clearReplyAlert();
  }, [pathname, clearReplyAlert]);

  useEffect(() => {
    syncStoredThreadId();
  }, [syncStoredThreadId]);

  useEffect(() => {
    if (open) {
      clearReplyAlert();
      if (sessionThreadId) markThreadRead(sessionThreadId);
    }
  }, [open, sessionThreadId, clearReplyAlert]);

  useEffect(() => {
    if (open || !sessionThreadId) return;
    let cancelled = false;
    void fetchBatteryTalkThread(sessionThreadId).then((result) => {
      if (cancelled || !result.ok || !result.messages?.length) return;
      const last = lastNonSystemMessage(result.messages);
      if (last?.sender === "admin" && isAdminMessageUnread(sessionThreadId, last)) {
        setHasUnreadReply(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, sessionThreadId]);

  useBatteryTalkSessionStream(
    sessionThreadId,
    (message) => {
      if (open || message.sender !== "admin" || !sessionThreadId) return;
      if (!isAdminMessageUnread(sessionThreadId, message)) return;
      triggerReplyAlert();
    },
    !open && Boolean(sessionThreadId) && !hideBatteryTalkFab,
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<BatteryTalkOpenDetail>;
      requestAnimationFrame(() => openTalk(ce.detail));
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

  if (disabledRoutes || settings?.batteryTalkEnabled === false) return null;

  return (
    <>
      {showPhoneFab ? (
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
          {!hideBatteryTalkFab ? (
            <div className="batterytalk-floating__btn-wrap">
              {showReplyToast ? (
                <p className="batterytalk-floating__toast" role="status" aria-live="polite">
                  답변 도착
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => openTalk()}
                className={clsx(
                  "batterytalk-floating__btn relative flex size-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#0F172A] via-[#2563EB] to-[#06B6D4] text-white shadow-[0_6px_22px_rgba(37,99,235,0.4)] transition hover:scale-[1.05] active:scale-[0.97] sm:size-[56px]",
                  isShaking && "batterytalk-floating__btn--shake",
                  hasUnreadReply && "batterytalk-floating__btn--unread-pulse",
                )}
                aria-label={hasUnreadReply ? "배터리톡 열기 — 새 답변" : "배터리톡 열기"}
                onAnimationEnd={() => setIsShaking(false)}
              >
                <BatteryTalkCarIcon className="size-6 sm:size-7" />
                <span
                  className="batterytalk-floating__dot absolute bottom-0.5 left-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white"
                  aria-hidden
                />
                {hasUnreadReply ? (
                  <span className="batterytalk-floating__unread" aria-hidden />
                ) : null}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <BatteryTalkPanel
        open={open}
        onClose={handleClose}
        onResumeOrder={handleResumeOrder}
        preset={preset}
        settings={settings}
        draft={chatDraft}
        onDraftChange={setChatDraft}
        showProductOrderCta={isProductDetailPage(pathname)}
        onThreadIdChange={handleThreadIdChange}
      />
    </>
  );
}
