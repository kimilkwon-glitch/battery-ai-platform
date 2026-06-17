"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminReplyTemplateBar } from "@/components/admin/AdminReplyTemplateBar";
import {
  AdminRichTextEditor,
} from "@/components/admin/AdminRichTextEditor";
import { AdminQuickFilterChips } from "@/components/admin/AdminQuickFilterChips";
import { insertAdminReplyTemplate } from "@/lib/admin/insert-admin-reply-template";
import { Badge } from "@/components/ui/badge";
import { INQUIRY_STATUS_BADGE } from "@/lib/admin/admin-status-tokens";
import { brands, getBattery } from "@/lib/platform-data";
import { INQUIRY_STATUS_LABELS, type CustomerInquiryRecord, type InquiryStatus } from "@/types/customer-inquiry";

const STATUS_CHIPS = [
  { id: "new", label: "답변대기" },
  { id: "in_progress", label: "진행중" },
  { id: "done", label: "처리완료" },
  { id: "on_hold", label: "보류" },
  { id: "all", label: "전체" },
] as const;

function productBrandLabel(batteryCode?: string): string {
  if (!batteryCode) return "—";
  try {
    const battery = getBattery(batteryCode);
    return brands.find((b) => b.id === battery.brandId)?.displayName ?? "—";
  } catch {
    return "—";
  }
}

function productPageUrl(record: CustomerInquiryRecord): string | null {
  if (record.pageUrl?.trim()) return record.pageUrl.trim();
  if (record.batteryCode?.trim()) return `/batteries/${encodeURIComponent(record.batteryCode.trim())}`;
  return null;
}

