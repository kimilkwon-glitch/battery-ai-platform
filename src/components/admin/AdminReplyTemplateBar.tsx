"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminBatteryTalkTemplateManager } from "@/components/admin/AdminBatteryTalkTemplateManager";
import {
  insertAdminReplyTemplate,
  previewAdminReplyTemplate,
} from "@/lib/admin/insert-admin-reply-template";
import type { BatteryTalkReplyTemplate } from "@/types/battery-talk-reply-template";

type Props = {
  onInsert: (nextValue: string) => void;
  currentValue?: string;
  label?: string;
  className?: string;
};

export function AdminReplyTemplateBar({
  onInsert,
  currentValue = "",
  label = "템플릿 선택",
  className,
}: Props) {
  const [templates, setTemplates] = useState<BatteryTalkReplyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/battery-talk/reply-templates", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) setTemplates(data.templates ?? []);
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const enabledTemplates = useMemo(
    () => templates.filter((t) => t.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    [templates],
  );

  const visibleTemplates = showAll ? enabledTemplates : enabledTemplates.slice(0, 8);
  const previewTemplate = enabledTemplates.find((t) => t.id === previewId) ?? null;

  const handleInsert = (tpl: BatteryTalkReplyTemplate) => {
    onInsert(insertAdminReplyTemplate(currentValue, tpl.body));
    setPreviewId(tpl.id);
  };

  return (
    <div className={`admin-reply-template${className ? ` ${className}` : ""}`}>
      <div className="admin-reply-template__head">
        <span className="admin-reply-template__label">{label}</span>
        <button
          type="button"
          className="admin-reply-template__manage"
          onClick={() => setManagerOpen(true)}
        >
          관리
        </button>
      </div>

      {loading ? (
        <p className="admin-reply-template__loading">템플릿 불러오는 중…</p>
      ) : enabledTemplates.length === 0 ? (
        <p className="admin-reply-template__empty">등록된 템플릿이 없습니다.</p>
      ) : (
        <>
          <div className="admin-reply-template__pills" role="list" aria-label="자주 쓰는 답변">
            {visibleTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                role="listitem"
                className={`admin-reply-template__pill${previewId === tpl.id ? " admin-reply-template__pill--picked" : ""}`}
                title={previewAdminReplyTemplate(tpl.body, 120)}
                onMouseEnter={() => setPreviewId(tpl.id)}
                onFocus={() => setPreviewId(tpl.id)}
                onClick={() => handleInsert(tpl)}
              >
                {tpl.name}
              </button>
            ))}
            {enabledTemplates.length > 8 ? (
              <button
                type="button"
                className="admin-reply-template__pill admin-reply-template__pill--more"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "접기" : "더보기"}
              </button>
            ) : null}
          </div>

          {previewTemplate ? (
            <p className="admin-reply-template__preview">{previewAdminReplyTemplate(previewTemplate.body)}</p>
          ) : null}

          <label className="admin-reply-template__select-wrap">
            <span className="sr-only">템플릿 선택</span>
            <select
              className="admin-reply-template__select"
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                const tpl = enabledTemplates.find((t) => t.id === id);
                if (tpl) handleInsert(tpl);
                e.target.value = "";
              }}
            >
              <option value="">목록에서 선택…</option>
              {enabledTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <AdminBatteryTalkTemplateManager
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        onUpdated={(next) => {
          setTemplates(next);
          void loadTemplates();
        }}
      />
    </div>
  );
}
