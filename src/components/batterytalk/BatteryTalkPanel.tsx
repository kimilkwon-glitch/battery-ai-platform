"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Plus, Send, Store, X } from "lucide-react";
import { BatteryTalkCarIcon } from "@/components/batterytalk/BatteryTalkCarIcon";
import { BATTERY_TALK_QUICK_CHIPS } from "@/lib/battery-talk/battery-talk-chat-copy";
import { BatteryTalkSseStatusBanner } from "@/components/batterytalk/BatteryTalkSseStatusBanner";
import {
  appendUniqueMessage,
  useBatteryTalkSessionStream,
} from "@/lib/battery-talk/battery-talk-realtime-client";
import {
  clearStoredBatteryTalkThreadId,
  fetchBatteryTalkThread,
  fetchBatteryTalkVisitorHistory,
  getStoredBatteryTalkThreadId,
  openBatteryTalkThread,
  sendBatteryTalkMessage,
  storeBatteryTalkThreadId,
  type BatteryTalkVisitorHistoryItem,
} from "@/lib/battery-talk/battery-talk-client";
import { getOrCreateBatteryTalkVisitorId, registerBatteryTalkThreadForVisitor } from "@/lib/battery-talk/battery-talk-visitor";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import type { BatteryTalkOpenDetail } from "@/lib/batterytalk/batterytalk-constants";
import { CONTACT } from "@/lib/contact-info";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
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
  const { isLoggedIn, member, ready: authReady } = useCustomerAuth();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BatteryTalkMessage[]>([]);
  const [isNewInquiryDraft, setIsNewInquiryDraft] = useState(false);
  const [internalDraft, setInternalDraft] = useState("");
  const draft = controlledDraft ?? internalDraft;
  const setDraft = onDraftChange ?? setInternalDraft;
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [visitorHistory, setVisitorHistory] = useState<BatteryTalkVisitorHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bootstrapGenRef = useRef(0);

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

  const loadVisitorHistory = useCallback(async () => {
    setHistoryLoading(true);
    const items = await fetchBatteryTalkVisitorHistory();
    setVisitorHistory(items);
    setHistoryLoading(false);
    return items;
  }, []);

  const enterNewInquiryDraft = useCallback(() => {
    clearStoredBatteryTalkThreadId(threadScope());
    setThreadId(null);
    setMessages([]);
    setIsNewInquiryDraft(true);
    setDraft("");
    setSendError(null);
    setInitError(null);
  }, [setDraft, threadScope]);

  const applyThread = useCallback(
    (targetThreadId: string, existing: { messages: BatteryTalkMessage[] }) => {
      storeBatteryTalkThreadId(targetThreadId, threadScope());
      if (!isLoggedIn) {
        registerBatteryTalkThreadForVisitor(targetThreadId);
      }
      setThreadId(targetThreadId);
      setMessages(existing.messages);
      setIsNewInquiryDraft(false);
    },
    [isLoggedIn, threadScope],
  );

  const switchToThread = useCallback(async (targetThreadId: string) => {
    setLoading(true);
    setInitError(null);
    const existing = await fetchBatteryTalkThread(targetThreadId);
    setLoading(false);
    if (existing.ok && existing.messages) {
      applyThread(targetThreadId, { messages: existing.messages });
    }
  }, [applyThread]);

  const bootstrapPanel = useCallback(async () => {
    if (!authReady) return;
    const gen = ++bootstrapGenRef.current;
    setHistoryLoading(true);
    setLoading(true);
    setInitError(null);

    const visitorId = getOrCreateBatteryTalkVisitorId();
    const history = await fetchBatteryTalkVisitorHistory();
    if (gen !== bootstrapGenRef.current) return;
    setVisitorHistory(history);
    setHistoryLoading(false);

    const scope = threadScope();
    const stored = getStoredBatteryTalkThreadId(scope);
    if (stored) {
      const existing = await fetchBatteryTalkThread(stored);
      if (gen !== bootstrapGenRef.current) return;
      if (existing.ok && existing.messages) {
        if (!isLoggedIn) registerBatteryTalkThreadForVisitor(stored, visitorId);
        applyThread(stored, { messages: existing.messages });
        setLoading(false);
        return;
      }
    }

    const restorable =
      history.find((item) => item.lastMessagePreview.trim()) ?? history[0];
    if (restorable) {
      const existing = await fetchBatteryTalkThread(restorable.threadId);
      if (gen !== bootstrapGenRef.current) return;
      if (existing.ok && existing.messages) {
        if (!isLoggedIn) registerBatteryTalkThreadForVisitor(restorable.threadId, visitorId);
        applyThread(restorable.threadId, { messages: existing.messages });
        setLoading(false);
        return;
      }
    }

    if (gen !== bootstrapGenRef.current) return;
    setLoading(false);
    enterNewInquiryDraft();
  }, [applyThread, authReady, enterNewInquiryDraft, isLoggedIn, threadScope]);

  useEffect(() => {
    if (!open) {
      setInitError(null);
      setSendError(null);
      setLoading(false);
      return;
    }
    void bootstrapPanel();
  }, [open, bootstrapPanel, preset?.batteryCode, preset?.productCode]);

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

  const ensureThreadForSend = useCallback(async (): Promise<string | null> => {
    if (threadId) return threadId;

    const visitorId = getOrCreateBatteryTalkVisitorId();
    const created = await openBatteryTalkThread({
      visitorId: isLoggedIn ? undefined : visitorId,
      customerName: member?.name,
      context: buildContext(),
    });
    if (!created.ok || !created.threadId) return null;

    const scope = threadScope();
    storeBatteryTalkThreadId(created.threadId, scope);
    if (!isLoggedIn) {
      registerBatteryTalkThreadForVisitor(created.threadId, visitorId);
    }
    setThreadId(created.threadId);
    setMessages(created.messages ?? []);
    setIsNewInquiryDraft(false);
    return created.threadId;
  }, [buildContext, isLoggedIn, member?.name, threadId, threadScope]);

  const doSend = async (body: string) => {
    if (!body.trim()) return;
    setSending(true);
    setSendError(null);

    const activeThreadId = await ensureThreadForSend();
    if (!activeThreadId) {
      setSending(false);
      setSendError("채팅을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const optimistic: BatteryTalkMessage = {
      id: `opt-${Date.now()}`,
      sender: "customer",
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const visitorId = getOrCreateBatteryTalkVisitorId();
    const result = await sendBatteryTalkMessage({
      threadId: activeThreadId,
      body: body.trim(),
      customerName: member?.name,
      visitorId: isLoggedIn ? undefined : visitorId,
    });
    setSending(false);

    if (result.ok) {
      if (result.messages) {
        setMessages(result.messages);
      }
      if (!isLoggedIn) registerBatteryTalkThreadForVisitor(activeThreadId, visitorId);
      void loadVisitorHistory();
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setSendError("메시지 전송에 실패했습니다.");
      setDraft(body);
    }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending || loading) return;
    await doSend(body);
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
  const showQuickChips =
    !loading &&
    (isNewInquiryDraft ||
      (messages.length > 0 && messages.every((m) => m.sender === "system")));

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

            <div className="batterytalk-panel__history shrink-0 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[11px] font-black text-slate-700">내 문의내역</p>
                <div className="flex items-center gap-1.5">
                  {historyLoading ? (
                    <span className="text-[10px] font-semibold text-slate-400">불러오는 중…</span>
                  ) : null}
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    disabled={loading || isNewInquiryDraft}
                    onClick={() => enterNewInquiryDraft()}
                  >
                    <Plus className="size-3" />
                    새 문의 시작
                  </button>
                </div>
              </div>
              {visitorHistory.length === 0 && !historyLoading && !loading ? (
                <p className="text-[11px] font-medium text-slate-500">아직 남긴 문의가 없습니다.</p>
              ) : visitorHistory.length === 0 && (historyLoading || loading) ? (
                <p className="text-[11px] font-medium text-slate-400">문의 내역을 불러오는 중…</p>
              ) : (
                <ul className="batterytalk-panel__history-list max-h-24 space-y-1 overflow-y-auto">
                  {visitorHistory.map((item) => (
                    <li key={item.threadId}>
                      <button
                        type="button"
                        className={`batterytalk-panel__history-item w-full rounded-md px-2 py-1.5 text-left ${
                          threadId === item.threadId && !isNewInquiryDraft ? "is-active" : ""
                        }`}
                        onClick={() => void switchToThread(item.threadId)}
                      >
                        <span className="block truncate text-[11px] font-bold text-slate-800">
                          {item.lastMessagePreview || "문의"}
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-500">
                          <span>
                            {new Date(item.lastMessageAt).toLocaleString("ko-KR", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>{item.hasAdminReply ? "답변완료" : "답변대기"}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!loading && threadId && !isNewInquiryDraft ? (
              <p className="shrink-0 border-b border-slate-100 bg-blue-50/60 px-3 py-1.5 text-[10px] font-semibold text-blue-800">
                이전 문의를 이어가는 중입니다.
              </p>
            ) : null}

            <div className="batterytalk-chat__messages flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <p className="py-8 text-center text-sm font-medium text-slate-500">채팅 연결 중…</p>
              ) : initError && messages.length === 0 && !isNewInquiryDraft ? (
                <p className="py-6 text-center text-xs font-semibold text-red-600">{initError}</p>
              ) : isNewInquiryDraft && messages.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm font-bold text-slate-800">새 문의를 남겨주세요.</p>
                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500">
                    {isLoggedIn
                      ? "로그인한 계정에서 문의내역을 확인할 수 있습니다."
                      : "이전 문의는 이 브라우저에서 다시 확인할 수 있습니다."}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                    새 문의를 시작하거나 기존 문의를 이어갈 수 있습니다.
                  </p>
                </div>
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

            {showQuickChips ? (
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

            {sendError ? (
              <p className="shrink-0 px-3 pb-1 text-xs font-semibold text-red-600" role="alert">
                {sendError}
              </p>
            ) : null}

            {onResumeOrder && showProductOrderCta && productCode ? (
              <div className="batterytalk-panel__resume shrink-0 border-t border-slate-100 px-3 py-2.5">
                <button
                  type="button"
                  className="batterytalk-panel__resume-btn batterytalk-panel__resume-btn--primary"
                  onClick={handleResumeOrder}
                >
                  이 규격으로 주문하기
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
