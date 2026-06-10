"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Send, Store, X } from "lucide-react";
import { BatteryTalkCarIcon } from "@/components/batterytalk/BatteryTalkCarIcon";
import { BATTERY_TALK_QUICK_CHIPS } from "@/lib/battery-talk/battery-talk-chat-copy";
import { BatteryTalkSseStatusBanner } from "@/components/batterytalk/BatteryTalkSseStatusBanner";
import {
  appendUniqueMessage,
  useBatteryTalkSessionStream,
} from "@/lib/battery-talk/battery-talk-realtime-client";
import {
  fetchBatteryTalkThread,
  getStoredBatteryTalkThreadId,
  openBatteryTalkThread,
  sendBatteryTalkMessage,
  storeBatteryTalkThreadId,
} from "@/lib/battery-talk/battery-talk-client";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import type { BatteryTalkOpenDetail } from "@/lib/batterytalk/batterytalk-constants";
import { CONTACT } from "@/lib/contact-info";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";
import { bm } from "@/lib/design-tokens";
import type { BatteryTalkMessage } from "@/types/battery-talk";

function formatChatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function BatteryTalkPanel({
  open,
  onClose,
  onResumeOrder,
  preset,
  settings,
  draft: controlledDraft,
  onDraftChange,
  showProductOrderCta = false,
  onThreadIdChange,
}: {
  open: boolean;
  onClose: () => void;
  onResumeOrder?: () => void;
  preset?: BatteryTalkOpenDetail;
  settings?: ConsultationChannelSettings | null;
  draft?: string;
  onDraftChange?: (value: string) => void;
  showProductOrderCta?: boolean;
  onThreadIdChange?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BatteryTalkMessage[]>([]);
  const [phone, setPhone] = useState("");
  const [internalDraft, setInternalDraft] = useState("");
  const draft = controlledDraft ?? internalDraft;
  const setDraft = onDraftChange ?? setInternalDraft;
  const [phoneDraft, setPhoneDraft] = useState("");
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingBodyRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const buildContext = useCallback(() => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;
    return {
      pageUrl,
      pageType: inferBatteryTalkPageType(pageUrl),
      topic: preset?.topic,
      batteryCode: preset?.batteryCode,
      productCode: preset?.productCode ?? preset?.batteryCode,
      productName: preset?.productName,
      vehicleSlug: preset?.vehicleSlug,
      vehicleName: preset?.vehicleName,
      selectedFuel: preset?.fuelType,
      cartSummary: preset?.orderSummary,
    };
  }, [preset]);

  const threadScope = useCallback(
    () => ({
      batteryCode: preset?.batteryCode,
      productCode: preset?.productCode,
    }),
    [preset?.batteryCode, preset?.productCode],
  );

  const initThread = useCallback(async () => {
    setLoading(true);
    setInitError(null);
    const scope = threadScope();
    const stored = getStoredBatteryTalkThreadId(scope);
    if (stored) {
      const existing = await fetchBatteryTalkThread(stored);
      if (existing.ok && existing.messages) {
        setThreadId(stored);
        setMessages(existing.messages);
        setPhone(existing.phone ?? "");
        setLoading(false);
        return;
      }
    }
    const created = await openBatteryTalkThread({ context: buildContext() });
    setLoading(false);
    if (created.ok && created.threadId && created.messages) {
      storeBatteryTalkThreadId(created.threadId, scope);
      setThreadId(created.threadId);
      setMessages(created.messages);
      setPhone(created.phone ?? "");
    } else {
      setInitError("채팅을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }, [buildContext, threadScope]);

  useEffect(() => {
    if (!open) {
      setInitError(null);
      setSendError(null);
      setLoading(false);
      return;
    }
    setShowPhonePrompt(false);
    pendingBodyRef.current = null;
    void initThread();
  }, [open, initThread, preset?.batteryCode, preset?.productCode]);

  const streamDisconnected = useBatteryTalkSessionStream(
    threadId,
    (message) => {
      setMessages((prev) => {
        const base =
          message.sender === "customer" ? prev.filter((m) => !m.id.startsWith("opt-")) : prev;
        return appendUniqueMessage(base, message);
      });
    },
    open && Boolean(threadId),
  );

  useEffect(() => {
    if (open && messages.length) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  useEffect(() => {
    if (threadId) onThreadIdChange?.(threadId);
  }, [threadId, onThreadIdChange]);

  const doSend = async (body: string, contactPhone?: string) => {
    if (!threadId || !body.trim()) return;
    setSending(true);
    setSendError(null);

    const optimistic: BatteryTalkMessage = {
      id: `opt-${Date.now()}`,
      sender: "customer",
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const result = await sendBatteryTalkMessage({
      threadId,
      body: body.trim(),
      phone: contactPhone?.trim() || phone || undefined,
    });
    setSending(false);

    if (result.ok) {
      if (result.messages) {
        setMessages(result.messages);
      }
      if (result.phone) setPhone(result.phone);
      setShowPhonePrompt(false);
      pendingBodyRef.current = null;
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setSendError("메시지 전송에 실패했습니다.");
      setDraft(body);
    }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    if (!phone.trim()) {
      pendingBodyRef.current = body;
      setShowPhonePrompt(true);
      return;
    }
    await doSend(body);
  };

  const handlePhoneConfirm = async () => {
    const contact = phoneDraft.trim();
    if (!contact) {
      setSendError("연락처를 입력해 주세요.");
      return;
    }
    setPhone(contact);
    const body = pendingBodyRef.current ?? draft.trim();
    if (body) await doSend(body, contact);
    else setShowPhonePrompt(false);
  };

  const handleChip = (message: string) => {
    setDraft(message);
  };

  const handleResumeOrder = () => {
    if (onResumeOrder) onResumeOrder();
    else onClose();
  };

  const productCode = preset?.batteryCode ?? preset?.productCode;
  const ext = settings?.externalChannelsEnabled;
  const naverUrl = settings?.naverTalkUrl?.trim();
  const kakaoUrl = settings?.kakaoChannelUrl?.trim();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[90] bg-slate-900/45 backdrop-blur-[1px]"
            aria-label="배터리톡 닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-labelledby="batterytalk-title"
            className="batterytalk-panel fixed bottom-0 left-0 right-0 z-[91] mx-auto flex max-h-[min(88vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl max-sm:pb-[env(safe-area-inset-bottom,0px)] sm:bottom-6 sm:left-auto sm:right-6 sm:rounded-2xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22 }}
          >
            <header className="batterytalk-panel__head flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0891B2] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <BatteryTalkCarIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 id="batterytalk-title" className="text-sm font-black text-white">
                    배터리톡
                  </h2>
                  <p className="text-[10px] font-semibold text-white/80">실시간 규격·장착 상담</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white hover:bg-white/10"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </header>

            <BatteryTalkSseStatusBanner show={streamDisconnected} variant="customer" />

            <div className="batterytalk-chat__messages flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <p className="py-8 text-center text-sm font-medium text-slate-500">채팅 연결 중…</p>
              ) : initError && messages.length === 0 ? (
                <p className="py-6 text-center text-xs font-semibold text-red-600">{initError}</p>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`batterytalk-chat__bubble batterytalk-chat__bubble--${msg.sender}`}
                    >
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      {msg.sender !== "system" ? (
                        <span className="batterytalk-chat__time">{formatChatTime(msg.createdAt)}</span>
                      ) : null}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {!loading && messages.length > 0 && messages.every((m) => m.sender === "system") ? (
              <div className="batterytalk-chat__chips shrink-0 border-t border-slate-100 px-3 py-2">
                {BATTERY_TALK_QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="batterytalk-chat__chip"
                    onClick={() => handleChip(chip.message)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            ) : null}

            {showPhonePrompt ? (
              <div className="batterytalk-chat__phone-prompt shrink-0 border-t border-amber-100 bg-amber-50">
                <p className="batterytalk-chat__phone-label">답변을 위해 연락처를 남겨주세요.</p>
                <div className="batterytalk-chat__phone-form">
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="batterytalk-chat__input batterytalk-chat__phone-input"
                    placeholder="010-0000-0000"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handlePhoneConfirm();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="batterytalk-chat__phone-submit"
                    disabled={sending}
                    onClick={() => void handlePhoneConfirm()}
                  >
                    등록
                  </button>
                </div>
                {sendError ? (
                  <p className="batterytalk-chat__phone-error" role="alert">
                    {sendError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {sendError && !showPhonePrompt ? (
              <p className="shrink-0 px-3 pb-1 text-xs font-semibold text-red-600">{sendError}</p>
            ) : null}

            {onResumeOrder ? (
              <div className="batterytalk-panel__resume shrink-0 border-t border-slate-100 px-3 py-2.5">
                {showProductOrderCta && productCode ? (
                  <button
                    type="button"
                    className="batterytalk-panel__resume-btn batterytalk-panel__resume-btn--primary"
                    onClick={handleResumeOrder}
                  >
                    이 규격으로 주문하기
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`batterytalk-panel__resume-btn${
                    showProductOrderCta && productCode
                      ? " batterytalk-panel__resume-btn--secondary"
                      : " batterytalk-panel__resume-btn--primary"
                  }`}
                  onClick={handleResumeOrder}
                >
                  상담 닫고 주문 계속하기
                </button>
              </div>
            ) : null}

            <footer className="batterytalk-chat__composer shrink-0 border-t border-slate-100 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  className="batterytalk-chat__input min-h-[2.5rem] flex-1 resize-none"
                  rows={1}
                  placeholder="메시지를 입력하세요"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={loading || sending}
                />
                <button
                  type="button"
                  className="batterytalk-chat__send-btn"
                  aria-label="보내기"
                  disabled={loading || sending || !draft.trim()}
                  onClick={() => void handleSend()}
                >
                  <Send className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={CONTACT.customerCenter.tel}
                  className={`${bm.btnTertiary} gap-1 px-2.5 py-1.5 text-[10px] font-black`}
                >
                  <Phone className="size-3" />
                  전화 문의
                </a>
                <Link
                  href={HUB_STORE_DETAIL}
                  className={`${bm.btnTertiary} gap-1 px-2.5 py-1.5 text-[10px] font-black`}
                >
                  <Store className="size-3" />
                  매장 안내
                </Link>
                {ext && naverUrl ? (
                  <a
                    href={naverUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bm.btnTertiary} px-2.5 py-1.5 text-[10px] font-black`}
                  >
                    네이버 톡톡
                  </a>
                ) : null}
                {ext && kakaoUrl ? (
                  <a
                    href={kakaoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bm.btnTertiary} px-2.5 py-1.5 text-[10px] font-black`}
                  >
                    카카오 채널
                  </a>
                ) : null}
              </div>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
