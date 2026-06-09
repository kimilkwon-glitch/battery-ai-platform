"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { CONTACT } from "@/lib/contact-info";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

export function FloatingActionDock() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  if (
    pathname?.startsWith("/__ai-audit") ||
    pathname === "/ai-audit" ||
    pathname?.startsWith("/batteries/") ||
    pathname?.startsWith("/battery-specs/")
  ) {
    return null;
  }
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
                className="bm-floating-btn flex items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-lg"
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
                  className="bm-floating-btn flex items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-lg"
                  aria-label="공식 채널"
                >
                  <Store className="size-5" />
                </button>
                {channelOpen ? (
                  <div className="bm-floating-panel absolute bottom-14 right-0 w-48 bg-white p-2">
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
                                {ch.id === "instagram" || ch.id === "youtube" ? "안내" : "연결"}
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
                  <div className="bm-floating-panel absolute bottom-14 right-0 w-48 bg-white p-2">
                    <a
                      href={CONTACT.customerCenter.tel}
                      className="block rounded-lg px-2 py-2 text-[11px] font-black text-slate-800 hover:bg-slate-50"
                    >
                      고객센터
                      <span className="mt-0.5 block font-semibold text-blue-700">
                        {CONTACT.customerCenter.phone}
                      </span>
                    </a>
                    <Link
                      href={HUB_STORE_DETAIL}
                      className="mt-1 block rounded-lg px-2 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-700"
                    >
                      매장별 번호는 매장 안내에서 확인
                    </Link>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => openChat()}
                className="bm-floating-btn bm-floating-btn--primary flex items-center justify-center text-white shadow-lg hover:bg-[var(--bm-primary)]"
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
            "bm-floating-btn flex size-12 items-center justify-center shadow-lg",
            expanded
              ? "border border-slate-200 bg-white text-slate-700"
              : "bm-floating-btn--primary text-white",
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
