"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminOrderDetailModal, AdminOrderNumberButton } from "@/components/admin/AdminOrderDetailModal";
import type { CustomerReviewRecord } from "@/types/customer-review";

type Filter = "all" | "reply_pending" | "low_rating" | "photo" | "new";

const FILTER_LABELS: Record<Filter, string> = {
  all: "전체",
  reply_pending: "답글 대기",
  low_rating: "평점 낮음",
  photo: "사진 리뷰",
  new: "새 리뷰",
};

const TEST_RE = /테스트|test|sample|demo|seed|fixture/i;

function isTestReview(r: CustomerReviewRecord): boolean {
  return TEST_RE.test(
    [r.authorName, r.content, r.orderId].filter(Boolean).join(" "),
  );
}

export function AdminReviewWorkbenchClient() {
  const [items, setItems] = useState<CustomerReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("reply_pending");
  const [selected, setSelected] = useState<CustomerReviewRecord | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [orderModalId, setOrderModalId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews?page=1&limit=100", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) {
      setItems((data.items as CustomerReviewRecord[]).filter((r) => !isTestReview(r)));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const counts = useMemo(
    () => ({
      reply_pending: items.filter((r) => !r.operatorReply?.trim() && r.status === "active").length,
      low_rating: items.filter((r) => r.rating <= 3 && r.status === "active").length,
      photo: items.filter((r) => (r.images?.length ?? 0) > 0 || r.imageUrl).length,
      new: items.filter(
        (r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active",
      ).length,
    }),
    [items, weekAgo],
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "reply_pending":
        return items.filter((r) => !r.operatorReply?.trim() && r.status === "active");
      case "low_rating":
        return items.filter((r) => r.rating <= 3 && r.status === "active");
      case "photo":
        return items.filter((r) => (r.images?.length ?? 0) > 0 || r.imageUrl);
      case "new":
        return items.filter(
          (r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active",
        );
      default:
        return items;
    }
  }, [items, filter, weekAgo]);

  const openDetail = (review: CustomerReviewRecord) => {
    setSelected(review);
    setReplyDraft(review.operatorReply ?? "");
  };

  const saveReply = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/reviews/${selected.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operatorReply: replyDraft.trim() || null }),
    });
    setSaving(false);
    if (res.ok) {
      await load();
      setSelected(null);
    }
  };

  const deleteReply = async () => {
    if (!selected || !confirm("등록된 답글을 삭제하시겠습니까?")) return;
    setSaving(true);
    await fetch(`/api/admin/reviews/${selected.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operatorReply: null }),
    });
    setSaving(false);
    setReplyDraft("");
    await load();
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="admin-dashboard-section__grid admin-dashboard-section__grid--4">
        {(Object.keys(FILTER_LABELS) as Filter[]).filter((f) => f !== "all").map((id) => (
          <button key={id} type="button" className="text-left" onClick={() => setFilter(id)}>
            <div className={`admin-stat-card${filter === id ? " admin-stat-card--active" : ""}`}>
              <p className="admin-stat-card__label">{FILTER_LABELS[id]}</p>
              <p className="admin-stat-card__value admin-stat-card__value--info">
                {id === "reply_pending"
                  ? counts.reply_pending
                  : id === "low_rating"
                    ? counts.low_rating
                    : id === "photo"
                      ? counts.photo
                      : counts.new}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="admin-order-workbench__tabs">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`admin-order-workbench__tab ${filter === id ? "is-active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {FILTER_LABELS[id]}
          </button>
        ))}
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title">{FILTER_LABELS[filter]} 목록</h2>
        </div>
        <div className="admin-data-table__wrap overflow-x-auto">
          <table className="admin-table w-full min-w-[960px]">
            <thead>
              <tr>
                <th>등록일</th>
                <th>상품/차량</th>
                <th>평점</th>
                <th>리뷰 요약</th>
                <th>사진</th>
                <th>답글</th>
                <th>작성자</th>
                <th className="text-right">처리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-500">
                    불러오는 중…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm font-bold text-slate-600">
                    표시할 리뷰가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap text-sm">
                      {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td>
                      <p className="font-semibold">{r.batteryCode ?? r.vehicleName ?? "—"}</p>
                      <p className="text-xs text-slate-500">{r.vehicleName}</p>
                    </td>
                    <td>{r.rating}점</td>
                    <td className="max-w-xs truncate text-sm">
                      <button
                        type="button"
                        className="w-full truncate text-left hover:text-blue-800 hover:underline"
                        onClick={() => openDetail(r)}
                      >
                        {r.content}
                      </button>
                    </td>
                    <td>{(r.images?.length ?? 0) > 0 || r.imageUrl ? "있음" : "—"}</td>
                    <td>{r.operatorReply ? "완료" : "대기"}</td>
                    <td>{r.authorName}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary admin-btn--md"
                        onClick={() => openDetail(r)}
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-modal__backdrop"
            aria-label="닫기"
            onClick={() => setSelected(null)}
          />
          <div className="admin-modal__panel admin-modal__panel--wide">
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">리뷰 상세</h3>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => setSelected(null)}
              >
                닫기
              </button>
            </div>
            <div className="admin-modal__body space-y-4">
              {(selected.images?.length ?? 0) > 0 || selected.imageUrl ? (
                <div className="flex flex-wrap gap-2">
                  {[selected.imageUrl, ...(selected.images ?? [])]
                    .filter(Boolean)
                    .map((src, i) => (
                      <Image
                        key={`${src}-${i}`}
                        src={src!}
                        alt="리뷰 이미지"
                        width={120}
                        height={120}
                        className="rounded-lg border object-cover"
                        unoptimized
                      />
                    ))}
                </div>
              ) : null}
              <p className="text-2xl font-black text-amber-600">{selected.rating}점</p>
              <p className="whitespace-pre-wrap text-sm text-slate-800">{selected.content}</p>
              <div className="admin-order-detail-grid">
                <section className="admin-order-detail-card">
                  <h4>리뷰 정보</h4>
                  <p className="text-sm">
                    <span className="text-slate-500">등록일 </span>
                    {new Date(selected.createdAt).toLocaleString("ko-KR")}
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">작성자 </span>
                    {selected.authorName}
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">상품/규격 </span>
                    {selected.batteryCode ?? selected.vehicleName ?? "—"}
                  </p>
                  {selected.orderId ? (
                    <p className="text-sm">
                      <span className="text-slate-500">주문번호 </span>
                      <AdminOrderNumberButton
                        orderId={selected.orderId}
                        orderNumber={selected.orderId}
                        onOpen={setOrderModalId}
                      />
                    </p>
                  ) : null}
                </section>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">운영자 답글</label>
                <textarea
                  className="admin-battery-talk__reply-input mt-2 min-h-[100px]"
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="고객에게 보여질 답글을 입력하세요."
                  rows={4}
                />
              </div>
            </div>
            <div className="admin-modal__footer flex-wrap gap-2">
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--md"
                disabled={saving || !replyDraft.trim()}
                onClick={() => void saveReply()}
              >
                답글 등록
              </button>
              {selected.operatorReply ? (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--md"
                    disabled={saving}
                    onClick={() => void saveReply()}
                  >
                    답글 수정
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--md text-red-600"
                    disabled={saving}
                    onClick={() => void deleteReply()}
                  >
                    답글 삭제
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <AdminOrderDetailModal orderId={orderModalId} onClose={() => setOrderModalId(null)} />
    </div>
  );
}
