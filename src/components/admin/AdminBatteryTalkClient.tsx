"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { Badge } from "@/components/ui/badge";
import type { BatteryTalkThreadDetail } from "@/lib/battery-talk/battery-talk-enrichment";
import { BatteryTalkSseStatusBanner } from "@/components/batterytalk/BatteryTalkSseStatusBanner";
import {
  appendUniqueMessage,
  useBatteryTalkAdminStream,
} from "@/lib/battery-talk/battery-talk-realtime-client";
import {
  BATTERY_TALK_PAGE_TYPE_LABELS,
  BATTERY_TALK_REPLY_TEMPLATES,
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
  waiting: "bg-amber-100 text-amber-800",
  active: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800",
  hold: "bg-slate-200 text-slate-700",
};

type MobileView = "list" | "chat" | "info";

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function AdminBatteryTalkClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || "";
  const [items, setItems] = useState<BatteryTalkThreadSummary[]>([]);
  const [detail, setDetail] = useState<BatteryTalkThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusTab, setStatusTab] = useState<BatteryTalkThreadStatus | "all">("all");
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [memoDraft, setMemoDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [storeWarning, setStoreWarning] = useState<string | null>(null);

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

  const streamDisconnected = useBatteryTalkAdminStream((event) => {
    if (event.type === "session") {
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
  });

  const selectThread = (threadId: string) => {
    setSelectedId(threadId);
    setMobileView("chat");
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
      setDetail({
        thread: data.thread,
        inquiryCount: data.inquiryCount,
        order: data.order,
        product: data.product,
        vehicle: data.vehicle,
      });
      void loadList();
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
      setDetail({
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

  const thread = detail?.thread;
  const ctx = thread?.context;
  const pageType = ctx?.pageType;

  const listPanelClass =
    mobileView !== "list" ? "admin-battery-talk__panel--hidden-mobile" : "";
  const chatPanelClass =
    mobileView !== "chat" ? "admin-battery-talk__panel--hidden-mobile" : "";
  const infoPanelClass =
    mobileView !== "info" ? "admin-battery-talk__panel--hidden-mobile" : "";

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
        {/* 왼쪽: 상담 목록 */}
        <aside className={`admin-battery-talk__list ${listPanelClass}`}>
          <div className="admin-battery-talk__list-head">
            <input
              className="admin-toolbar__search w-full"
              placeholder="고객명·연락처·차량·상품·주문·내용 검색"
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
              <p className="p-3 text-sm text-slate-500">불러오는 중…</p>
            ) : items.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">상담 내역이 없습니다.</p>
            ) : (
              items.map((row) => (
                <button
                  key={row.threadId}
                  type="button"
                  className={`admin-battery-talk__card ${row.threadId === selectedId ? "admin-battery-talk__card--selected" : ""} ${row.unreadByAdmin ? "admin-battery-talk__card--unread" : ""}`}
                  onClick={() => selectThread(row.threadId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="admin-battery-talk__card-title">
                      {row.customerName || "비회원"}
                    </span>
                    <Badge className={STATUS_BADGE[row.status]}>
                      {BATTERY_TALK_STATUS_LABELS[row.status]}
                    </Badge>
                  </div>
                  <p className="admin-battery-talk__card-preview">{row.lastMessagePreview}</p>
                  <div className="admin-battery-talk__card-meta">
                    <span>
                      {row.hasProduct ? "📦" : ""}
                      {row.hasOrder ? " 🧾" : ""}
                      {row.productName ? ` ${row.productName}` : ""}
                    </span>
                    <span>{formatTime(row.lastMessageAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* 가운데: 대화창 */}
        <section className={`admin-battery-talk__chat ${chatPanelClass}`}>
          {!selectedId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-sm font-semibold text-slate-500">
              왼쪽에서 상담을 선택하세요.
            </div>
          ) : detailLoading && !thread ? (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
              불러오는 중…
            </div>
          ) : thread ? (
            <>
              <header className="admin-battery-talk__chat-head">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {thread.customerName} · {thread.phone}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      접수: {pageType ? BATTERY_TALK_PAGE_TYPE_LABELS[pageType] : "배터리톡"}
                      {ctx?.topic ? ` · ${ctx.topic}` : ""}
                    </p>
                  </div>
                  <Badge className={STATUS_BADGE[thread.status]}>
                    {BATTERY_TALK_STATUS_LABELS[thread.status]}
                  </Badge>
                </div>
              </header>

              <div className="admin-battery-talk__messages">
                {thread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`admin-battery-talk__bubble admin-battery-talk__bubble--${msg.sender}`}
                  >
                    <p>{msg.body}</p>
                    {msg.sender !== "system" ? (
                      <p className="admin-battery-talk__bubble-time">
                        {msg.sender === "admin" ? "관리자 · " : "고객 · "}
                        {formatTime(msg.createdAt)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <footer className="admin-battery-talk__composer">
                <div className="admin-battery-talk__templates">
                  {BATTERY_TALK_REPLY_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      className="admin-battery-talk__template-btn"
                      onClick={() =>
                        setReplyDraft((prev) => (prev ? `${prev}\n\n${tpl.body}` : tpl.body))
                      }
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="admin-battery-talk__reply-input"
                  placeholder="관리자 답변을 입력하세요. (저장 후 대화창에 표시됩니다)"
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  rows={3}
                />
                <div className="admin-battery-talk__composer-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    disabled={saving || !replyDraft.trim()}
                    onClick={() => void sendReply()}
                  >
                    {saving ? "저장 중…" : "답변 저장"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    disabled={saving || thread.status === "done"}
                    onClick={() => void patchStatus("done")}
                  >
                    완료 처리
                  </button>
                  {thread.status === "waiting" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={saving}
                      onClick={() => void patchStatus("active")}
                    >
                      진행중으로
                    </button>
                  ) : null}
                  {thread.status !== "hold" ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
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

        {/* 오른쪽: 고객/주문/상품 정보 */}
        <aside className={`admin-battery-talk__info ${infoPanelClass}`}>
          {!thread ? (
            <p className="p-4 text-sm text-slate-500">상담을 선택하면 정보가 표시됩니다.</p>
          ) : (
            <>
              <div className="admin-battery-talk__info-card">
                <h4>고객 정보</h4>
                <div className="admin-battery-talk__info-row">
                  <span>이름</span>
                  <strong>{thread.customerName}</strong>
                </div>
                <div className="admin-battery-talk__info-row">
                  <span>연락처</span>
                  <strong>{thread.phone}</strong>
                </div>
                <div className="admin-battery-talk__info-row">
                  <span>회원 여부</span>
                  <strong>{thread.isMember ? "회원" : "비회원"}</strong>
                </div>
                <div className="admin-battery-talk__info-row">
                  <span>배터리톡 문의 수</span>
                  <strong>{detail?.inquiryCount ?? 1}건</strong>
                </div>
              </div>

              <div className="admin-battery-talk__info-card">
                <h4>차량 정보</h4>
                {detail?.vehicle || ctx?.vehicleName ? (
                  <>
                    <div className="admin-battery-talk__info-row">
                      <span>차량명</span>
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
                  <p className="admin-battery-talk__empty-info">차량 정보 없음</p>
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
                  <p className="admin-battery-talk__empty-info">연결된 상품 없음</p>
                )}
              </div>

              <div className="admin-battery-talk__info-card">
                <h4>주문 정보</h4>
                {detail?.order ? (
                  <>
                    <div className="admin-battery-talk__info-row">
                      <span>주문번호</span>
                      <strong>{detail.order.orderNumber}</strong>
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
                      <span>수령/장착</span>
                      <strong>{detail.order.fulfillmentLabel}</strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>폐배터리 반납</span>
                      <strong>{detail.order.returnBatteryOption}</strong>
                    </div>
                    <div className="admin-battery-talk__info-row">
                      <span>주문 상태</span>
                      <strong>{detail.order.orderStatus}</strong>
                    </div>
                    <Link
                      href={`/admin/orders?channel=commerce&orderId=${encodeURIComponent(detail.order.orderId)}`}
                      className="mt-2 inline-block text-xs font-bold text-blue-700 hover:underline"
                    >
                      관리자 주문 상세
                    </Link>
                  </>
                ) : ctx?.cartSummary ? (
                  <>
                    <p className="mb-2 text-xs font-bold text-slate-600">주문 전 · 장바구니/결제 요약</p>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{ctx.cartSummary}</p>
                  </>
                ) : (
                  <>
                    <p className="admin-battery-talk__empty-info">연결된 주문 없음</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      상품 상담만 접수된 문의입니다.
                    </p>
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
                  className="admin-btn admin-btn--secondary mt-2"
                  disabled={saving}
                  onClick={() => void saveMemo()}
                >
                  메모 저장
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