export function AdminProductQnaClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || "";
  const [items, setItems] = useState<CustomerInquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChip, setStatusChip] = useState<string>("new");
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [memoEditorHtml, setMemoEditorHtml] = useState("");
  const [memoDirty, setMemoDirty] = useState(false);
  const storedMemoRef = useRef("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/product-qna?limit=500", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((row) => {
      if (statusChip === "new" && row.status !== "new") return false;
      if (statusChip === "in_progress" && row.status !== "in_progress") return false;
      if (statusChip === "done" && row.status !== "done") return false;
      if (statusChip === "on_hold" && row.status !== "on_hold") return false;
      if (!q) return true;
      return (
        row.title?.toLowerCase().includes(q) ||
        row.message.toLowerCase().includes(q) ||
        row.batteryCode?.toLowerCase().includes(q) ||
        row.productName?.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q)
      );
    });
  }, [items, statusChip, query]);

  const selected = filtered.find((i) => i.id === selectedId) ?? items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    const stored = selected?.adminMemo ?? "";
    storedMemoRef.current = stored;
    setMemoEditorHtml(stored);
    setMemoDirty(false);
  }, [selected?.id, selected?.adminMemo]);

  const resolveMemoPayload = () => (memoDirty ? memoEditorHtml.trim() : storedMemoRef.current);

  const patch = async (patchBody: { status?: InquiryStatus; adminMemo?: string; hidden?: boolean }) => {
    if (!selected) return false;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/inquiries/${selected.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "저장에 실패했습니다.");
      return false;
    }
    setItems((prev) => prev.map((i) => (i.id === selected.id ? data.item : i)));
    if (patchBody.adminMemo !== undefined && data.item) {
      storedMemoRef.current = data.item.adminMemo ?? "";
      setMemoEditorHtml(data.item.adminMemo ?? "");
      setMemoDirty(false);
    }
    if (patchBody.status === "done" && statusChip === "new") {
      setSelectedId(null);
    }
    return true;
  };

  const handleReply = async () => {
    const memo = resolveMemoPayload();
    if (!memo.trim()) {
      setError("답변 내용을 입력해 주세요.");
      return;
    }
    if (!memoDirty && storedMemoRef.current.trim()) {
      await patch({ adminMemo: storedMemoRef.current, status: "done" });
      return;
    }
    await patch({ adminMemo: memo, status: "done" });
  };

  const handleMemoSave = async () => {
    if (!memoDirty) return;
    const memo = resolveMemoPayload();
    await patch({ adminMemo: memo });
  };

  const handleTemplateInsert = (templateBody: string) => {
    const current = memoDirty ? memoEditorHtml : storedMemoRef.current;
    const next = insertAdminReplyTemplate(current, templateBody);
    setMemoEditorHtml(next);
    setMemoDirty(true);
  };

  const selectedBrand = selected ? productBrandLabel(selected.batteryCode) : "—";
  const selectedProductUrl = selected ? productPageUrl(selected) : null;

  return (
    <div className="admin-product-qna admin-inquiry-reply-layout admin-inquiry-reply-layout--wide">
      <section className="admin-product-qna__list admin-panel p-0">
        <div className="admin-product-qna__filters space-y-3 p-3">
          <AdminQuickFilterChips
            chips={STATUS_CHIPS.map((c) => ({ id: c.id, label: c.label }))}
            activeId={statusChip}
            onChange={(id) => setStatusChip(id ?? "new")}
          />
          <input
            className="admin-toolbar__search w-full"
            placeholder="상품명·규격·작성자·문의내용·주문번호 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error ? (
          <p className="mx-3 mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="admin-inquiries__empty">불러오는 중…</p>
        ) : filtered.length === 0 ? (
          <div className="admin-inquiries__empty">
            <p className="font-bold text-slate-700">답변 대기 중인 상품 문의가 없습니다.</p>
            <p className="mt-1 text-slate-500">상품 상세 Q&A에서 등록된 문의가 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <ul className="admin-product-qna__items">
            {filtered.map((row) => {
              const brand = productBrandLabel(row.batteryCode);
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    className={`admin-product-qna__item${row.id === selectedId ? " admin-product-qna__item--active" : ""}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <div className="admin-product-qna__item-badges">
                      <Badge variant={INQUIRY_STATUS_BADGE[row.status]}>
                        {row.status === "new" ? "답변대기" : INQUIRY_STATUS_LABELS[row.status]}
                      </Badge>
                      {row.isSecret ? <Badge variant="muted">비밀글</Badge> : null}
                    </div>
                    <p className="admin-product-qna__item-title">{row.productName ?? row.batteryCode ?? "상품 문의"}</p>
                    <p className="admin-product-qna__item-meta">
                      {brand} · {row.batteryCode ?? "—"}
                    </p>
                    <p className="admin-product-qna__item-preview">
                      {row.title ?? row.message.slice(0, 60)}
                    </p>
                    <p className="admin-product-qna__item-foot">
                      {row.name} · {formatDate(row.createdAt)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-product-qna__detail admin-panel">
        {!selected ? (
          <div className="admin-inquiries__detail-empty">
            <p className="admin-inquiries__detail-empty-title">상품 문의를 선택하세요</p>
            <p className="admin-inquiries__detail-empty-desc">
              목록에서 문의를 선택하면 상품 정보와 답변을 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="admin-product-qna__detail-inner">
            <section className="admin-product-qna__product-card">
              <h3 className="admin-inquiries__section-title">상품 정보</h3>
              <dl className="admin-inquiries__dl">
                <DetailRow label="상품명" value={selected.productName ?? selected.batteryCode ?? "—"} />
                <DetailRow label="규격" value={selected.batteryCode ?? "—"} />
                <DetailRow label="브랜드" value={selectedBrand} />
              </dl>
              {selectedProductUrl ? (
                <Link href={selectedProductUrl} className="admin-panel__link mt-2 inline-block" target="_blank">
                  상품 페이지 보기 →
                </Link>
              ) : null}
            </section>

            <section className="admin-inquiries__section">
              <h3 className="admin-inquiries__section-title">고객 정보</h3>
              <dl className="admin-inquiries__dl">
                <DetailRow label="작성자" value={selected.name} />
                <DetailRow label="연락처" value={selected.contact || "—"} />
                <DetailRow label="접수일" value={formatDate(selected.createdAt)} />
              </dl>
            </section>

            <section className="admin-inquiries__section">
              <h3 className="admin-inquiries__section-title">문의 내용</h3>
              <p className="admin-inquiries__message">{selected.message}</p>
            </section>

            <section className="admin-inquiries__section">
              <h3 className="admin-inquiries__section-title">관리자 답변</h3>
              <AdminReplyTemplateBar
                currentValue={memoEditorHtml}
                onInsert={handleTemplateInsert}
                label="답변 템플릿"
              />
              <AdminRichTextEditor
                variant="qna"
                value={memoEditorHtml}
                storedValue={storedMemoRef.current}
                placeholder="고객에게 표시될 답변을 입력하세요"
                disabled={saving}
                onChange={(html, { dirty }) => {
                  setMemoEditorHtml(html);
                  setMemoDirty(dirty);
                }}
              />
            </section>

            <div className="admin-inquiries__detail-actions">
              <button
                type="button"
                disabled={saving}
                className="admin-btn admin-btn--primary admin-btn--md"
                onClick={() => void handleReply()}
              >
                답변 등록
              </button>
              <button
                type="button"
                disabled={saving}
                className="admin-btn admin-btn--secondary admin-btn--md"
                onClick={() => void handleMemoSave()}
              >
                임시 저장
              </button>
              <button
                type="button"
                disabled={saving}
                className="admin-btn admin-btn--ghost admin-btn--md"
                onClick={() => void patch({ hidden: true })}
              >
                숨김
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-inquiries__dl-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}
