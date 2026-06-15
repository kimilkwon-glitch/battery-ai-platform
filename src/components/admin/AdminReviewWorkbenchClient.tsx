"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminOrderDetailModal, AdminOrderNumberButton } from "@/components/admin/AdminOrderDetailModal";
import { AdminDangerActionDialog } from "@/components/admin/AdminDangerActionDialog";
import { dangerConfigReviewReplyDelete } from "@/lib/admin/admin-danger-action-presets";
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
  return TEST_RE.test([r.authorName, r.content, r.orderId].filter(Boolean).join(" "));
}

function reviewImageUrls(review: CustomerReviewRecord): string[] {
  const urls: string[] = [];
  const primary = review.imageUrl?.trim();
  if (primary) urls.push(primary);
  for (const raw of review.images ?? []) {
    const url = raw?.trim();
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

function hasPhotos(review: CustomerReviewRecord): boolean {
  return reviewImageUrls(review).length > 0;
}

function productPrimary(review: CustomerReviewRecord): string {
  return (
    review.workInfo?.batteryLine?.trim() ||
    review.batteryCode?.trim() ||
    review.workInfo?.vehicleLine?.trim() ||
    review.vehicleName?.trim() ||
    "—"
  );
}

function productSecondary(review: CustomerReviewRecord): string | null {
  const vehicle = review.vehicleName?.trim() || review.workInfo?.vehicleLine?.trim();
  const battery = review.batteryCode?.trim();
  if (vehicle && battery && productPrimary(review) !== vehicle) return vehicle;
  if (vehicle && productPrimary(review) !== vehicle) return vehicle;
  return review.workInfo?.placeLine?.trim() || null;
}

function fulfillmentLabel(review: CustomerReviewRecord): string | null {
  return review.serviceType?.trim() || review.workInfo?.servicesLine?.trim() || null;
}

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatReviewDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function RatingBadge({ rating }: { rating: number }) {
  return <span className="admin-review-rating-badge">{rating}점</span>;
}

function ReplyStatusBadge({ replied }: { replied: boolean }) {
  return (
    <span
      className={`admin-review-reply-badge${replied ? " admin-review-reply-badge--done" : " admin-review-reply-badge--pending"}`}
    >
      {replied ? "답변완료" : "대기"}
    </span>
  );
}

function ReviewPhotoThumb({
  src,
  alt,
  size = "list",
  onClick,
}: {
  src: string;
  alt: string;
  size?: "list" | "detail";
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const dim = size === "list" ? 40 : 120;

  if (failed) {
    return (
      <span className={`admin-review-photo-fallback admin-review-photo-fallback--${size}`} title="이미지 로드 실패">
        —
      </span>
    );
  }

  const img = (
    <Image
      src={src}
      alt={alt}
      width={dim}
      height={dim}
      className={`admin-review-photo-thumb admin-review-photo-thumb--${size}`}
      unoptimized
      onError={() => setFailed(true)}
    />
  );

  if (onClick) {
    return (
      <button type="button" className="admin-review-photo-thumb-btn" onClick={onClick}>
        {img}
      </button>
    );
  }

  return img;
}

export function AdminReviewWorkbenchClient() {
  const [items, setItems] = useState<CustomerReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("reply_pending");
  const [selected, setSelected] = useState<CustomerReviewRecord | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteReplyOpen, setDeleteReplyOpen] = useState(false);
  const [deleteReplyError, setDeleteReplyError] = useState<string | null>(null);
  const [orderModalId, setOrderModalId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightboxSrc) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, lightboxSrc]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const counts = useMemo(
    () => ({
      reply_pending: items.filter((r) => !r.operatorReply?.trim() && r.status === "active").length,
      low_rating: items.filter((r) => r.rating <= 3 && r.status === "active").length,
      photo: items.filter((r) => hasPhotos(r)).length,
      new: items.filter((r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active").length,
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
        return items.filter((r) => hasPhotos(r));
      case "new":
        return items.filter((r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active");
      default:
        return items;
    }
  }, [items, filter, weekAgo]);

  const openDetail = (review: CustomerReviewRecord) => {
    setSelected(review);
    setReplyDraft(review.operatorReply ?? "");
    setLightboxSrc(null);
  };

  const closeDetail = () => {
    setSelected(null);
    setLightboxSrc(null);
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
    if (!selected) return;
    setSaving(true);
    setDeleteReplyError(null);
    const res = await fetch(`/api/admin/reviews/${selected.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operatorReply: null }),
    });
    setSaving(false);
    if (!res.ok) {
      setDeleteReplyError("답글 삭제에 실패했습니다.");
      return;
    }
    setReplyDraft("");
    setDeleteReplyOpen(false);
    await load();
    setSelected(null);
  };

  const selectedPhotos = selected ? reviewImageUrls(selected) : [];
  const selectedHasReply = Boolean(selected?.operatorReply?.trim());
  const selectedIsPhoto = selectedPhotos.length > 0;

  return (
    <div className="admin-reviews-workbench">
      <div className="admin-reviews-workbench__kpi admin-dashboard-section__grid admin-dashboard-section__grid--4">
        {(Object.keys(FILTER_LABELS) as Filter[]).filter((f) => f !== "all").map((id) => (
          <button
            key={id}
            type="button"
            className="admin-reviews-workbench__kpi-btn"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
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

      <div className="admin-reviews-workbench__tabs admin-order-workbench__tabs">
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

      <section className="admin-panel admin-reviews-workbench__list-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title">{FILTER_LABELS[filter]} 목록</h2>
          <p className="admin-reviews-workbench__list-count">{filtered.length.toLocaleString("ko-KR")}건</p>
        </div>
        <div className="admin-data-table__wrap admin-reviews-table-wrap overflow-x-auto">
          <table className="admin-table admin-reviews-table w-full min-w-[920px]">
            <thead>
              <tr>
                <th>등록일</th>
                <th>상품/차량</th>
                <th>평점</th>
                <th>리뷰 내용</th>
                <th>사진</th>
                <th>답변 상태</th>
                <th>작성자</th>
                <th className="admin-reviews-table__th-actions">처리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="admin-reviews-table__empty">
                    불러오는 중…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-reviews-table__empty">
                    표시할 리뷰가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const photos = reviewImageUrls(r);
                  const replied = Boolean(r.operatorReply?.trim());
                  return (
                    <tr
                      key={r.id}
                      className="admin-reviews-table__row"
                      onClick={() => openDetail(r)}
                    >
                      <td className="admin-reviews-table__date">{formatReviewDate(r.createdAt)}</td>
                      <td className="admin-reviews-table__product">
                        <p className="admin-reviews-table__product-name">{productPrimary(r)}</p>
                        {productSecondary(r) ? (
                          <p className="admin-reviews-table__product-sub">{productSecondary(r)}</p>
                        ) : null}
                      </td>
                      <td className="admin-reviews-table__rating">
                        <RatingBadge rating={r.rating} />
                      </td>
                      <td className="admin-reviews-table__content">
                        <span className="admin-reviews-table__content-text">{r.content}</span>
                      </td>
                      <td className="admin-reviews-table__photo" onClick={(e) => e.stopPropagation()}>
                        {photos.length > 0 ? (
                          <div className="admin-reviews-table__photo-cell">
                            <ReviewPhotoThumb
                              src={photos[0]!}
                              alt="리뷰 사진"
                              size="list"
                              onClick={() => openDetail(r)}
                            />
                            {photos.length > 1 ? (
                              <span className="admin-review-photo-count">+{photos.length - 1}</span>
                            ) : (
                              <span className="admin-review-photo-badge">사진</span>
                            )}
                          </div>
                        ) : (
                          <span className="admin-reviews-table__photo-none">—</span>
                        )}
                      </td>
                      <td className="admin-reviews-table__reply">
                        <ReplyStatusBadge replied={replied} />
                      </td>
                      <td className="admin-reviews-table__author">{r.authorName}</td>
                      <td className="admin-reviews-table__actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="admin-btn admin-btn--secondary admin-btn--md"
                          onClick={() => openDetail(r)}
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <div className="admin-modal admin-review-detail-modal" role="dialog" aria-modal="true" aria-labelledby="review-detail-title">
          <button type="button" className="admin-modal__backdrop" aria-label="닫기" onClick={closeDetail} />
          <div className="admin-modal__panel admin-modal__panel--review-detail">
            <div className="admin-modal__header admin-review-detail-modal__header">
              <div className="admin-review-detail-modal__header-main">
                <h3 id="review-detail-title" className="admin-modal__title">
                  리뷰 상세
                </h3>
                <div className="admin-review-detail-modal__badges">
                  <ReplyStatusBadge replied={selectedHasReply} />
                  {selectedIsPhoto ? (
                    <span className="admin-review-photo-review-badge">사진 리뷰</span>
                  ) : null}
                </div>
              </div>
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={closeDetail}>
                닫기
              </button>
            </div>

            <div className="admin-modal__body admin-review-detail-modal__body">
              {selectedIsPhoto ? (
                <section className="admin-review-detail-card admin-review-detail-card--photos">
                  <h4 className="admin-review-detail-card__title">사진</h4>
                  <div className="admin-review-photo-grid">
                    {selectedPhotos.map((src, i) => (
                      <ReviewPhotoThumb
                        key={`${src}-${i}`}
                        src={src}
                        alt={`리뷰 사진 ${i + 1}`}
                        size="detail"
                        onClick={() => setLightboxSrc(src)}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <p className="admin-review-detail-no-photo">사진 없음</p>
              )}

              <div className="admin-review-detail-modal__grid">
                <section className="admin-review-detail-card">
                  <h4 className="admin-review-detail-card__title">리뷰 요약</h4>
                  <div className="admin-review-detail-summary">
                    <RatingBadge rating={selected.rating} />
                    {selected.summary?.trim() ? (
                      <p className="admin-review-detail-summary__title">{selected.summary}</p>
                    ) : null}
                    <p className="admin-review-detail-summary__content">{selected.content}</p>
                    <dl className="admin-review-detail-meta">
                      <div>
                        <dt>등록일</dt>
                        <dd>{formatReviewDateTime(selected.createdAt)}</dd>
                      </div>
                      <div>
                        <dt>작성자</dt>
                        <dd>{selected.authorName}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section className="admin-review-detail-card">
                  <h4 className="admin-review-detail-card__title">상품 정보</h4>
                  <dl className="admin-review-detail-fields">
                    <div>
                      <dt>상품/규격</dt>
                      <dd>{productPrimary(selected)}</dd>
                    </div>
                    {selected.batteryCode?.trim() ? (
                      <div>
                        <dt>배터리 규격</dt>
                        <dd>{selected.batteryCode}</dd>
                      </div>
                    ) : null}
                    {productSecondary(selected) ? (
                      <div>
                        <dt>차량명</dt>
                        <dd>{productSecondary(selected)}</dd>
                      </div>
                    ) : null}
                    {fulfillmentLabel(selected) ? (
                      <div>
                        <dt>수령/장착</dt>
                        <dd>{fulfillmentLabel(selected)}</dd>
                      </div>
                    ) : null}
                    {selected.orderId ? (
                      <div>
                        <dt>주문번호</dt>
                        <dd>
                          <AdminOrderNumberButton
                            orderId={selected.orderId}
                            orderNumber={selected.orderId}
                            onOpen={setOrderModalId}
                          />
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              </div>

              <section className="admin-review-detail-card admin-review-detail-card--reply">
                <h4 className="admin-review-detail-card__title">운영자 답변</h4>
                {selectedHasReply ? (
                  <div className="admin-review-existing-reply">
                    <p className="admin-review-existing-reply__label">답변완료 · 고객 노출 중</p>
                    <p className="admin-review-existing-reply__text">{selected.operatorReply}</p>
                  </div>
                ) : (
                  <p className="admin-review-reply-hint">아직 등록된 답변이 없습니다.</p>
                )}
                <label className="admin-review-reply-label">
                  <span className="sr-only">운영자 답변 입력</span>
                  <textarea
                    className="admin-review-reply-textarea"
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="고객에게 보여질 답변을 입력하세요."
                    rows={6}
                  />
                </label>
                <div className="admin-review-reply-actions">
                  {selectedHasReply ? (
                    <>
                      <button
                        type="button"
                        className="admin-btn admin-btn--primary admin-btn--md"
                        disabled={saving || !replyDraft.trim()}
                        onClick={() => void saveReply()}
                      >
                        답변 수정
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--md text-red-600"
                        disabled={saving}
                        onClick={() => setDeleteReplyOpen(true)}
                      >
                        답글 삭제
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary admin-btn--md"
                      disabled={saving || !replyDraft.trim()}
                      onClick={() => void saveReply()}
                    >
                      답변 등록
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="admin-modal__footer admin-review-detail-modal__footer">
              <button type="button" className="admin-btn admin-btn--secondary admin-btn--md" onClick={closeDetail}>
                닫기
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--md"
                disabled={saving || !replyDraft.trim()}
                onClick={() => void saveReply()}
              >
                {selectedHasReply ? "답변 수정" : "답변 등록"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lightboxSrc ? (
        <div className="admin-review-lightbox" role="dialog" aria-modal="true" aria-label="사진 크게 보기">
          <button type="button" className="admin-review-lightbox__backdrop" aria-label="닫기" onClick={() => setLightboxSrc(null)} />
          <div className="admin-review-lightbox__panel">
            <button type="button" className="admin-review-lightbox__close" onClick={() => setLightboxSrc(null)}>
              닫기
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxSrc} alt="리뷰 사진 확대" className="admin-review-lightbox__image" />
          </div>
        </div>
      ) : null}

      <AdminOrderDetailModal orderId={orderModalId} onClose={() => setOrderModalId(null)} />

      <AdminDangerActionDialog
        open={deleteReplyOpen}
        config={dangerConfigReviewReplyDelete()}
        loading={saving}
        error={deleteReplyError}
        onClose={() => {
          if (saving) return;
          setDeleteReplyOpen(false);
          setDeleteReplyError(null);
        }}
        onConfirm={() => void deleteReply()}
      />
    </div>
  );
}
