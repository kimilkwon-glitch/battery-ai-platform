"use client";

import { useEffect, useState } from "react";
import {
  BATTERY_TALK_REPLY_TEMPLATE_CATEGORY_LABELS,
  type BatteryTalkReplyTemplate,
  type BatteryTalkReplyTemplateCategory,
} from "@/types/battery-talk-reply-template";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpdated: (templates: BatteryTalkReplyTemplate[]) => void;
};

const CATEGORIES = Object.keys(
  BATTERY_TALK_REPLY_TEMPLATE_CATEGORY_LABELS,
) as BatteryTalkReplyTemplateCategory[];

const EMPTY_FORM = {
  name: "",
  body: "",
  category: "other" as BatteryTalkReplyTemplateCategory,
  enabled: true,
};

export function AdminBatteryTalkTemplateManager({ open, onClose, onUpdated }: Props) {
  const [templates, setTemplates] = useState<BatteryTalkReplyTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/battery-talk/reply-templates", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) {
      setTemplates(data.templates ?? []);
      onUpdated(data.templates ?? []);
    }
  };

  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const saveTemplate = async () => {
    if (!form.name.trim() || !form.body.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/battery-talk/reply-templates", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId ?? undefined,
        name: form.name,
        body: form.body,
        category: form.category,
        enabled: form.enabled,
        sortOrder: editingId
          ? templates.find((t) => t.id === editingId)?.sortOrder
          : templates.length,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.ok) {
      setTemplates(data.templates);
      onUpdated(data.templates);
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const removeTemplate = async (id: string) => {
    if (!confirm("이 템플릿을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/battery-talk/reply-templates?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setTemplates(data.templates);
      onUpdated(data.templates);
    }
  };

  if (!open) return null;

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" aria-label="닫기" onClick={onClose} />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">빠른답변 템플릿 관리</h3>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="admin-modal__body space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-sm font-bold text-slate-800">
              {editingId ? "템플릿 수정" : "새 템플릿 추가"}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="admin-toolbar__search"
                placeholder="템플릿명"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <select
                className="admin-toolbar__search"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as BatteryTalkReplyTemplateCategory,
                  }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {BATTERY_TALK_REPLY_TEMPLATE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="admin-battery-talk__reply-input min-h-[88px]"
              placeholder="답변 내용"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
              사용함
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--md"
                disabled={saving}
                onClick={() => void saveTemplate()}
              >
                {editingId ? "수정 저장" : "추가"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--md"
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                  }}
                >
                  취소
                </button>
              ) : null}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">불러오는 중…</p>
          ) : (
            <ul className="space-y-2 max-h-[360px] overflow-y-auto">
              {templates.map((tpl) => (
                <li
                  key={tpl.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">
                      {tpl.name}
                      {!tpl.enabled ? (
                        <span className="ml-2 text-xs font-semibold text-slate-400">사용중지</span>
                      ) : null}
                    </p>
                    <p className="text-xs font-semibold text-blue-700">
                      {BATTERY_TALK_REPLY_TEMPLATE_CATEGORY_LABELS[tpl.category]}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{tpl.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => {
                        setEditingId(tpl.id);
                        setForm({
                          name: tpl.name,
                          body: tpl.body,
                          category: tpl.category,
                          enabled: tpl.enabled,
                        });
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm text-red-600"
                      onClick={() => void removeTemplate(tpl.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
