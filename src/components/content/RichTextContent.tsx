"use client";

import { useEffect, useMemo } from "react";
import { looksLikeHtml, plainTextToEditorHtml } from "@/lib/content/rich-text-content";
import { sanitizeNoticeHtml } from "@/lib/content/sanitize-notice-html.shared";
import { sanitizeQnaAnswerHtml } from "@/lib/content/sanitize-qna-answer";

type Props = {
  content: string;
  mode?: "qna" | "guide";
  className?: string;
};

/** 고객·관리자 미리보기 — plain text·HTML 모두 호환 */
export function RichTextContent({ content, mode = "qna", className }: Props) {
  const safeHtml = useMemo(() => {
    const raw = content ?? "";
    if (!raw.trim()) return "";
    if (looksLikeHtml(raw)) {
      return mode === "guide" ? sanitizeNoticeHtml(raw) : sanitizeQnaAnswerHtml(raw);
    }
    return plainTextToEditorHtml(raw);
  }, [content, mode]);

  if (!safeHtml) return null;

  const isPlainOnly = !looksLikeHtml(content ?? "");

  return (
    <div
      className={
        className
          ? `${className} rich-text-content${isPlainOnly ? " rich-text-content--plain" : ""} prose prose-sm max-w-none`
          : `rich-text-content${isPlainOnly ? " rich-text-content--plain" : ""} prose prose-sm max-w-none`
      }
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
