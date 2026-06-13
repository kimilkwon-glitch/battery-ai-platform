"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminReplyTemplateBar } from "@/components/admin/AdminReplyTemplateBar";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminOrderDetailModal, AdminOrderNumberButton } from "@/components/admin/AdminOrderDetailModal";
import {
  formatAdminCustomerName,
  formatAdminInquiryListPreview,
  formatAdminInquiryMessage,
  formatBatteryTalkCardPreview,
} from "@/lib/admin/admin-display-labels";
import { shouldExcludeBatteryTalkSummaryFromAdmin } from "@/lib/battery-talk/battery-talk-store-shared";
import type { BatteryTalkThreadDetail } from "@/lib/battery-talk/battery-talk-enrichment";
import { BatteryTalkSseStatusBanner } from "@/components/batterytalk/BatteryTalkSseStatusBanner";
import {
  appendUniqueMessage,
  useBatteryTalkAdminStream,
} from "@/lib/battery-talk/battery-talk-realtime-client";
import {
  BATTERY_TALK_PAGE_TYPE_LABELS,
  BATTERY_TALK_RECALLED_MESSAGE_LABEL,
  BATTERY_TALK_STATUS_LABELS,
  type BatteryTalkThreadStatus,
  type BatteryTalkThreadSummary,
} from "@/types/battery-talk";

const STATUS_TABS: { id: BatteryTalkThreadStatus | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "waiting", label: "대기" },
  { id: "active", label: "진행중" },
  { id: "done", label: "완료" },
  { id: "hold", label: "보류" },
];

const STATUS_BADGE: Record<BatteryTalkThreadStatus, string> = {
  waiting: "admin-bt-badge admin-bt-badge--waiting",
  active: "admin-bt-badge admin-bt-badge--active",
  done: "admin-bt-badge admin-bt-badge--done",
  hold: "admin-bt-badge admin-bt-badge--hold",
};

type MobileView = "list" | "chat" | "info";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function extractBatteryCode(productName?: string, batteryCode?: string): string | null {
  if (batteryCode?.trim()) return batteryCode.trim().toUpperCase();
  if (!productName) return null;
  const m = productName.match(/\b(CMF|GB|AGM|DIN)?\d{2,3}[LR]\b/i);
  return m ? m[0].toUpperCase() : null;
}

