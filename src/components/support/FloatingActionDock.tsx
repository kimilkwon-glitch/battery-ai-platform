"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  MessageCircle,
  Phone,
  Store,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import { ChatInquiryPanel } from "@/components/support/ChatInquiryPanel";
import {
  CHAT_INQUIRY_OPEN_EVENT,
  type ChatInquiryOpenDetail,
} from "@/lib/chat-inquiry-events";
import { SOCIAL_OFFICIAL_CHANNELS } from "@/lib/official-channels";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";

export function FloatingActionDock() {
  const [expanded, setExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPreset, setChatPreset] = useState<ChatInquiryOpenDetail | undefined>();
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);

  const openChat = useCallback((detail?: ChatInquiryOpenDetail) => {
    setChatPreset(detail);
    setChatOpen(true);
    setExpanded(false);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ChatInquiryOpenDetail>;
      openChat(ce.detail);
    };
    window.addEventListener(CHAT_INQUIRY_OPEN_EVENT, handler);
    return () => window.removeEventListener(CHAT_INQUIRY_OPEN_EVENT, handler);
  }, [openChat]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setExpanded(false);
  };

  const floatingChannels = SOCIAL_OFFICIAL_CHANNELS;

  return (
    <>
      <div
        className="bm-floating-dock fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
        data-component="floating-dock"
      >
        <AnimatePresence>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-col items-end gap-2"
            >
              <button
                type="button"
                onClick={scrollTop}
                className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                aria-label="맨 위로"
              >
                <ArrowUp className="size-5" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setChannelOpen((v) => !v);
                    setPhoneOpen(false);
                  }}
                  className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5"
                  aria-label="공식 채널"
                >
                  <Store className="size-5" />
                </button>
                {channelOpen ? (
                  <div className="absolute bottom-14 right-0 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <p className="px-2 py-1 text-[10px] font-black text-slate-500">공식 운영 채널</p>
                    <ul className="space-y-1">
                      {floatingChannels.map((ch) => (
                        <li key={ch.id}>
                          {ch.href && ch.status === "active" ? (
                            <a
                              href={ch.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg px-2 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-50"
                            >
                              {ch.label}
                            </a>
                          ) : (
                            <span className="block rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-400">
                              {ch.label}{" "}
                              <span className="text-[9px]">
                                {ch.id === "instagram" || ch.id === "youtube" ? "예정" : "준비중"}
                              </span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneOpen((v) => !v);
                    setChannelOpen(false);
                  }}
                  className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5"
                  aria-label="고객센터 전화"
                >
                  <Phone className="size-5" />
                </button>
                {phoneOpen ? (
                  <div className="absolute bottom-14 right-0 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {BUSAN_STORES.map((s) => (
                      <a
                        key={s.id}
                        href={s.phoneTel}
                        className="block rounded-lg px-2 py-2 text-[11px] font-black text-slate-800 hover:bg-slate-50"
                      >
                        {s.name} 전화
                        <span className="mt-0.5 block font-semibold text-blue-700">{s.phone}</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => openChat()}
                className="flex size-11 items-center justify-center rounded-full bg-[var(--bm-navy)] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--bm-primary)]"
                aria-label="채팅상담"
              >
                <MessageCircle className="size-5" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={clsx(
            "flex size-12 items-center justify-center rounded-full shadow-lg transition",
            expanded
              ? "border border-slate-200 bg-white text-slate-700"
              : "bg-[var(--bm-navy)] text-white hover:bg-[var(--bm-primary)]",
          )}
          aria-expanded={expanded}
          aria-label={expanded ? "도구 접기" : "상담 도구 펼치기"}
        >
          {expanded ? <ChevronUp className="size-5" /> : <MessageCircle className="size-5" />}
        </button>
      </div>

      <ChatInquiryPanel open={chatOpen} onClose={() => setChatOpen(false)} preset={chatPreset} />
    </>
  );
}