function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function vehicleLine(row: BatteryTalkThreadSummary): string | null {
  const parts = [row.vehicleName, row.productName].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function AdminBatteryTalkClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || "";
  const initialThreadId = searchParams.get("threadId")?.trim() || null;

  const [items, setItems] = useState<BatteryTalkThreadSummary[]>([]);
  const [detail, setDetail] = useState<BatteryTalkThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusTab, setStatusTab] = useState<BatteryTalkThreadStatus | "all">("waiting");
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(initialThreadId);
  const [replyDraft, setReplyDraft] = useState("");
  const [memoDraft, setMemoDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [storeWarning, setStoreWarning] = useState<string | null>(null);
  const [orderModalId, setOrderModalId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusTab !== "all") params.set("status", statusTab);
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/battery-talk?${params}`, { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.status === 503 || data.error === "OPERATIONAL_DB_UNAVAILABLE") {
      setStoreWarning(
        data.message ?? "배터리톡 DB 미연결 — DATABASE_URL 설정 후 db:migrate:battery-talk 필요",
      );
      setItems([]);
      return;
    }
    setStoreWarning(
      data.storeMode === "json-dev"
        ? "개발용 JSON 저장 모드 — production 배포 전 DATABASE_URL 연결 필요"
        : null,
    );
    if (res.ok && data.ok) setItems(data.items ?? []);
  }, [statusTab, query]);

  const loadDetail = useCallback(async (threadId: string) => {
    setDetailLoading(true);
    const res = await fetch(`/api/admin/battery-talk/${threadId}`, { credentials: "include" });
    const data = await res.json();
    setDetailLoading(false);
    if (res.ok && data.ok) {
      setDetail({
        thread: data.thread,
        inquiryCount: data.inquiryCount,
        order: data.order,
        product: data.product,
        vehicle: data.vehicle,
      });
      setMemoDraft(data.thread?.adminMemo ?? "");
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const syncAdminRealtimeOnce = useCallback(async () => {
    await loadList();
    if (selectedId) await loadDetail(selectedId);
  }, [loadList, loadDetail, selectedId]);

  const streamDisconnected = useBatteryTalkAdminStream((event) => {
    if (event.type === "session") {
      if (shouldExcludeBatteryTalkSummaryFromAdmin(event.session)) return;
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.threadId === event.session.threadId);
        if (idx < 0) return [event.session, ...prev];
        const next = [...prev];
        next[idx] = { ...next[idx]!, ...event.session };
        return next.sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        );
      });
      return;
    }
    if (event.type === "message") {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.threadId === event.sessionId);
        if (idx < 0) {
          void loadList();
          return prev;
        }
        const next = [...prev];
        const row = next[idx]!;
        next[idx] = {
          ...row,
          lastMessagePreview: event.message.body.slice(0, 80),
          lastMessageAt: event.message.createdAt,
          unreadByAdmin: event.message.sender === "customer" ? true : row.unreadByAdmin,
        };
        return next.sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        );
      });
      if (selectedId === event.sessionId) {
        setDetail((prev) => {
          if (!prev?.thread || prev.thread.threadId !== event.sessionId) return prev;
          const messages = appendUniqueMessage(prev.thread.messages, event.message);
          return {
            ...prev,
            thread: {
              ...prev.thread,
              messages,
              lastMessageAt: event.message.createdAt,
              unreadByAdmin: false,
            },
          };
        });
      }
    }
  }, true, { syncOnReconnect: syncAdminRealtimeOnce });

  const selectThread = (threadId: string) => {
    setSelectedId(threadId);
    setMobileView("chat");
  };

  const applyDetail = (data: BatteryTalkThreadDetail) => {
    setDetail(data);
    setMemoDraft(data.thread?.adminMemo ?? "");
  };

  const sendReply = async () => {
    if (!selectedId || !replyDraft.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/battery-talk/${selectedId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyDraft.trim() }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.ok) {
      setReplyDraft("");
      applyDetail({
        thread: data.thread,
        inquiryCount: data.inquiryCount,
        order: data.order,
        product: data.product,
        vehicle: data.vehicle,
      });
      void loadList();
    }
  };

  const recallMessage = async (messageId: string) => {
    if (!selectedId || !confirm("이 메시지를 회수하시겠습니까?")) return;
    setSaving(true);
    const res = await fetch(
      `/api/admin/battery-talk/${selectedId}/messages/${messageId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recall" }),
      },
    );
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.ok) {
      applyDetail({
        thread: data.thread,
        inquiryCount: data.inquiryCount,
        order: data.order,
        product: data.product,
        vehicle: data.vehicle,
      });
    }
  };

  const patchStatus = async (status: BatteryTalkThreadStatus) => {
    if (!selectedId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/battery-talk/${selectedId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.ok) {
      applyDetail({
        thread: data.thread,
        inquiryCount: data.inquiryCount,
        order: data.order,
        product: data.product,
        vehicle: data.vehicle,
      });
      void loadList();
    }
  };

  const saveMemo = async () => {
    if (!selectedId) return;
    setSaving(true);
    await fetch(`/api/admin/battery-talk/${selectedId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminMemo: memoDraft }),
    });
    setSaving(false);
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendReply();
    }
  };

  const thread = detail?.thread;
  const ctx = thread?.context;
  const pageType = ctx?.pageType;

  const listPanelClass = mobileView !== "list" ? "admin-battery-talk__panel--hidden-mobile" : "";
  const chatPanelClass = mobileView !== "chat" ? "admin-battery-talk__panel--hidden-mobile" : "";
  const infoPanelClass = mobileView !== "info" ? "admin-battery-talk__panel--hidden-mobile" : "";

  return (
    <div className="admin-battery-talk">
      {storeWarning ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {storeWarning}
        </p>
      ) : null}
      <BatteryTalkSseStatusBanner show={streamDisconnected} variant="admin" />

      <div className="admin-battery-talk__mobile-tabs lg:hidden">
        {(
          [
            { id: "list" as const, label: "상담목록" },
            { id: "chat" as const, label: "대화" },
            { id: "info" as const, label: "고객·주문" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-battery-talk__tab ${mobileView === tab.id ? "admin-battery-talk__tab--active" : ""}`}
            onClick={() => setMobileView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-battery-talk__layout">
        <aside className={`admin-battery-talk__list ${listPanelClass}`}>
          <div className="admin-battery-talk__list-head">
            <input
              className="admin-toolbar__search w-full"
              placeholder="고객명, 연락처, 문의내용 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="admin-battery-talk__tabs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`admin-battery-talk__tab ${statusTab === tab.id ? "admin-battery-talk__tab--active" : ""}`}
                  onClick={() => setStatusTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-battery-talk__cards">
            {loading ? (
              <p className="admin-battery-talk__list-empty">불러오는 중…</p>
            ) : items.length === 0 ? (
              <div className="admin-battery-talk__list-empty-wrap">
                <p className="admin-battery-talk__list-empty-title">접수된 상담이 없습니다</p>
                <p className="admin-battery-talk__list-empty-desc">
                  고객이 상담을 남기면 이곳에 표시됩니다.
                </p>
              </div>
            ) : (
              items.map((row) => {
                const preview = formatBatteryTalkCardPreview(row.lastMessagePreview);
                const spec = extractBatteryCode(row.productName, undefined);
                const vehicle = vehicleLine(row);
                return (
                  <button
                    key={row.threadId}
                    type="button"
                    className={`admin-battery-talk__card ${row.threadId === selectedId ? "admin-battery-talk__card--selected" : ""} ${row.unreadByAdmin ? "admin-battery-talk__card--unread" : ""}`}
                    onClick={() => selectThread(row.threadId)}
                  >
                    <div className="admin-battery-talk__card-top">
                      <span className="admin-battery-talk__card-title">
                        {formatAdminCustomerName(row.customerName)}
                      </span>
                      <span className={STATUS_BADGE[row.status]}>
                        {BATTERY_TALK_STATUS_LABELS[row.status]}
                      </span>
                    </div>
                    {vehicle ? (
                      <p className="admin-battery-talk__card-vehicle">{vehicle}</p>
                    ) : null}
                    {spec ? <span className="admin-battery-talk__spec-pill">{spec}</span> : null}
                    {preview ? (
                      <p className="admin-battery-talk__card-preview">{preview}</p>
                    ) : null}
                    <p className="admin-battery-talk__card-time">{formatTime(row.lastMessageAt)}</p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className={`admin-battery-talk__chat ${chatPanelClass}`}>
          {!selectedId ? (
            <div className="admin-battery-talk__chat-empty">
              <p className="admin-battery-talk__chat-empty-title">상담을 선택하세요</p>
              <p className="admin-battery-talk__chat-empty-desc">
                상담을 선택하면 상세 내용이 표시됩니다.
              </p>
            </div>
          ) : detailLoading && !thread ? (
            <div className="admin-battery-talk__chat-empty">불러오는 중…</div>
          ) : thread ? (
            <>
              <header className="admin-battery-talk__chat-head">
                <div className="admin-battery-talk__chat-head-main">
                  <h3 className="admin-battery-talk__chat-title">
                    {formatAdminCustomerName(thread.customerName)}
                  </h3>
                  <p className="admin-battery-talk__chat-sub">
                    {pageType ? BATTERY_TALK_PAGE_TYPE_LABELS[pageType] : "배터리톡 상담"}
                    {ctx?.topic ? ` · ${ctx.topic}` : ""}
                  </p>
                </div>
                <span className={STATUS_BADGE[thread.status]}>
                  {BATTERY_TALK_STATUS_LABELS[thread.status]}
                </span>
              </header>

              <div className="admin-battery-talk__messages">
                {thread.messages.length === 0 ? (
                  <div className="admin-battery-talk__chat-empty">
                    <p>아직 대화가 없습니다.</p>
                  </div>
                ) : (
                  thread.messages.map((msg) => {
                    const recalled = Boolean(msg.recalledAt);
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`admin-battery-talk__bubble-wrap admin-battery-talk__bubble-wrap--${msg.sender}`}
                      >
                        <div
                          className={`admin-battery-talk__bubble admin-battery-talk__bubble--${msg.sender}${recalled ? " admin-battery-talk__bubble--recalled" : ""}`}
                        >
                          <p>
                            {recalled
                              ? BATTERY_TALK_RECALLED_MESSAGE_LABEL
                              : formatAdminInquiryMessage(msg.body)}
                          </p>
                          {msg.sender !== "system" ? (
                            <p className="admin-battery-talk__bubble-time">
                              {isAdmin ? "관리자" : "고객"} · {formatTime(msg.createdAt)}
                            </p>
                          ) : null}
                        </div>
                        {isAdmin && !recalled ? (
                          <button
                            type="button"
                            className="admin-battery-talk__recall-btn"
                            disabled={saving}
                            onClick={() => void recallMessage(msg.id)}
                          >
                            회수
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>

              <footer className="admin-battery-talk__composer">
                <AdminReplyTemplateBar
                  currentValue={replyDraft}
                  onInsert={setReplyDraft}
                  label="자주 쓰는 답변"
                  className="admin-battery-talk__quick-reply"
                />
                <textarea
                  className="admin-battery-talk__reply-input"
                  placeholder="관리자 답변을 입력하세요. Enter로 발송됩니다."
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  rows={3}
                />
                <div className="admin-battery-talk__composer-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary admin-btn--md"
                    disabled={saving || !replyDraft.trim()}
                    onClick={() => void sendReply()}
                  >
                    {saving ? "발송 중…" : "발송"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--md"
                    disabled={saving || thread.status === "done"}
                    onClick={() => void patchStatus("done")}
                  >
                    상담완료
                  </button>
                  {thread.status !== "active" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--md"
                      disabled={saving}
                      onClick={() => void patchStatus("active")}
                    >
                      진행중
                    </button>
                  ) : null}
                  {thread.status !== "hold" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--md"
                      disabled={saving}
                      onClick={() => void patchStatus("hold")}
                    >
                      보류
                    </button>
                  ) : null}
                </div>
              </footer>
            </>
          ) : null}
        </section>

        <aside className={`admin-battery-talk__info ${infoPanelClass}`}>
          {!thread ? (
            <p className="admin-battery-talk__info-placeholder">상담을 선택하면 정보가 표시됩니다.</p>
          ) : (
            <div className="admin-battery-talk__info-scroll">
              <div className="admin-battery-talk__info-card">
                <h4>고객 정보</h4>
                <div className="admin-battery-talk__info-row">
                  <span>이름</span>
                  <strong>{formatAdminCustomerName(thread.customerName)}</strong>
                </div>
                <div className="admin-battery-talk__info-row">
                  <span>연락처</span>
                  <strong>{thread.phone}</strong>
                </div>
                <div className="admin-battery-talk__info-row">
                  <span>회원</span>
                  <strong>{thread.isMember ? "회원" : "비회원"}</strong>
                </div>
                <div className="admin-battery-talk__info-row">
                  <span>상담 건수</span>
                  <strong>{detail?.inquiryCount ?? 1}건</strong>
                </div>
              </div>

              <div className="admin-battery-talk__info-card">
                <h4>차량 정보</h4>
                {detail?.vehicle || ctx?.vehicleName ? (
                  <>
                    <div className="admin-battery-talk__info-row">
                      <span>차량</span>
                      <strong>{detail?.vehicle?.vehicleName ?? ctx?.vehicleName}</strong>
                    </div>
                    {ctx?.selectedFuel ? (
                      <div className="admin-battery-talk__info-row">
                        <span>연료</span>
                        <strong>{ctx.selectedFuel}</strong>
                      </div>
                    ) : null}
                    {detail?.vehicle?.customerHref ? (
                      <AdminCustomerPreviewLink href={detail.vehicle.customerHref} />
                    ) : null}
                  </>
                ) : (
                  <p className="admin-battery-talk__muted">정보 없음</p>
                )}
              </div>

              <div className="admin-battery-talk__info-card">
                <h4>상품 정보</h4>
                {detail?.product ? (
                  <>
                    {detail.product.imageUrl ? (
                      <Image
                        src={detail.product.imageUrl}
                        alt={detail.product.productName ?? "상품"}
                        width={280}
                        height={120}
                        className="admin-battery-talk__product-img"
                        unoptimized
                      />
                    ) : null}
                    <div className="admin-battery-talk__info-row">
                      <span>규격</span>
                      <strong>{detail.product.batteryCode ?? "—"}</strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>상품명</span>
                      <strong>{detail.product.productName ?? "—"}</strong>
                    </div>
                    {detail.product.customerHref ? (
                      <AdminCustomerPreviewLink href={detail.product.customerHref} />
                    ) : null}
                  </>
                ) : (
                  <p className="admin-battery-talk__muted">연결된 상품 없음</p>
                )}
              </div>

              <div className="admin-battery-talk__info-card">
                <h4>주문 정보</h4>
                {detail?.order ? (
                  <>
                    <div className="admin-battery-talk__info-row">
                      <span>주문번호</span>
                      <strong>
                        <AdminOrderNumberButton
                          orderId={detail.order.orderId}
                          orderNumber={detail.order.orderNumber}
                          onOpen={setOrderModalId}
                        />
                      </strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>주문일</span>
                      <strong>{formatTime(detail.order.createdAt)}</strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>상품</span>
                      <strong>{detail.order.productName}</strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>결제금액</span>
                      <strong>{formatAmount(detail.order.finalAmount)}</strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>수령</span>
                      <strong>{detail.order.fulfillmentLabel}</strong>
                    </div>
                    <Link
                      href={`/admin/orders?channel=commerce&orderId=${encodeURIComponent(detail.order.orderId)}`}
                      className="admin-battery-talk__info-link"
                    >
                      주문관리에서 열기
                    </Link>
                  </>
                ) : ctx?.cartSummary ? (
                  <>
                    <p className="admin-battery-talk__info-note">주문 전 · 장바구니 요약</p>
                    <p className="admin-battery-talk__cart-summary">{ctx.cartSummary}</p>
                  </>
                ) : (
                  <>
                    <p className="admin-battery-talk__muted">연결된 주문 없음</p>
                    <p className="admin-battery-talk__info-note">상품 상담 접수된 문의입니다.</p>
                  </>
                )}
              </div>

              <div className="admin-battery-talk__info-card">
                <h4>관리자 메모</h4>
                <textarea
                  className="admin-memo-input w-full"
                  rows={4}
                  value={memoDraft}
                  onChange={(e) => setMemoDraft(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary admin-btn--md mt-2"
                  disabled={saving}
                  onClick={() => void saveMemo()}
                >
                  메모 저장
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <AdminOrderDetailModal orderId={orderModalId} onClose={() => setOrderModalId(null)} />
    </div>
  );
}
